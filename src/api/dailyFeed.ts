import { apiClient } from '../lib/api-client'

export interface DailyFeedEntry {
  id: number
  day: number
  morning: number
  evening: number
  unitPrice: number | null
}

export interface DailyFeedTable {
  feedCollectionId: number
  feedCollectionName: string
  feedUnit: string
  entries: DailyFeedEntry[]
}

export interface DailyFeedBulkUpsertEntry {
  day: number
  morning: number
  evening: number
}

export interface DailyFeedBulkUpsertRequest {
  feedCollectionId: number
  month: string
  entries: DailyFeedBulkUpsertEntry[]
}

export const dailyFeedApi = {
  getMonth: async (
    pondId: number,
    month: string,
  ): Promise<DailyFeedTable[]> => {
    return apiClient.get<DailyFeedTable[]>(
      `/pond/${pondId}/daily-feed?month=${month}`,
    )
  },

  bulkUpsert: async (
    pondId: number,
    body: DailyFeedBulkUpsertRequest,
  ): Promise<void> => {
    return apiClient.put<void>(`/pond/${pondId}/daily-feed`, body)
  },

  deleteTable: async (
    pondId: number,
    feedCollectionId: number,
  ): Promise<void> => {
    return apiClient.delete<void>(
      `/pond/${pondId}/daily-feed/${feedCollectionId}`,
    )
  },
}
