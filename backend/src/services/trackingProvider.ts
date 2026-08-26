const TRACK17_BASE = 'https://api.17track.net/track/v2.4'

export type NormalizedTrackingEvent = {
  status: string
  location: string
  description: string
  time: string
}

export type NormalizedTracking = {
  trackingNumber: string
  carrier: string
  status: string
  origin: string
  destination: string
  lastLocation: string
  lastUpdated: string
  events: NormalizedTrackingEvent[]
  available: boolean
}

type Track17Address = {
  country?: string | null
  state?: string | null
  city?: string | null
  street?: string | null
  postal_code?: string | null
}

type Track17Event = {
  time_iso?: string | null
  time_utc?: string | null
  description?: string | null
  location?: string | null
  stage?: string | null
  sub_status?: string | null
  address?: Track17Address | null
}

type Track17Provider = {
  provider?: {
    key?: number
    name?: string | null
    alias?: string | null
  } | null
  events?: Track17Event[] | null
}

type Track17Accepted = {
  number?: string
  carrier?: number
  track_info?: {
    shipping_info?: {
      shipper_address?: Track17Address | null
      recipient_address?: Track17Address | null
    } | null
    latest_status?: {
      status?: string | null
      sub_status?: string | null
    } | null
    latest_event?: Track17Event | null
    tracking?: {
      providers?: Track17Provider[] | null
    } | null
    misc_info?: {
      local_provider?: string | null
    } | null
  } | null
}

type Track17Response = {
  code?: number
  data?: {
    accepted?: Track17Accepted[]
    rejected?: Array<{ number?: string; error?: { code?: number; message?: string } }>
  }
}

function requireApiKey(): string {
  const key = process.env.TRACKING_API_KEY?.trim()
  if (!key) {
    throw new Error('TRACKING_API_KEY is not configured.')
  }
  return key
}

async function track17Request(path: string, body: unknown): Promise<Track17Response> {
  // V2.4: POST https://api.17track.net/track/v2.4/{register|gettrackinfo}
  // Header: 17token; Body: JSON array of { number, ... }
  const response = await fetch(`${TRACK17_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      '17token': requireApiKey(),
    },
    body: JSON.stringify(body),
  })

  let payload: Track17Response
  try {
    payload = (await response.json()) as Track17Response
  } catch {
    throw new Error(`17TRACK returned a non-JSON response (HTTP ${response.status}).`)
  }

  // Auth / IP whitelist failures often arrive as HTTP 401 with a top-level code.
  if (!response.ok) {
    const apiCode = payload.code != null ? ` code ${payload.code}` : ''
    throw new Error(`17TRACK request failed with HTTP ${response.status}${apiCode}.`)
  }

  return payload
}

function emptyUnavailable(trackingNumber: string): NormalizedTracking {
  return {
    trackingNumber,
    carrier: '',
    status: '',
    origin: '',
    destination: '',
    lastLocation: '',
    lastUpdated: '',
    events: [],
    available: false,
  }
}

function formatAddress(address?: Track17Address | null): string {
  if (!address) return ''
  return [address.city, address.state, address.country, address.postal_code]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(', ')
}

function formatEventLocation(event?: Track17Event | null): string {
  if (!event) return ''
  const fromAddress = formatAddress(event.address)
  if (fromAddress) return fromAddress
  return (event.location ?? '').trim()
}

function collectEvents(accepted: Track17Accepted): NormalizedTrackingEvent[] {
  const providers = accepted.track_info?.tracking?.providers ?? []
  const events: NormalizedTrackingEvent[] = []

  for (const provider of providers) {
    for (const event of provider.events ?? []) {
      const time = (event.time_utc || event.time_iso || '').trim()
      const description = (event.description ?? '').trim()
      if (!time && !description) continue
      events.push({
        status: (event.stage || event.sub_status || '').trim() || 'Update',
        location: formatEventLocation(event),
        description: description || 'Tracking update',
        time,
      })
    }
  }

  events.sort((a, b) => {
    const aTime = Date.parse(a.time) || 0
    const bTime = Date.parse(b.time) || 0
    return bTime - aTime
  })

  return events
}

export function normalizeTrack17Accepted(accepted: Track17Accepted): NormalizedTracking {
  const trackingNumber = (accepted.number ?? '').trim()
  const events = collectEvents(accepted)
  const latest = accepted.track_info?.latest_event
  const status =
    (accepted.track_info?.latest_status?.status ?? '').trim() ||
    events[0]?.status ||
    ''
  const carrier =
    (accepted.track_info?.misc_info?.local_provider ?? '').trim() ||
    (accepted.track_info?.tracking?.providers?.[0]?.provider?.name ?? '').trim() ||
    (accepted.carrier != null ? String(accepted.carrier) : '')
  const origin = formatAddress(accepted.track_info?.shipping_info?.shipper_address)
  const destination = formatAddress(accepted.track_info?.shipping_info?.recipient_address)
  const lastLocation = formatEventLocation(latest) || events[0]?.location || ''
  const lastUpdated =
    (latest?.time_utc || latest?.time_iso || events[0]?.time || '').trim()

  const available = Boolean(status || events.length || lastLocation || lastUpdated)

  return {
    trackingNumber,
    carrier,
    status: status || (available ? 'Unknown' : 'Unavailable'),
    origin,
    destination,
    lastLocation,
    lastUpdated,
    events,
    available,
  }
}

export async function registerTrackingNumber(trackingNumber: string): Promise<void> {
  const payload = await track17Request('/register', [{ number: trackingNumber }])

  const accepted = payload.data?.accepted?.find(
    (item) => (item.number ?? '').toUpperCase() === trackingNumber.toUpperCase(),
  )
  if (accepted) return

  const rejected = payload.data?.rejected?.find(
    (item) => (item.number ?? '').toUpperCase() === trackingNumber.toUpperCase(),
  )
  const rejectedMessage = rejected?.error?.message ?? ''
  const rejectedCode = rejected?.error?.code

  // Already registered is acceptable for re-queries.
  if (
    rejectedCode === -18019901 ||
    /already/i.test(rejectedMessage) ||
    /registered/i.test(rejectedMessage)
  ) {
    return
  }

  // Top-level code 0 with a rejected item is a per-number failure, not a transport error.
  if (rejected) {
    throw new Error(rejectedMessage || `Tracking number was rejected by 17TRACK (${rejectedCode ?? 'unknown'}).`)
  }

  if (payload.code !== 0) {
    throw new Error(`17TRACK register failed with code ${payload.code ?? 'unknown'}.`)
  }
}

export async function getTrackingInfo(trackingNumber: string): Promise<NormalizedTracking | null> {
  const payload = await track17Request('/gettrackinfo', [{ number: trackingNumber }])

  const accepted = payload.data?.accepted?.find(
    (item) => (item.number ?? '').toUpperCase() === trackingNumber.toUpperCase(),
  )
  if (accepted?.number) {
    return normalizeTrack17Accepted(accepted)
  }

  const rejected = payload.data?.rejected?.find(
    (item) => (item.number ?? '').toUpperCase() === trackingNumber.toUpperCase(),
  )
  const rejectedCode = rejected?.error?.code

  // -18019909: registered but no tracking info yet → honest unavailable, not a hard miss.
  if (rejectedCode === -18019909) {
    return emptyUnavailable(trackingNumber)
  }

  // -18019902: not registered yet
  if (rejectedCode === -18019902 || rejected) {
    return null
  }

  if (payload.code !== 0) {
    throw new Error(`17TRACK gettrackinfo failed with code ${payload.code ?? 'unknown'}.`)
  }

  return null
}

export function normalizeWebhookPayload(body: unknown): NormalizedTracking[] {
  const payload = body as Track17Response & { event?: string; data?: { accepted?: Track17Accepted[] } }
  const accepted = payload?.data?.accepted ?? []
  return accepted
    .filter((item) => Boolean(item?.number))
    .map((item) => normalizeTrack17Accepted(item))
}

export function isTrackingApiConfigured(): boolean {
  return Boolean(process.env.TRACKING_API_KEY?.trim())
}
