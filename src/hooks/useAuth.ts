import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginRequest } from '../api/auth'

// Query key factory
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
}

/**
 * Hook to get the current authenticated user
 */
export function useAuthQuery() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

const REMEMBERED_USERNAME_KEY = 'boonmafarm_remembered_username'

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (_data, variables) => {
      if (variables.rememberMe && variables.username) {
        localStorage.setItem(REMEMBERED_USERNAME_KEY, variables.username)
      } else {
        localStorage.removeItem(REMEMBERED_USERNAME_KEY)
      }
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
      navigate('/dashboard')
    },
  })
}

export function getRememberedUsername(): string | null {
  return localStorage.getItem(REMEMBERED_USERNAME_KEY)
}

/**
 * Hook for logout mutation
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear()
      navigate('/login')
    },
  })
}
