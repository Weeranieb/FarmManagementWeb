import { Navigate } from 'react-router-dom'
import { useAuthQuery } from '../../hooks/useAuth'
import { th } from '../../locales/th'

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
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>{th.protectedRoute.loading}</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to='/dashboard' replace />
  }

  return <>{children}</>
}
