import { Navigate } from 'react-router-dom'
import { useAuthQuery } from '../../hooks/useAuth'
import { UserLevel } from '../../constants/userLevel'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { data: user, isLoading, isError } = useAuthQuery()

  if (isLoading || isError || !user) {
    return null
  }

  if (
    user.userLevel !== UserLevel.SuperAdmin &&
    user.userLevel !== UserLevel.ClientAdmin
  ) {
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}
