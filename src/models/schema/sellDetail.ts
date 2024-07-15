import { Base } from './base'

export interface AddSellDetail {
  size: string
  fishType: string
  amount: number
  fishUnit: string
  pricePerUnit: number
}

export interface SellDetail extends Base {
  id: number
  sellId: number
  size: string
  fishType: string
  amount: number
  fishUnit: string
  pricePerUnit: number
}
