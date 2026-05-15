import { apiClient } from '../lib/api-client'

export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

export interface User {
  id: number
  clientId: number | null
  username: string
  firstName: string
  lastName: string | null
  userLevel: number
  contactNumber: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface LoginResponse {
  accessToken: string
  expiredAt: string | null
  user: User
}

export interface LogoutResponse {
  message?: string
}

export interface UpdateMeRequest {
  username: string
  email: string | null
  firstName: string
  lastName: string | null
  contactNumber: string
}

export interface ChangeMyPasswordRequest {
  currentPassword: string
  newPassword: string
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials)
  },

  logout: async (): Promise<LogoutResponse> => {
    return apiClient.post<LogoutResponse>('/auth/logout')
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/user')
  },

  updateMe: async (body: UpdateMeRequest): Promise<User> => {
    return apiClient.put<User>('/user', body)
  },

  changeMyPassword: async (body: ChangeMyPasswordRequest): Promise<void> => {
    return apiClient.put<void>('/user/password', body)
  },
}
