import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query'
import { useMemo, useCallback } from 'react'
import { pondApi } from '../api/pond'
import { useFarmHierarchyQuery } from './useFarm'

export const pondKeys = {
  all: ['ponds'] as const,
  lists: () => [...pondKeys.all, 'list'] as const,
  list: (farmId: number) => [...pondKeys.lists(), farmId] as const,
  details: () => [...pondKeys.all, 'detail'] as const,
  detail: (id: number) => [...pondKeys.details(), id] as const,
}

export function usePondQuery(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: pondKeys.detail(id ?? 0),
    queryFn: () => pondApi.getPond(id!),
    enabled: enabled && id != null && id > 0,
    staleTime: 2 * 60 * 1000,
  })
}

export type PondWithFarmName = Awaited<
  ReturnType<typeof pondApi.getPondList>
>[number] & { farmName: string }

/**
 * Returns all ponds for the client's farms with totalFish, fishTypes, ageDays and farmName.
 * Uses hierarchy to get farms then fetches pond list per farm.
 */
export function usePondListWithDetails(clientId: number | undefined) {
  const { data: hierarchy, isLoading: hierarchyLoading, error: hierarchyError } = useFarmHierarchyQuery(clientId)
  const farmIds = useMemo(() => hierarchy?.map((f) => f.id) ?? [], [hierarchy])

  const pondListResults = useQueries({
    queries: farmIds.map((farmId) => ({
      queryKey: pondKeys.list(farmId),
      queryFn: () => pondApi.getPondList(farmId),
      enabled: farmIds.length > 0,
      staleTime: 2 * 60 * 1000,
    })),
  })

  const ponds = useMemo((): PondWithFarmName[] => {
    if (!hierarchy?.length) return []
    return hierarchy.flatMap((farm, i) =>
      (pondListResults[i]?.data ?? []).map((p) => ({ ...p, farmName: farm.name }))
    )
  }, [hierarchy, pondListResults])

  const isLoading = hierarchyLoading || pondListResults.some((q) => q.isLoading)
  const error = hierarchyError ?? pondListResults.find((q) => q.error)?.error

  const queryClient = useQueryClient()
  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: pondKeys.all })
    queryClient.invalidateQueries({ queryKey: ['farms'] })
  }, [queryClient])

  return { ponds, isLoading, error, refetch }
}
