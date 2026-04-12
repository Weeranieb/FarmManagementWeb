import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dailyLogApi, type DailyLogBulkUpsertRequest } from '../api/dailyLog'

export const dailyLogKeys = {
  all: ['dailyLog'] as const,
  /** Prefix for all months of one pond (partial query key invalidation). */
  pond: (pondId: number) => [...dailyLogKeys.all, pondId] as const,
  month: (pondId: number, month: string) =>
    [...dailyLogKeys.all, pondId, month] as const,
}

export function useDailyLogQuery(pondId: number, month: string) {
  return useQuery({
    queryKey: dailyLogKeys.month(pondId, month),
    queryFn: () => dailyLogApi.getMonth(pondId, month),
    enabled: pondId > 0 && month.length === 7,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useDailyLogBulkMutation(pondId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: DailyLogBulkUpsertRequest) =>
      dailyLogApi.bulkUpsert(pondId, body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: dailyLogKeys.month(pondId, variables.month),
      })
    },
  })
}

export function useDailyLogTemplateImportMutation(farmId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { file: File; selectedPondIds: number[] }) =>
      dailyLogApi.importTemplate(farmId, params),
    onSuccess: async (data, variables) => {
      const pondIds = new Set<number>(variables.selectedPondIds)
      for (const r of data.results) {
        pondIds.add(r.pondId)
      }
      await Promise.all(
        [...pondIds].map((id) =>
          qc.invalidateQueries({ queryKey: dailyLogKeys.pond(id) }),
        ),
      )
    },
  })
}
