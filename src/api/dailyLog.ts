import { apiClient } from '../lib/api-client'

export interface DailyLogEntry {
  id: number
  day: number
  freshMorning: number
  freshEvening: number
  pelletMorning: number
  pelletEvening: number
  deathFishCount: number
  touristCatchCount: number
  freshUnitPrice: number | null
  pelletUnitPrice: number | null
}

export interface DailyLogMonth {
  freshFeedCollectionId: number | null
  pelletFeedCollectionId: number | null
  freshFeedCollectionName: string
  pelletFeedCollectionName: string
  freshUnit: string
  pelletUnit: string
  entries: DailyLogEntry[]
}

export interface DailyLogBulkUpsertEntry {
  day: number
  freshMorning: number
  freshEvening: number
  pelletMorning: number
  pelletEvening: number
  deathFishCount: number
  touristCatchCount: number
}

export interface DailyLogBulkUpsertRequest {
  month: string
  freshFeedCollectionId?: number
  pelletFeedCollectionId?: number
  entries: DailyLogBulkUpsertEntry[]
}

export interface DailyLogExcelUploadResponse {
  rowsImported: number
  savedPath: string
}

export const dailyLogApi = {
  getMonth: async (pondId: number, month: string): Promise<DailyLogMonth> => {
    return apiClient.get<DailyLogMonth>(
      `/pond/${pondId}/daily-logs?month=${encodeURIComponent(month)}`,
    )
  },

  bulkUpsert: async (
    pondId: number,
    body: DailyLogBulkUpsertRequest,
  ): Promise<void> => {
    return apiClient.put<void>(`/pond/${pondId}/daily-logs`, body)
  },

  uploadExcel: async (
    pondId: number,
    params: {
      file: File
      month: string
      freshFeedCollectionId?: number
      pelletFeedCollectionId?: number
    },
  ): Promise<DailyLogExcelUploadResponse> => {
    const form = new FormData()
    form.append('file', params.file)
    form.append('month', params.month)
    if (params.freshFeedCollectionId != null) {
      form.append('freshFeedCollectionId', String(params.freshFeedCollectionId))
    }
    if (params.pelletFeedCollectionId != null) {
      form.append(
        'pelletFeedCollectionId',
        String(params.pelletFeedCollectionId),
      )
    }
    return apiClient.postForm<DailyLogExcelUploadResponse>(
      `/pond/${pondId}/daily-logs/upload`,
      form,
    )
  },
}
