import { apiClient } from '../lib/api-client'
import type { User } from './auth'

export interface CreateUserRequest {
  username: string
  password: string
  email?: string | null
  firstName: string
  lastName?: string | null
  userLevel: number
  contactNumber?: string
  clientId?: number | null
}

export interface AdminUpdateUserRequest {
  username?: string
  email?: string | null
  firstName?: string
  lastName?: string | null
  userLevel?: number
  contactNumber?: string
  clientId?: number | null
}

export interface UserListFilters {
  search?: string
  userLevel?: number
  clientId?: number
}

export type UserResponse = User & { email?: string | null }

function buildQuery(filters: UserListFilters | undefined): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.userLevel != null) params.set('userLevel', String(filters.userLevel))
  if (filters.clientId != null) params.set('clientId', String(filters.clientId))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const userApi = {
  list: async (filters?: UserListFilters): Promise<UserResponse[]> => {
    return apiClient.get<UserResponse[]>(`/user/list${buildQuery(filters)}`)
  },

  create: async (body: CreateUserRequest): Promise<UserResponse> => {
    return apiClient.post<UserResponse>('/user', body)
  },

  adminUpdate: async (
    id: number,
    body: AdminUpdateUserRequest,
  ): Promise<void> => {
    return apiClient.put<void>(`/user/${id}`, body)
  },

  adminResetPassword: async (id: number, password: string): Promise<void> => {
    return apiClient.put<void>(`/user/${id}/password`, { password })
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/user/${id}`)
  },
}
