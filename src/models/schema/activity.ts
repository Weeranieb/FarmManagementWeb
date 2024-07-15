import { Base } from './base'
import { AddSellDetail } from './sellDetail'

export interface Activity extends Base {
  id: number
  activePondId: number
  toActivePondId?: number
  mode: string
  merchantId?: number
  amount?: number
  fishType?: string
  fishWeight?: number
  fishUnit?: string
  pricePerUnit?: number
  activityDate: string
}

export interface ActivityList extends Activity {
  totalWeight: number
  unit: string
  farmName: string
  pondName: string
}
export interface AddFillActivity {
  farmId: number
  pondId: number
  amount: number
  fishType: string
  fishWeight: number
  pricePerUnit: number
  fishUnit: string
  activityDate: string
  additionalCost?: number
  isNewPond: boolean
}

export interface AddMoveActivity {
  farmId: number
  pondId: number
  toFarmId: number
  toPondId: number
  amount: number
  fishType: string
  fishWeight: number
  pricePerUnit: number
  fishUnit: string
  activityDate: string
  additionalCost?: number
  isNewPond: boolean
  isClose: boolean
}

export interface AddSellActivity {
  pondId: number
  merchantId: number
  activityDate: string
  additionalCost?: number
  sellDetails: AddSellDetail[]
  isClose: boolean
}
