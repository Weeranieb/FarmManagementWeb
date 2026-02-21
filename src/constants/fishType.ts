/**
 * Fish type constants. Keys are UPPERCASE; values are lowercase for API/DB.
 */
export const FishType = {
  NIL: 'nil',
  KAPHONG: 'kaphong',
  KANG: 'kang',
  DUK: 'duk',
} as const

export type FishTypeValue = (typeof FishType)[keyof typeof FishType]

export const FISH_TYPE_VALUES: FishTypeValue[] = Object.values(FishType)

export function isValidFishType(value: string): value is FishTypeValue {
  return FISH_TYPE_VALUES.includes(value as FishTypeValue)
}
