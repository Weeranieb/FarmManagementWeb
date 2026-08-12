/**
 * Thai time (ICT, UTC+7) utilities for parsing and formatting ISO/UTC timestamps.
 * Use for displaying "วันที่เริ่ม" and other dates in the BoonmaFarm UI.
 */

const THAI_TIMEZONE = 'Asia/Bangkok'
const THAI_LOCALE = 'th-TH'

function parseISO(iso: string | null | undefined): Date | null {
  if (iso == null || iso === '') return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Format a date in Thai time (ICT) for display – date only (e.g. "14 ก.พ. 2569").
 */
export function formatDateThai(iso: string | null | undefined): string {
  const d = parseISO(iso)
  if (!d) return '—'
  return d.toLocaleDateString(THAI_LOCALE, {
    timeZone: THAI_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
