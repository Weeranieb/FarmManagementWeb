/** Canonical API / DB values */
export const FEED_TYPE_FRESH = 'fresh' as const
export const FEED_TYPE_PELLET = 'pellet' as const

export type FeedTypeValue = typeof FEED_TYPE_FRESH | typeof FEED_TYPE_PELLET

export const FEED_TYPE_LABEL_TH: Record<FeedTypeValue, string> = {
  [FEED_TYPE_FRESH]: 'เหยื่อสด',
  [FEED_TYPE_PELLET]: 'อาหารเม็ด',
}

export const FEED_TYPE_OPTIONS: { value: FeedTypeValue; label: string }[] = [
  { value: FEED_TYPE_FRESH, label: FEED_TYPE_LABEL_TH[FEED_TYPE_FRESH] },
  { value: FEED_TYPE_PELLET, label: FEED_TYPE_LABEL_TH[FEED_TYPE_PELLET] },
]

export function feedTypeLabelTh(value: string): string {
  if (value === FEED_TYPE_FRESH || value === FEED_TYPE_PELLET) {
    return FEED_TYPE_LABEL_TH[value]
  }
  return value
}
