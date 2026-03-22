import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dailyFeedApi, type DailyFeedBulkUpsertRequest } from '../api/dailyFeed'

export const dailyFeedKeys = {
  all: ['dailyFeed'] as const,
  month: (pondId: number, month: string) =>
    [...dailyFeedKeys.all, pondId, month] as const,
}

export function useDailyFeedQuery(pondId: number, month: string) {
  return useQuery({
    queryKey: dailyFeedKeys.month(pondId, month),
    queryFn: () => dailyFeedApi.getMonth(pondId, month),
    enabled: pondId > 0 && month.length === 7,
    staleTime: 60 * 1000,
  })
}

export function useDailyFeedBulkMutation(pondId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: DailyFeedBulkUpsertRequest) =>
      dailyFeedApi.bulkUpsert(pondId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dailyFeedKeys.all })
    },
  })
}

export function useDailyFeedDeleteMutation(pondId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (feedCollectionId: number) =>
      dailyFeedApi.deleteTable(pondId, feedCollectionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dailyFeedKeys.all })
    },
  })
}
