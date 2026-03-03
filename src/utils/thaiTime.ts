/**
 * Thai time (ICT, UTC+7) utilities for parsing and formatting ISO/UTC timestamps.
 * Use for displaying "วันที่เริ่ม" and other dates in the BoonmaFarm UI.
 */

const THAI_TIMEZONE = 'Asia/Bangkok'
const THAI_LOCALE = 'th-TH'

/**
 * Parse an ISO 8601 string (e.g. 2026-02-14T20:04:30.861196Z) to a Date.
 * Returns null if the string is empty or invalid.
 */
export function parseISO(iso: string | null | undefined): Date | null {
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

/**
 * Format a date and time in Thai time (ICT) (e.g. "14 ก.พ. 2569 03:04").
 */
export function formatDateTimeThai(iso: string | null | undefined): string {
  const d = parseISO(iso)
  if (!d) return '—'
  return d.toLocaleString(THAI_LOCALE, {
    timeZone: THAI_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format with full time including seconds (e.g. "14 ก.พ. 2569 03:04:30").
 */
export function formatDateTimeThaiFull(iso: string | null | undefined): string {
  const d = parseISO(iso)
  if (!d) return '—'
  return d.toLocaleString(THAI_LOCALE, {
    timeZone: THAI_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Format for compact display (e.g. "14/02/2569").
 */
export function formatDateThaiShort(iso: string | null | undefined): string {
  const d = parseISO(iso)
  if (!d) return '—'
  return d.toLocaleDateString(THAI_LOCALE, {
    timeZone: THAI_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Format relative to now (e.g. "เมื่อ 2 วันที่แล้ว") if within last 7 days; otherwise date.
 */
export function formatRelativeOrDateThai(
  iso: string | null | undefined,
): string {
  const d = parseISO(iso)
  if (!d) return '—'
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) {
    const diffMins = Math.floor(diffMs / (60 * 1000))
    if (diffMins < 1) return 'เมื่อสักครู่'
    if (diffMins < 60) return `เมื่อ ${diffMins} นาทีที่แล้ว`
    const h = Math.floor(diffMins / 60)
    return `เมื่อ ${h} ชั่วโมงที่แล้ว`
  }
  if (diffDays === 1) return 'เมื่อวาน'
  if (diffDays >= 2 && diffDays <= 7) return `เมื่อ ${diffDays} วันที่แล้ว`
  return formatDateThai(iso)
}
