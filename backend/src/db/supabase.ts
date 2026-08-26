import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type ShipmentRow = {
  id: string
  hanz_reference?: string | null
  awb?: string | null
  tracking_number: string | null
  carrier: string | null
  origin: string | null
  destination: string | null
  status: string | null
  last_location: string | null
  last_updated: string | null
  created_at: string
}

let hanzSchemaReady: boolean | null = null

/** True after migration_hanz_reference.sql (or fresh schema.sql) has been applied. */
export async function isHanzReferenceSchemaReady(): Promise<boolean> {
  if (hanzSchemaReady != null) return hanzSchemaReady
  const supabase = getSupabase()
  const { error } = await supabase.from('shipments').select('hanz_reference').limit(1)
  hanzSchemaReady = !error
  return hanzSchemaReady
}

export type TrackingEventRow = {
  id: string
  shipment_id: string
  status: string | null
  location: string | null
  description: string | null
  event_time: string | null
  created_at: string
}

let client: SupabaseClient | null = null

/** Supabase JS expects the project root URL, not /rest/v1. */
function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '')
  try {
    const parsed = new URL(trimmed)
    // Common paste mistake: https://xxx.supabase.co/rest/v1
    if (/\/rest\/v1$/i.test(parsed.pathname)) {
      parsed.pathname = '/'
      return parsed.origin
    }
    return trimmed
  } catch {
    return trimmed
  }
}

export function getSupabase(): SupabaseClient {
  if (client) return client

  const urlRaw = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!urlRaw || !key) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }

  const url = normalizeSupabaseUrl(urlRaw)

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return client
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
}
