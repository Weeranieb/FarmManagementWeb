import { useQuery } from '@tanstack/react-query'
import { farmApi } from '../api/farm'

// Query key factory - helps organize and invalidate queries
export const farmKeys = {
  all: ['farms'] as const,
  lists: () => [...farmKeys.all, 'list'] as const,
  list: () => [...farmKeys.lists()] as const,
  details: () => [...farmKeys.all, 'detail'] as const,
  detail: (id: number) => [...farmKeys.details(), id] as const,
}

/**
 * Hook to get a single farm by ID
 * @param id - Farm ID
 * @param enabled - Whether the query should run (useful for conditional fetching)
 */
export function useFarmQuery(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: farmKeys.detail(id),
    queryFn: () => farmApi.getFarm(id),
    enabled: enabled && !!id, // Only fetch if enabled and id exists
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  })
}

export function useFarmListQuery(clientId?: number) {
  return useQuery({
    queryKey: [...farmKeys.list(), clientId ?? 'default'] as const,
    queryFn: () => farmApi.getFarmList(clientId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useFarmHierarchyQuery(clientId?: number) {
  return useQuery({
    queryKey: [...farmKeys.all, 'hierarchy', clientId ?? 'default'] as const,
    queryFn: () => farmApi.getFarmHierarchy(clientId),
    enabled: clientId != null && clientId > 0,
    staleTime: 5 * 60 * 1000,
  })
}
