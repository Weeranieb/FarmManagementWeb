import { th } from '../../locales/th'

/** Shared auth-route loading spinner (ProtectedRoute / GuestRoute). */
export function AuthLoadingScreen() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <p className='mt-4 text-gray-600'>{th.protectedRoute.loading}</p>
      </div>
    </div>
  )
}
