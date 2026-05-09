/** Pragmatic email pattern: ASCII only, single @, domain with TLD ≥ 2 chars. */
export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

/** Strip non-ASCII (e.g. Thai) chars and any disallowed chars from email input,
 * lowercasing as we go. Use on the input onChange so paste cannot bypass it. */
export function filterEmailInput(value: string): string {
  return value.replace(/[^A-Za-z0-9._%+@-]/g, '').toLowerCase()
}

/** True when value is a non-empty trimmed string matching EMAIL_RE. */
export function isValidEmail(value: string): boolean {
  const s = value.trim()
  return s.length > 0 && EMAIL_RE.test(s)
}
