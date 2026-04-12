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
  deleteDays?: number[]
}

export interface DailyLogTemplateImportResult {
  pondId: number
  pondName: string
  rowsImported: number
}

export interface DailyLogTemplateImportResponse {
  results: DailyLogTemplateImportResult[]
  skipped: string[]
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

  /** Path relative to API base (`/api/v1` in dev). */
  pondExportPath: (pondId: number, month: string): string =>
    `/pond/${pondId}/daily-logs/export?month=${encodeURIComponent(month)}&format=xlsx`,

  farmExportPath: (farmId: number, month: string): string =>
    `/farm/${farmId}/daily-logs/export?month=${encodeURIComponent(month)}&format=xlsx`,

  importTemplate: async (
    farmId: number,
    params: { file: File; selectedPondIds: number[] },
  ): Promise<DailyLogTemplateImportResponse> => {
    const form = new FormData()
    form.append('file', params.file)
    for (const id of params.selectedPondIds) {
      form.append('selectedPondIds', String(id))
    }
    return apiClient.postForm<DailyLogTemplateImportResponse>(
      `/farm/${farmId}/daily-logs/import-template`,
      form,
    )
  },
}
