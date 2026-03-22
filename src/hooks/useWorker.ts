import { useQuery } from '@tanstack/react-query'
import { workerApi } from '../api/worker'

export const workerKeys = {
  all: ['workers'] as const,
  lists: () => [...workerKeys.all, 'list'] as const,
  list: (clientId?: number) =>
    [...workerKeys.lists(), clientId ?? 'default'] as const,
  details: () => [...workerKeys.all, 'detail'] as const,
  detail: (id: number) => [...workerKeys.details(), id] as const,
}

export function useWorkerListQuery(clientId?: number, keyword?: string) {
  return useQuery({
    queryKey: [...workerKeys.list(clientId), keyword ?? ''] as const,
    queryFn: () => workerApi.list(0, 200, clientId, keyword),
    enabled: clientId != null && clientId > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export function useWorkerQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: workerKeys.detail(id),
    queryFn: () => workerApi.get(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}
