import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Fish } from 'lucide-react'
import { th } from '../locales/th'

const L = th.forgotPassword
const C = th.common

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-slate-900 flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
              <CheckCircle className='text-green-600' size={32} />
            </div>
            <h2 className='text-2xl text-gray-800 mb-4'>{L.checkEmail}</h2>
            <p className='text-gray-600 mb-6'>
              {L.checkEmailMessage} <strong>{email}</strong>
            </p>
            <p className='text-sm text-gray-500 mb-6'>
              {L.noEmail}
            </p>
            <Link
              to='/login'
              className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-700'
            >
              <ArrowLeft size={20} />
              <span>{L.backToLogin}</span>
            </Link>
          </div>
        </div>
      </div>
    )
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

        {/* Forgot Password Form */}
        <div className='bg-white rounded-2xl shadow-2xl p-8'>
          <h2 className='text-2xl text-gray-800 mb-2 text-center'>
            {L.heading}
          </h2>
          <p className='text-gray-600 text-center mb-6'>
            {L.description}
          </p>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm text-gray-700 mb-2'>
                {L.emailLabel}
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
                  placeholder={L.placeholderEmail}
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              className='w-full bg-gradient-to-r from-blue-800 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg transition-all'
            >
              {L.sendInstructions}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <Link
              to='/login'
              className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-700'
            >
              <ArrowLeft size={18} />
              <span>{L.backToLogin}</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className='text-center text-blue-100 text-sm mt-6'>
          {C.copyright}
        </p>
      </div>
    </div>
  )
}
