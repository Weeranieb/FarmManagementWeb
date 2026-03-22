export function fmtCurrency(v: number): string {
  return `฿${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}
