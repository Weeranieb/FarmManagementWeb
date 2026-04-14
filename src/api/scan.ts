import { apiClient } from '../lib/api-client'

export interface ScanEntry {
  day: number
  freshMorning: number | null
  freshEvening: number | null
  pelletMorning: number | null
  pelletEvening: number | null
  deathFishCount: number | null
}

export interface ScanConfidence {
  day: number
  freshMorning: number
  freshEvening: number
  pelletMorning: number
  pelletEvening: number
  deathFishCount: number
}

export interface ScanDailyLogResponse {
  scanLogId: number
  month: string
  entries: ScanEntry[]
  confidence: ScanConfidence[]
  imageUrls: string[]
  notes: string
}

export const scanApi = {
  scanDailyLog: async (
    pondId: number,
    params: { images: File[]; month: string },
  ): Promise<ScanDailyLogResponse> => {
    const form = new FormData()
    form.append('month', params.month)
    for (const img of params.images) {
      form.append('images', img)
    }
    return apiClient.postForm<ScanDailyLogResponse>(
      `/pond/${pondId}/daily-logs/scan`,
      form,
    )
  },
}
