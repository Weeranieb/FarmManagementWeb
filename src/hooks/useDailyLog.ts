import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dailyLogApi, type DailyLogBulkUpsertRequest } from '../api/dailyLog'

export const dailyLogKeys = {
  all: ['dailyLog'] as const,
  month: (pondId: number, month: string) =>
    [...dailyLogKeys.all, pondId, month] as const,
}

export function useDailyLogQuery(pondId: number, month: string) {
  return useQuery({
    queryKey: dailyLogKeys.month(pondId, month),
    queryFn: () => dailyLogApi.getMonth(pondId, month),
    enabled: pondId > 0 && month.length === 7,
    staleTime: 60 * 1000,
  })
}

export function useDailyLogBulkMutation(pondId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: DailyLogBulkUpsertRequest) =>
      dailyLogApi.bulkUpsert(pondId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dailyLogKeys.all })
    },
  })
}

export function useDailyLogUploadMutation(pondId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      file: File
      month: string
      freshFeedCollectionId?: number
      pelletFeedCollectionId?: number
    }) => dailyLogApi.uploadExcel(pondId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dailyLogKeys.all })
    },
  })
}
