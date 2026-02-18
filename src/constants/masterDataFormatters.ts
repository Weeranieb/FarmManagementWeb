export const TH_FARM_DISPLAY_PREFIX = 'ฟาร์ม '
export const TH_POND_DISPLAY_PREFIX = 'บ่อ '

export function formatFarmDisplayNameTH(name: string): string {
  const n = (name ?? '').trim()
  if (!n) return ''
  return `${TH_FARM_DISPLAY_PREFIX}${n}`
}

export function formatPondDisplayNameTH(name: string): string {
  const n = (name ?? '').trim()
  if (!n) return ''
  return `${TH_POND_DISPLAY_PREFIX}${n}`
}
