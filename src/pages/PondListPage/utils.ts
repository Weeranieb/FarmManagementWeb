import { th } from '../../locales/th'

const fishTypeLabels = th.fishType as Record<string, string>

export function fishTypeDisplayLabel(value: string): string {
  return fishTypeLabels[value] ?? value
}
