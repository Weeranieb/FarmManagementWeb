import { Navigate } from 'react-router-dom'
import { useAuthQuery } from '../hooks/useAuth'
import { UserLevel } from '../constants/userLevel'

interface SuperAdminRouteProps {
  children: React.ReactNode
}

/**
 * Renders children only when the current user has userLevel === 3 (super admin).
 * Otherwise redirects to dashboard.
 */
export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { data: user, isLoading, isError } = useAuthQuery()

  if (isLoading || isError || !user) {
    return null // ProtectedRoute above will handle redirect to login
  }

  if (user.userLevel !== UserLevel.SuperAdmin) {
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}
