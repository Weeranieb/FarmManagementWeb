import { Base } from './base'

export interface FarmGroup extends Base {
  id: number
  clientId: number
  code: string
  name: string
}

export interface AddFarmOnFarmGroup {
  farmGroupId: number
  farmId: number
}
