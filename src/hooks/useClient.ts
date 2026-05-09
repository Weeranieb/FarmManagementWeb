import { useQuery, useQueryClient } from '@tanstack/react-query'
import { clientApi } from '../api/client'

export const clientKeys = {
  all: ['clients'] as const,
  list: () => [...clientKeys.all, 'list'] as const,
  summaries: () => [...clientKeys.all, 'summaries'] as const,
  detail: (id: number) => [...clientKeys.all, 'detail', id] as const,
}

/**
 * Hook to get client list (dropdown). Dedupes requests and caches result.
 */
export function useClientListQuery() {
  return useQuery({
    queryKey: clientKeys.list(),
    queryFn: () => clientApi.getClientList(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useClientDetailQuery(clientId: number, enabled = true) {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: () => clientApi.getClient(clientId),
    enabled: enabled && clientId > 0,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get client summaries (id, name, owner, contact, farm/pond/user counts).
 * Used by the master-data clients tab. Super admin only — server returns 403 otherwise.
 */
export function useClientSummariesQuery(enabled = true) {
  return useQuery({
    queryKey: clientKeys.summaries(),
    queryFn: () => clientApi.getClientSummaries(),
    enabled,
    staleTime: 60 * 1000, // 1 minute — counts can drift as users edit
  })
}

/**
 * Invalidate client list cache (e.g. after create/update client).
 */
export function useInvalidateClientList() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: clientKeys.all })
}
