import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Fish, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useLoginMutation, getRememberedUsername } from '../hooks/useAuth'
import { th } from '../locales/th'

const L = th.login

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLoginMutation()

  useEffect(() => {
    const remembered = getRememberedUsername()
    if (remembered) {
      setUsername(remembered)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ username, password, rememberMe })
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-slate-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo and Title */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4'>
            <Fish size={40} className='text-blue-600' />
          </div>
          <h1 className='text-4xl text-white mb-2'>{L.title}</h1>
          <p className='text-blue-100 text-lg'>{L.tagline}</p>
        </div>

        {/* Login Form */}
        <div className='bg-white rounded-2xl shadow-2xl p-8'>
          <h2 className='text-2xl text-gray-800 mb-6 text-center'>
            {L.welcomeBack}
          </h2>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                {L.username}
              </label>
              <div className='relative'>
                <User
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                  placeholder={L.placeholderUsername}
                  required
                  disabled={loginMutation.isPending}
                />
              </div>
            </div>

            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                {L.password}
              </label>
              <div className='relative'>
                <Lock
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                  placeholder='••••••••'
                  required
                  disabled={loginMutation.isPending}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                  disabled={loginMutation.isPending}
                  aria-label={showPassword ? L.hidePassword : L.showPassword}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-sm text-gray-600'>{L.rememberMe}</span>
              </label>
              <a
                href='/forgot-password'
                className='text-sm text-blue-600 hover:text-blue-700'
              >
                {L.forgotPassword}
              </a>
            </div>

            {loginMutation.isError && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : L.loginFailed}
              </div>
            )}

            <button
              type='submit'
              disabled={loginMutation.isPending}
              className='w-full bg-gradient-to-r from-blue-800 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loginMutation.isPending ? L.signingIn : L.signIn}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className='text-center text-blue-100 text-sm mt-6'>
          {th.common.copyright}
        </p>
      </div>
    </div>
  )
}
