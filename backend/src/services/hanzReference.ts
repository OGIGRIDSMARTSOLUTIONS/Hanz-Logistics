import { getSupabase } from '../db/supabase.js'

const HANZ_REF_PATTERN = /^HANZ-\d{6}-\d{4}$/i

export function isHanzReference(value: string): boolean {
  return HANZ_REF_PATTERN.test(value.trim())
}

/**
 * Allocates the next Hanz shipment reference for the UTC day.
 * Format: HANZ-YYMMDD-####
 */
export async function nextHanzReference(at: Date = new Date()): Promise<string> {
  const supabase = getSupabase()
  const dayKey = at.toISOString().slice(0, 10)
  const stamp = `${dayKey.slice(2, 4)}${dayKey.slice(5, 7)}${dayKey.slice(8, 10)}`

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data: row, error: readError } = await supabase
      .from('shipment_ref_counters')
      .select('last_seq')
      .eq('day_key', dayKey)
      .maybeSingle<{ last_seq: number }>()

    if (readError) throw readError

    if (!row) {
      const { data: inserted, error: insertError } = await supabase
        .from('shipment_ref_counters')
        .insert({ day_key: dayKey, last_seq: 1 })
        .select('last_seq')
        .maybeSingle<{ last_seq: number }>()

      if (!insertError && inserted) {
        return `HANZ-${stamp}-${String(inserted.last_seq).padStart(4, '0')}`
      }
      continue
    }

    const next = row.last_seq + 1
    const { data: updated, error: updateError } = await supabase
      .from('shipment_ref_counters')
      .update({ last_seq: next })
      .eq('day_key', dayKey)
      .eq('last_seq', row.last_seq)
      .select('last_seq')
      .maybeSingle<{ last_seq: number }>()

    if (updateError) throw updateError
    if (updated) {
      return `HANZ-${stamp}-${String(updated.last_seq).padStart(4, '0')}`
    }
  }

  throw new Error('Unable to allocate a unique Hanz reference number.')
}
