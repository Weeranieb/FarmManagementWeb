export interface FeedCollection {
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
