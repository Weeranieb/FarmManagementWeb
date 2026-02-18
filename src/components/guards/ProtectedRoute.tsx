import { Navigate } from 'react-router-dom'
import { useAuthQuery } from '../../hooks/useAuth'
import { th } from '../../locales/th'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: user, isLoading, isError } = useAuthQuery()

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

  if (isError || !user) {
    return <Navigate to='/login' replace />
  }

  return <>{children}</>
}
