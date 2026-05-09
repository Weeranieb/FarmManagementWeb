/** Thai mobile/landline numbers are exactly 10 digits (e.g. 0812345678). */
export const THAI_PHONE_MAX_LENGTH = 10

/** Strip non-digits for phone fields (Thai mobile, etc.). */
export function filterDigitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** Strip non-digits and clamp to Thai phone length (10). Use on phone inputs
 * so paste-from-clipboard cannot bypass the input maxLength attribute. */
export function filterPhoneInput(value: string): string {
  return filterDigitsOnly(value).slice(0, THAI_PHONE_MAX_LENGTH)
}

/** True when non-empty and every character is 0–9. */
export function isDigitsOnly(value: string): boolean {
  const s = value.trim()
  return s.length > 0 && /^\d+$/.test(s)
}
