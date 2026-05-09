/** Password rule: ≥8 ASCII alphanumerics, with at least one upper and one lower case letter. */
export const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z0-9]{8,}$/

export function isValidPassword(value: string): boolean {
  return PASSWORD_RE.test(value)
}
