export function normalizeNationality(n: string): 'Thai' | 'Cambodian' {
  return n === 'Cambodian' ? 'Cambodian' : 'Thai'
}
