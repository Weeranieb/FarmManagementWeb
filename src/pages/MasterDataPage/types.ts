import type { FarmDetailPondItem } from '../../api/farm'

export type PondWithFarmId = FarmDetailPondItem & { farmId: number }

export type MasterDataEditingItem = {
  id: string
  name: string
  type: 'farm' | 'pond'
}
