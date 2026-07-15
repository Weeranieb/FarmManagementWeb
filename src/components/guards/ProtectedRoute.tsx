import { Navigate } from 'react-router-dom'
import { useAuthQuery } from '../../hooks/useAuth'
import { AuthLoadingScreen } from './AuthLoadingScreen'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: user, isLoading, isError } = useAuthQuery()

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (isError || !user) {
    return <Navigate to='/login' replace />
  }

  return <>{children}</>
}
