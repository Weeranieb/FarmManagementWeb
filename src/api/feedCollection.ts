import { apiClient } from '../lib/api-client'

export interface FeedCollectionResponse {
  id: number
  clientId: number
  name: string
  unit: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface FeedCollectionPageItem extends FeedCollectionResponse {
  latestPrice: number | null
  latestPriceUpdatedDate: string | null
}

export interface FeedCollectionPageResponse {
  items: FeedCollectionPageItem[]
  total: number
}

export interface CreateFeedCollectionRequest {
  name: string
  unit: string
  /** When the token has no client (e.g. super admin), backend requires this. */
  clientId?: number
  feedPriceHistories?: { price: number; priceUpdatedDate: string }[]
}

export interface CreateFeedCollectionResponse {
  feedCollection: FeedCollectionResponse
  feedPriceHistory: unknown[]
}

export const feedCollectionApi = {
  list: async (
    page: number,
    pageSize: number,
    keyword?: string,
    clientId?: number,
  ): Promise<FeedCollectionPageResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      orderBy: 'id desc',
    })
    if (keyword) params.set('keyword', keyword)
    if (clientId != null) params.set('clientId', String(clientId))
    return apiClient.get<FeedCollectionPageResponse>(
      `/feed-collection?${params.toString()}`,
    )
  },

  get: async (id: number): Promise<FeedCollectionResponse> => {
    return apiClient.get<FeedCollectionResponse>(`/feed-collection/${id}`)
  },

  create: async (
    body: CreateFeedCollectionRequest,
  ): Promise<CreateFeedCollectionResponse> => {
    return apiClient.post<CreateFeedCollectionResponse>(
      '/feed-collection',
      body,
    )
  },
}
