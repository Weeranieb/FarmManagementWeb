import { useQuery } from '@tanstack/react-query'
import { farmGroupApi } from '../api/farmGroup'

export const farmGroupKeys = {
  all: ['farmGroups'] as const,
  lists: () => [...farmGroupKeys.all, 'list'] as const,
  list: (clientId?: number) =>
    [...farmGroupKeys.lists(), clientId ?? 'default'] as const,
  details: () => [...farmGroupKeys.all, 'detail'] as const,
  detail: (id: number) => [...farmGroupKeys.details(), id] as const,
  dropdown: (clientId?: number) =>
    [...farmGroupKeys.all, 'dropdown', clientId ?? 'default'] as const,
}

export function useFarmGroupListQuery(clientId?: number) {
  return useQuery({
    queryKey: farmGroupKeys.list(clientId),
    queryFn: () => farmGroupApi.list(clientId),
    enabled: clientId != null && clientId > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFarmGroupQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: farmGroupKeys.detail(id),
    queryFn: () => farmGroupApi.get(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFarmGroupDropdownQuery(clientId?: number) {
  return useQuery({
    queryKey: farmGroupKeys.dropdown(clientId),
    queryFn: () => farmGroupApi.dropdown(clientId),
    enabled: clientId != null && clientId > 0,
    staleTime: 5 * 60 * 1000,
  })
}
