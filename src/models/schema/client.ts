import { Base } from './base'

export interface Client extends Base {
  id: number
  name: string
  ownerName: string
  contactNumber: string
  isActive: boolean
}
