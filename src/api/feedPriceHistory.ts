import { apiClient } from '../lib/api-client'

export interface FeedPriceHistoryResponse {
  id: number
  feedCollectionId: number
  price: number
  priceUpdatedDate: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface CreateFeedPriceHistoryRequest {
  feedCollectionId: number
  price: number
  priceUpdatedDate: string
}

export const feedPriceHistoryApi = {
  listByFeedCollection: async (
    feedCollectionId: number,
  ): Promise<FeedPriceHistoryResponse[]> => {
    return apiClient.get<FeedPriceHistoryResponse[]>(
      `/feed-price-history?feedCollectionId=${feedCollectionId}`,
    )
  },

  create: async (
    body: CreateFeedPriceHistoryRequest,
  ): Promise<FeedPriceHistoryResponse> => {
    return apiClient.post<FeedPriceHistoryResponse>('/feed-price-history', body)
  },
}
