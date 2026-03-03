/**
 * Master data naming: Thai display prefixes and format/normalize for farm and pond.
 * Mirrors backend utils/master_data_name.go. Single place for constants, display (add prefix), and store (strip prefix).
 */

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

function trimPrefixAndSpace(s: string, prefix: string): string {
  const t = s.trim()
  const p = prefix.trim()
  return t.startsWith(p) ? t.slice(p.length).trim() : t.trim()
}

/**
 * Normalize farm name for store: trim the Thai farm prefix and surrounding whitespace.
 * e.g. "  ฟาร์ม 1 " -> "1". Matches backend NormalizeFarmNameForStore.
 */
export function normalizeFarmNameForStore(s: string): string {
  return trimPrefixAndSpace(s, TH_FARM_DISPLAY_PREFIX)
}

/**
 * Normalize pond name for store: trim the Thai pond prefix and surrounding whitespace.
 * e.g. " บ่อ 1 ซ้าย " -> "1 ซ้าย". Matches backend NormalizePondNameForStore.
 */
export function normalizePondNameForStore(s: string): string {
  return trimPrefixAndSpace(s, TH_POND_DISPLAY_PREFIX)
}
