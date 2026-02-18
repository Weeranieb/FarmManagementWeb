import { Navigate } from 'react-router-dom'
import { useAuthQuery } from '../../hooks/useAuth'
import { UserLevel } from '../../constants/userLevel'

interface SuperAdminRouteProps {
  children: React.ReactNode
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { data: user, isLoading, isError } = useAuthQuery()

  if (isLoading || isError || !user) {
    return null
  }

  if (user.userLevel !== UserLevel.SuperAdmin) {
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}
