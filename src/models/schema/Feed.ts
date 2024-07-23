import { Base } from './base'

export interface CreateFeedCollection extends Base {
  id?: number
  code: string
  name: string
  unit: string
  feedPriceHistories: FeedPriceHistory[]
}

export interface FeedPriceHistory {
  id?: number
  feedCollectionId: number
  price: number
  priceUpdatedDate: string
}

export interface FeedCollection extends Base {
  id: number
  clientId: number
  code: string
  name: string
  unit: string
}
