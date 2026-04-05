export function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/** Avoids RangeError when date input is cleared or invalid (would block mutate / fetch). */
export function toPriceUpdatedDateISO(dateStr: string): string {
  const raw = dateStr?.trim()
  const base = raw || todayISO()
  const d = new Date(base)
  if (Number.isNaN(d.getTime())) {
    return new Date(todayISO() + 'T12:00:00').toISOString()
  }
  return d.toISOString()
}
