import { useState } from 'react'
import type { FormEvent } from 'react'
import { Fish, Mail, Lock } from 'lucide-react'

interface LoginPageProps {
  onLogin: (email: string, password: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-slate-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo and Title */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4'>
            <Fish size={40} className='text-blue-600' />
          </div>
          <h1 className='text-4xl text-white mb-2'>Boonma Farm</h1>
          <p className='text-blue-100 text-lg'>Farm Management System</p>
        </div>

        {/* Login Form */}
        <div className='bg-white rounded-2xl shadow-2xl p-8'>
          <h2 className='text-2xl text-gray-800 mb-6 text-center'>
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                Email Address
              </label>
              <div className='relative'>
                <Mail
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                  placeholder='admin@boonmafarm.com'
                  required
                />
              </div>
            </div>

            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                Password
              </label>
              <div className='relative'>
                <Lock
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                  size={20}
                />
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                  placeholder='••••••••'
                  required
                />
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
                <span className='text-sm text-gray-600'>Remember me</span>
              </label>
              <a
                href='/forgot-password'
                className='text-sm text-blue-600 hover:text-blue-700'
              >
                Forgot password?
              </a>
            </div>

            <button
              type='submit'
              className='w-full bg-gradient-to-r from-blue-800 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg transition-all'
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className='text-center text-blue-100 text-sm mt-6'>
          © 2026 Boonma Farm. All rights reserved.
        </p>
      </div>
    </div>
  )
}
