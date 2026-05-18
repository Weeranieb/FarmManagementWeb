/** Short Thai month names (ม.ค. … ธ.ค.) — single source for pickers and labels. */
export const TH_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const

/** Short Thai weekday labels (อา … ส), Sunday-first. */
export const TH_WEEKDAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] as const

/** Format `YYYY-MM-DD` as `d ม.ค. พ.ศ.` */
export function formatYmdThaiShort(ymd: string, empty = '—'): string {
  if (!ymd) return empty
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return ymd
  return `${d} ${TH_MONTHS_SHORT[m - 1]} ${y + 543}`
}
