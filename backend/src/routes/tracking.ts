import { getSupabase, isHanzReferenceSchemaReady, isSupabaseConfigured, type ShipmentRow, type TrackingEventRow } from '../db/supabase.js'
import { isHanzReference, nextHanzReference } from '../services/hanzReference.js'
import {
  getTrackingInfo,
  isTrackingApiConfigured,
  normalizeWebhookPayload,
  registerTrackingNumber,
  type NormalizedTracking,
} from '../services/trackingProvider.js'
import { Router, type Request, type Response } from 'express'

const router = Router()

export type TrackApiResponse = {
  hanzReference: string | null
  awb: string | null
  trackingNumber: string
  carrier: string | null
  status: string | null
  origin: string | null
  destination: string | null
  lastLocation: string | null
  lastUpdated: string | null
  events: Array<{
    status: string
    location: string
    description: string
    time: string
  }>
  unavailable?: boolean
  message?: string
}

type StoredShipmentView = NormalizedTracking & {
  id: string
  hanzReference: string | null
  awb: string | null
}

function validateLookup(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length < 4 || trimmed.length > 64) return null
  if (!/^[A-Za-z0-9][A-Za-z0-9\-_./ ]*$/.test(trimmed)) return null
  return trimmed.toUpperCase()
}

function requireOpsKey(req: Request, res: Response): boolean {
  const configured = process.env.OPS_API_KEY?.trim()
  if (!configured) return true
  const header = req.header('x-ops-key') || req.header('authorization')?.replace(/^Bearer\s+/i, '')
  if (header && header === configured) return true
  res.status(401).json({ error: 'UNAUTHORIZED', message: 'Valid operations key required.' })
  return false
}

function toApiResponse(data: {
  hanzReference: string | null
  awb: string | null
  trackingNumber: string
  carrier: string
  status: string
  origin: string
  destination: string
  lastLocation: string
  lastUpdated: string
  events: NormalizedTracking['events']
}): TrackApiResponse {
  return {
    hanzReference: data.hanzReference,
    awb: data.awb,
    trackingNumber: data.trackingNumber,
    carrier: data.carrier || null,
    status: data.status || null,
    origin: data.origin || null,
    destination: data.destination || null,
    lastLocation: data.lastLocation || null,
    lastUpdated: data.lastUpdated || null,
    events: data.events.map((event) => ({
      status: event.status,
      location: event.location,
      description: event.description,
      time: event.time,
    })),
  }
}

function shipmentToView(shipment: ShipmentRow, events: TrackingEventRow[]): StoredShipmentView {
  const normalizedEvents = events.map((event) => ({
    status: event.status ?? 'Update',
    location: event.location ?? '',
    description: event.description ?? '',
    time: event.event_time ?? '',
  }))

  const awb = shipment.awb ?? shipment.tracking_number ?? null
  const hanzReference = shipment.hanz_reference ?? null

  return {
    id: shipment.id,
    hanzReference,
    awb,
    trackingNumber: awb || hanzReference || '',
    carrier: shipment.carrier ?? '',
    status: shipment.status ?? '',
    origin: shipment.origin ?? '',
    destination: shipment.destination ?? '',
    lastLocation: shipment.last_location ?? '',
    lastUpdated: shipment.last_updated ?? '',
    events: normalizedEvents,
    available: Boolean(shipment.status || shipment.last_location || normalizedEvents.length),
  }
}

async function findShipmentByLookup(lookup: string): Promise<ShipmentRow | null> {
  const supabase = getSupabase()
  const hanzReady = await isHanzReferenceSchemaReady()

  if (hanzReady && isHanzReference(lookup)) {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('hanz_reference', lookup)
      .maybeSingle<ShipmentRow>()
    if (error) throw error
    return data
  }

  if (hanzReady) {
    const byAwb = await supabase.from('shipments').select('*').eq('awb', lookup).maybeSingle<ShipmentRow>()
    if (byAwb.error) throw byAwb.error
    if (byAwb.data) return byAwb.data
  }

  const byLegacy = await supabase
    .from('shipments')
    .select('*')
    .eq('tracking_number', lookup)
    .maybeSingle<ShipmentRow>()
  if (byLegacy.error) throw byLegacy.error
  return byLegacy.data
}

async function loadStoredShipment(lookup: string): Promise<StoredShipmentView | null> {
  const shipment = await findShipmentByLookup(lookup)
  if (!shipment) return null

  const supabase = getSupabase()
  const { data: events, error: eventsError } = await supabase
    .from('tracking_events')
    .select('*')
    .eq('shipment_id', shipment.id)
    .order('event_time', { ascending: false })
    .returns<TrackingEventRow[]>()

  if (eventsError) throw eventsError
  return shipmentToView(shipment, events ?? [])
}

async function replaceEvents(shipmentId: string, events: NormalizedTracking['events']): Promise<void> {
  if (!events.length) return
  const supabase = getSupabase()

  const { error: deleteError } = await supabase.from('tracking_events').delete().eq('shipment_id', shipmentId)
  if (deleteError) throw deleteError

  const rows = events.map((event) => ({
    shipment_id: shipmentId,
    status: event.status || null,
    location: event.location || null,
    description: event.description || null,
    event_time: event.time ? new Date(event.time).toISOString() : null,
  }))

  const { error: insertError } = await supabase.from('tracking_events').insert(rows)
  if (insertError) throw insertError
}

async function persistProviderTracking(
  data: NormalizedTracking,
  options?: { hanzReference?: string | null; shipmentId?: string },
): Promise<StoredShipmentView> {
  const supabase = getSupabase()
  const awb = data.trackingNumber
  const hanzReady = await isHanzReferenceSchemaReady()

  let shipment = options?.shipmentId
    ? (
        await supabase.from('shipments').select('*').eq('id', options.shipmentId).maybeSingle<ShipmentRow>()
      ).data
    : await findShipmentByLookup(awb)

  const basePayload = {
    carrier: data.carrier || null,
    origin: data.origin || null,
    destination: data.destination || null,
    status: data.status || null,
    last_location: data.lastLocation || null,
    last_updated: data.lastUpdated ? new Date(data.lastUpdated).toISOString() : new Date().toISOString(),
    tracking_number: awb,
  }

  const statusPayload = hanzReady ? { ...basePayload, awb } : basePayload

  if (!shipment) {
    const insertPayload = hanzReady
      ? {
          hanz_reference: options?.hanzReference || (await nextHanzReference()),
          ...statusPayload,
        }
      : statusPayload

    const { data: created, error } = await supabase
      .from('shipments')
      .insert(insertPayload)
      .select('*')
      .single<ShipmentRow>()
    if (error) throw error
    shipment = created
  } else {
    const { data: updated, error } = await supabase
      .from('shipments')
      .update(statusPayload)
      .eq('id', shipment.id)
      .select('*')
      .single<ShipmentRow>()
    if (error) throw error
    shipment = updated
  }

  await replaceEvents(shipment.id, data.events)

  const { data: events, error: eventsError } = await supabase
    .from('tracking_events')
    .select('*')
    .eq('shipment_id', shipment.id)
    .order('event_time', { ascending: false })
    .returns<TrackingEventRow[]>()
  if (eventsError) throw eventsError

  return shipmentToView(shipment, events ?? [])
}

async function refreshFromProvider(awb: string, shipment?: StoredShipmentView | null): Promise<StoredShipmentView | null> {
  if (!isTrackingApiConfigured()) return shipment ?? null

  await registerTrackingNumber(awb)
  await new Promise((resolve) => setTimeout(resolve, 1200))
  const fresh = await getTrackingInfo(awb)
  if (!fresh) return shipment ?? null

  return persistProviderTracking(fresh, {
    shipmentId: shipment?.id,
    hanzReference: shipment?.hanzReference,
  })
}

function databaseErrorResponse(res: Response, message: string) {
  return res.status(503).json({
    error: 'DATABASE_ERROR',
    message,
  })
}

router.post('/track', async (req: Request, res: Response) => {
  try {
    const lookup = validateLookup(req.body?.trackingNumber)
    if (!lookup) {
      return res.status(400).json({
        error: 'INVALID_TRACKING_NUMBER',
        message: 'Enter a valid Hanz reference or AWB.',
      })
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'Tracking storage is not configured.',
      })
    }

    const existing = await loadStoredShipment(lookup)

    // Hanz reference lookup: return stored shipment; refresh via AWB when present.
    if (isHanzReference(lookup)) {
      if (!(await isHanzReferenceSchemaReady())) {
        return res.status(503).json({
          error: 'SCHEMA_PENDING',
          message: 'Hanz reference tracking requires the database migration to be applied.',
        })
      }

      if (!existing) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Hanz reference not found.',
          trackingNumber: lookup,
        })
      }

      let view = existing
      if (existing.awb && isTrackingApiConfigured()) {
        try {
          const refreshed = await refreshFromProvider(existing.awb, existing)
          if (refreshed) {
            view = (existing.hanzReference && (await loadStoredShipment(existing.hanzReference))) || refreshed
          }
        } catch (providerError) {
          console.error('[POST /api/track] provider refresh', providerError)
          // Fall back to stored Hanz shipment data.
        }
      }

      const response = toApiResponse({
        hanzReference: view.hanzReference,
        awb: view.awb,
        trackingNumber: view.hanzReference || view.trackingNumber,
        carrier: view.carrier,
        status: view.status,
        origin: view.origin,
        destination: view.destination,
        lastLocation: view.lastLocation,
        lastUpdated: view.lastUpdated,
        events: view.events,
      })

      if (!view.available && !view.awb) {
        return res.status(200).json({
          ...response,
          unavailable: true,
          message: 'Tracking information unavailable. No carrier AWB is linked to this Hanz reference yet.',
        })
      }

      if (!view.available) {
        return res.status(200).json({
          ...response,
          unavailable: true,
          message: 'Tracking information unavailable.',
        })
      }

      return res.status(200).json(response)
    }

    // AWB / legacy carrier number path.
    if (existing?.available && existing.events.length) {
      return res.status(200).json(
        toApiResponse({
          hanzReference: existing.hanzReference,
          awb: existing.awb,
          trackingNumber: existing.awb || existing.trackingNumber,
          carrier: existing.carrier,
          status: existing.status,
          origin: existing.origin,
          destination: existing.destination,
          lastLocation: existing.lastLocation,
          lastUpdated: existing.lastUpdated,
          events: existing.events,
        }),
      )
    }

    if (!isTrackingApiConfigured()) {
      if (existing) {
        return res.status(200).json({
          ...toApiResponse({
            hanzReference: existing.hanzReference,
            awb: existing.awb,
            trackingNumber: existing.awb || existing.trackingNumber,
            carrier: existing.carrier,
            status: existing.status,
            origin: existing.origin,
            destination: existing.destination,
            lastLocation: existing.lastLocation,
            lastUpdated: existing.lastUpdated,
            events: existing.events,
          }),
          unavailable: !existing.available,
          message: existing.available ? undefined : 'Tracking information unavailable.',
        })
      }
      return res.status(503).json({
        error: 'PROVIDER_UNAVAILABLE',
        message: 'Tracking provider is not configured.',
      })
    }

    await registerTrackingNumber(lookup)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const fresh = await getTrackingInfo(lookup)

    if (!fresh) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Tracking number not found.',
        trackingNumber: lookup,
      })
    }

    const saved = await persistProviderTracking(fresh, {
      shipmentId: existing?.id,
      hanzReference: existing?.hanzReference,
    })

    const response = toApiResponse({
      hanzReference: saved.hanzReference,
      awb: saved.awb,
      trackingNumber: saved.awb || lookup,
      carrier: fresh.carrier,
      status: fresh.status,
      origin: fresh.origin,
      destination: fresh.destination,
      lastLocation: fresh.lastLocation,
      lastUpdated: fresh.lastUpdated,
      events: fresh.events,
    })

    if (!fresh.available) {
      return res.status(200).json({
        ...response,
        unavailable: true,
        message: 'Tracking information unavailable.',
      })
    }

    return res.status(200).json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected tracking error.'
    console.error('[POST /api/track]', message)

    const looksLikeDb =
      typeof error === 'object' &&
      error !== null &&
      ('code' in error || 'hint' in error || 'details' in error) &&
      !message.startsWith('17TRACK')

    if (looksLikeDb || /supabase|database|PGRST/i.test(message)) {
      return databaseErrorResponse(res, 'Tracking storage failed while saving shipment data.')
    }

    return res.status(502).json({
      error: 'PROVIDER_ERROR',
      message: 'Unable to retrieve tracking information right now.',
    })
  }
})

/** Create a Hanz shipment record (operations). Optional AWB enables later 17TRACK refresh. */
router.post('/shipments', async (req: Request, res: Response) => {
  try {
    if (!requireOpsKey(req, res)) return

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        error: 'DATABASE_UNAVAILABLE',
        message: 'Tracking storage is not configured.',
      })
    }

    if (!(await isHanzReferenceSchemaReady())) {
      return res.status(503).json({
        error: 'SCHEMA_PENDING',
        message: 'Apply backend/sql/migration_hanz_reference.sql before creating Hanz shipments.',
      })
    }

    const awbRaw = typeof req.body?.awb === 'string' ? req.body.awb.trim().toUpperCase() : ''
    const awb = awbRaw ? validateLookup(awbRaw) : null
    if (awbRaw && !awb) {
      return res.status(400).json({ error: 'INVALID_AWB', message: 'Enter a valid AWB.' })
    }

    if (awb) {
      const existing = await findShipmentByLookup(awb)
      if (existing) {
        return res.status(409).json({
          error: 'AWB_EXISTS',
          message: 'A shipment with this AWB already exists.',
          hanzReference: existing.hanz_reference ?? null,
          awb: existing.awb ?? existing.tracking_number,
        })
      }
    }

    const hanzReference = await nextHanzReference()
    const supabase = getSupabase()
    const payload = {
      hanz_reference: hanzReference,
      awb: awb,
      tracking_number: awb,
      carrier: typeof req.body?.carrier === 'string' ? req.body.carrier.trim() || null : null,
      origin: typeof req.body?.origin === 'string' ? req.body.origin.trim() || null : null,
      destination: typeof req.body?.destination === 'string' ? req.body.destination.trim() || null : null,
      status: typeof req.body?.status === 'string' ? req.body.status.trim() || 'Booked' : 'Booked',
      last_location: typeof req.body?.lastLocation === 'string' ? req.body.lastLocation.trim() || null : null,
      last_updated: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('shipments').insert(payload).select('*').single<ShipmentRow>()
    if (error) {
      console.error('[POST /api/shipments] supabase insert failed', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        payload: {
          hanz_reference: payload.hanz_reference,
          awb: payload.awb,
          tracking_number: payload.tracking_number,
          origin: payload.origin,
          destination: payload.destination,
          status: payload.status,
        },
      })
      return res.status(503).json({
        error: 'DATABASE_ERROR',
        message: 'Unable to create Hanz shipment.',
        details: error.message,
        code: error.code,
      })
    }

    return res.status(201).json({
      id: data.id,
      hanzReference: data.hanz_reference,
      awb: data.awb ?? null,
      carrier: data.carrier,
      origin: data.origin,
      destination: data.destination,
      status: data.status,
      createdAt: data.created_at,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create shipment.'
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code ?? '') : undefined
    const details =
      typeof error === 'object' && error && 'details' in error
        ? String((error as { details?: unknown }).details ?? '')
        : undefined
    const hint =
      typeof error === 'object' && error && 'hint' in error
        ? String((error as { hint?: unknown }).hint ?? '')
        : undefined

    console.error('[POST /api/shipments]', { message, code, details, hint })
    return res.status(503).json({
      error: 'DATABASE_ERROR',
      message: 'Unable to create Hanz shipment.',
      details: message,
      ...(code ? { code } : {}),
    })
  }
})

router.post('/webhooks/17track', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ ok: false, message: 'Database not configured.' })
    }

    const updates = normalizeWebhookPayload(req.body)
    for (const update of updates) {
      if (!update.trackingNumber) continue
      await persistProviderTracking(update)
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed.'
    console.error('[POST /api/webhooks/17track]', message)
    return res.status(500).json({ ok: false })
  }
})

export default router
