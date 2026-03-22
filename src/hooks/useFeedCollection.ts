import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  feedCollectionApi,
  type CreateFeedCollectionRequest,
} from '../api/feedCollection'
import { useAuthQuery } from './useAuth'
import { useClient } from '../contexts/ClientContext'
import {
  feedPriceHistoryApi,
  type CreateFeedPriceHistoryRequest,
  type FeedPriceHistoryResponse,
} from '../api/feedPriceHistory'

export const feedCollectionKeys = {
  all: ['feedCollections'] as const,
  lists: () => [...feedCollectionKeys.all, 'list'] as const,
  list: (clientId?: number) =>
    [...feedCollectionKeys.lists(), clientId ?? 'default'] as const,
  details: () => [...feedCollectionKeys.all, 'detail'] as const,
  detail: (id: number) => [...feedCollectionKeys.details(), id] as const,
}

export const feedPriceHistoryKeys = {
  all: ['feedPriceHistory'] as const,
  byFeed: (feedCollectionId: number) =>
    [...feedPriceHistoryKeys.all, feedCollectionId] as const,
}

export function useFeedCollectionListQuery(keyword?: string) {
  const { data: user } = useAuthQuery()
  const { selectedClientId } = useClient()
  const jwtClientId = user?.clientId ?? null
  const selectedNum = selectedClientId ? Number(selectedClientId) : NaN
  const queryClientId =
    jwtClientId == null && !Number.isNaN(selectedNum) && selectedNum > 0
      ? selectedNum
      : undefined

  const enabled =
    jwtClientId != null || (!Number.isNaN(selectedNum) && selectedNum > 0)

  return useQuery({
    queryKey: [
      ...feedCollectionKeys.lists(),
      jwtClientId ?? 'nojwt',
      queryClientId ?? 'nosel',
      keyword ?? '',
    ] as const,
    queryFn: () => feedCollectionApi.list(0, 200, keyword, queryClientId),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFeedCollectionQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: feedCollectionKeys.detail(id),
    queryFn: () => feedCollectionApi.get(id),
    enabled: enabled && id > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFeedPriceHistoryQuery(
  feedCollectionId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: feedPriceHistoryKeys.byFeed(feedCollectionId),
    queryFn: () => feedPriceHistoryApi.listByFeedCollection(feedCollectionId),
    enabled: enabled && feedCollectionId > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateFeedCollectionMutation() {
  const qc = useQueryClient()
  const { data: user } = useAuthQuery()
  const { selectedClientId } = useClient()
  return useMutation({
    mutationFn: (body: CreateFeedCollectionRequest) => {
      const jwtClientId = user?.clientId ?? null
      if (jwtClientId != null) {
        return feedCollectionApi.create(body)
      }
      const sid = selectedClientId ? Number(selectedClientId) : NaN
      const clientId = !Number.isNaN(sid) && sid > 0 ? sid : undefined
      return feedCollectionApi.create(
        clientId != null ? { ...body, clientId } : body,
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: feedCollectionKeys.all })
    },
  })
}

export function useCreateFeedPriceHistoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateFeedPriceHistoryRequest) =>
      feedPriceHistoryApi.create(body),
    onSuccess: (_data: FeedPriceHistoryResponse, variables) => {
      qc.invalidateQueries({
        queryKey: feedPriceHistoryKeys.byFeed(variables.feedCollectionId),
      })
      qc.invalidateQueries({ queryKey: feedCollectionKeys.all })
    },
  })
}
