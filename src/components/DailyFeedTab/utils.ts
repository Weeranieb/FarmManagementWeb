import type { DailyLogMonth } from '../../api/dailyLog'
import type { DayRow } from './types'

export function formatMonth(month: string) {
  const date = new Date(month + '-01')
  return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
}

export function getDaysInMonth(month: string) {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m, 0).getDate()
}

export function getDayOfWeek(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay()
}

/** True if this calendar day (local) is strictly after today (local). */
export function isFutureDay(year: number, month: number, day: number): boolean {
  const rowDate = new Date(year, month - 1, day)
  const t = new Date()
  const todayStart = new Date(t.getFullYear(), t.getMonth(), t.getDate())
  return rowDate.getTime() > todayStart.getTime()
}

/** Local midnight timestamp for a calendar day (no UTC shift). */
export function localDayStartMs(
  year: number,
  month: number,
  day: number,
): number {
  return new Date(year, month - 1, day).getTime()
}

/** Parse YYYY-MM-DD prefix from API; compare as local calendar dates. */
export function cycleStartLocalMs(iso?: string | null): number | null {
  if (!iso) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d))
    return null
  return localDayStartMs(y, mo, d)
}

/** True when this row's day is strictly before the active cycle start date. */
export function isBeforeCycleStart(
  year: number,
  month: number,
  day: number,
  cycleStartDate?: string | null,
): boolean {
  const t0 = cycleStartLocalMs(cycleStartDate)
  if (t0 == null) return false
  return localDayStartMs(year, month, day) < t0
}

/** Local calendar YYYY-MM for "today". */
export function todayYearMonth(): string {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`
}

/** First YYYY-MM from an API date string (YYYY-MM-DD…); avoids TZ shifting the month. */
export function yearMonthFromIsoDate(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})/.exec(iso.trim())
  if (!m) return null
  return `${m[1]}-${m[2]}`
}

export function clampYearMonth(
  value: string,
  minMonth: string,
  maxMonth: string,
): string {
  if (value < minMonth) return minMonth
  if (value > maxMonth) return maxMonth
  return value
}

export function monthNavigationBounds(cycleStartDate?: string | null) {
  const maxMonth = todayYearMonth()
  let minMonth = '1970-01'
  if (cycleStartDate) {
    const ym = yearMonthFromIsoDate(cycleStartDate)
    if (ym) minMonth = ym
  }
  if (minMonth > maxMonth) {
    minMonth = maxMonth
  }
  return { minMonth, maxMonth }
}

export function emptyRow(): DayRow {
  return {
    freshMorning: 0,
    freshEvening: 0,
    pelletMorning: 0,
    pelletEvening: 0,
    deathFishCount: 0,
    touristCatchCount: 0,
  }
}

export function numField(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function buildRowsFromMonth(
  data: DailyLogMonth | undefined,
): Record<number, DayRow> {
  const rows: Record<number, DayRow> = {}
  if (!data?.entries) return rows
  for (const e of data.entries) {
    rows[e.day] = {
      freshMorning: numField(e.freshMorning),
      freshEvening: numField(e.freshEvening),
      pelletMorning: numField(e.pelletMorning),
      pelletEvening: numField(e.pelletEvening),
      deathFishCount: numField(e.deathFishCount),
      touristCatchCount: numField(e.touristCatchCount),
    }
  }
  return rows
}

export function isRowNonEmpty(r: DayRow): boolean {
  return (
    r.freshMorning > 0 ||
    r.freshEvening > 0 ||
    r.pelletMorning > 0 ||
    r.pelletEvening > 0 ||
    r.deathFishCount > 0 ||
    r.touristCatchCount > 0
  )
}

export function isRowEqual(a: DayRow, b: DayRow): boolean {
  return (
    a.freshMorning === b.freshMorning &&
    a.freshEvening === b.freshEvening &&
    a.pelletMorning === b.pelletMorning &&
    a.pelletEvening === b.pelletEvening &&
    a.deathFishCount === b.deathFishCount &&
    a.touristCatchCount === b.touristCatchCount
  )
}

export const fmt = (n: number, digits = 1) =>
  n % 1 === 0 ? String(n) : n.toFixed(digits)

export const fmtOrEmpty = (n: number, digits = 1) =>
  Number.isFinite(n) && n > 0 ? fmt(n, digits) : ''

/** กิโลกรัม → กิโล in headers / totals (API often returns full word). */
export function abbrevThaiKgUnit(unit: string): string {
  return unit.replace(/กิโลกรัม/g, 'กิโล')
}

export function viewCellDisplay(val: number): string | number {
  if (!Number.isFinite(val) || val <= 0) return ''
  return val
}

const TOAST_ERR_MAX = 280
export function errorMessageForToast(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  if (raw.length <= TOAST_ERR_MAX) return raw
  return `${raw.slice(0, TOAST_ERR_MAX - 1)}…`
}
