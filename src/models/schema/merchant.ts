import { Base } from './base'

export interface Merchant extends Base {
  id: number
  name: string
  contactNumber: string
  location: string
}
