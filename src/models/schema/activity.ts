import { Base } from './base'

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
