import { Navigate } from 'react-router-dom'
import { useAuthQuery } from '../../hooks/useAuth'
import { AuthLoadingScreen } from './AuthLoadingScreen'

interface GuestRouteProps {
  children: React.ReactNode
}

/**
 * Renders children only when the user is NOT authenticated.
 * If the user has a valid token/session, redirects to the homepage (dashboard).
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { data: user, isLoading } = useAuthQuery()

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (user) {
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}
