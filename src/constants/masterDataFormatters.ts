/**
 * Display formatters for master data (farm, pond).
 * DB stores only the name (e.g. "1", "1 ซ้าย"); on the page we show a prefixed label
 * like "ฟาร์ม 1 (1)" or "บ่อ 1 ซ้าย (1 ซ้าย)".
 */

/** Thai display prefix for farm name (e.g. "ฟาร์ม 1 (1)"). */
export const TH_FARM_DISPLAY_PREFIX = 'ฟาร์ม '
/** Thai display prefix for pond name (e.g. "บ่อ 1 ซ้าย (1 ซ้าย)"). */
export const TH_POND_DISPLAY_PREFIX = 'บ่อ '

/**
 * Format farm name for display (Thai): "ฟาร์ม {name} ({name})"
 * e.g. formatFarmDisplayNameTH("1") → "ฟาร์ม 1 (1)"
 */
export function formatFarmDisplayNameTH(name: string): string {
  const n = (name ?? '').trim()
  if (!n) return ''
  return `${TH_FARM_DISPLAY_PREFIX}${n}`
}

/**
 * Format pond name for display (Thai): "บ่อ {name} ({name})"
 * e.g. formatPondDisplayNameTH("1 ซ้าย") → "บ่อ 1 ซ้าย (1 ซ้าย)"
 */
export function formatPondDisplayNameTH(name: string): string {
  const n = (name ?? '').trim()
  if (!n) return ''
  return `${TH_POND_DISPLAY_PREFIX}${n}`
}
