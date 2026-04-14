/** Strip non-digits for phone fields (Thai mobile, etc.). */
export function filterDigitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** True when non-empty and every character is 0–9. */
export function isDigitsOnly(value: string): boolean {
  const s = value.trim()
  return s.length > 0 && /^\d+$/.test(s)
}
