import { Base } from './base'

export interface Bill extends Base {
  id: number
  type: string
  other?: string
  farmGroupId: number
  paidAmount: number
  paymentDate: string
}
