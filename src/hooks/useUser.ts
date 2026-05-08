import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  userApi,
  type AdminUpdateUserRequest,
  type CreateUserRequest,
  type UserListFilters,
} from '../api/user'

export const userKeys = {
  all: ['users'] as const,
  list: (filters?: UserListFilters) =>
    [...userKeys.all, 'list', filters ?? {}] as const,
}

export function useUserListQuery(filters?: UserListFilters, enabled = true) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userApi.list(filters),
    enabled,
    staleTime: 30 * 1000,
  })
}

function useInvalidateUserList() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: userKeys.all })
}

export function useCreateUserMutation() {
  const invalidate = useInvalidateUserList()
  return useMutation({
    mutationFn: (body: CreateUserRequest) => userApi.create(body),
    onSuccess: () => invalidate(),
  })
}

export function useAdminUpdateUserMutation() {
  const invalidate = useInvalidateUserList()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AdminUpdateUserRequest }) =>
      userApi.adminUpdate(id, body),
    onSuccess: () => invalidate(),
  })
}

export function useDeleteUserMutation() {
  const invalidate = useInvalidateUserList()
  return useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => invalidate(),
  })
}
