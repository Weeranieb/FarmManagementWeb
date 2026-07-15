import { useState } from 'react'
import { Eye, EyeOff, Loader2, X } from 'lucide-react'
import { th, type AdminMasterDataLocale } from '../../../locales/th'
import { useAdminResetPasswordMutation } from '../../../hooks/useUser'
import { useAppToast } from '../../../contexts/AppToastContext'
import { isValidPassword } from '../../../utils/password'
import type { UserResponse } from '../../../api/user'
import { getApiErrorMessage } from '../../../utils/apiErrorMessage'

type T = AdminMasterDataLocale

type Props = {
  t: T
  user: UserResponse
  isOpen: boolean
  onClose: () => void
}

export function ResetPasswordModal({ t, user, isOpen, onClose }: Props) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)

  const mutation = useAdminResetPasswordMutation()
  const { showToast } = useAppToast()

  const isPasswordValid = isValidPassword(password)
  const isMatch = password.length > 0 && password === confirmPassword
  const isValid = isPasswordValid && isMatch
  const isSaving = mutation.isPending

  const showMismatchError =
    confirmPassword.length > 0 && password !== confirmPassword

  const handleSave = async () => {
    if (!isValid) {
      if (!isPasswordValid) {
        showToast('error', t.userErrorInvalidPassword)
      } else {
        showToast('error', t.userErrorPasswordMismatch)
      }
      return
    }
    try {
      await mutation.mutateAsync({ id: user.id, password })
      showToast('success', t.userSuccessPasswordReset(user.username))
      onClose()
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(err, t.userErrorResetPasswordFailed),
      )
    }
  }

  if (!isOpen) return null

  const fullName = user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto'>
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <h3 className='text-base font-semibold text-gray-800'>
            {t.resetPasswordTitle}
          </h3>
          <button
            type='button'
            onClick={onClose}
            disabled={isSaving}
            className='text-gray-400 hover:text-gray-600 disabled:opacity-50'
            aria-label={t.modalClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className='p-4 space-y-3'>
          <div className='rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700'>
            <span className='text-gray-500'>{t.userUsername}: </span>
            <span className='font-medium'>{user.username}</span>
            <span className='text-gray-400 mx-1.5'>·</span>
            <span>{fullName}</span>
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              {t.userPasswordNew}{' '}
              <span className='text-red-500'>{t.required}</span>
            </label>
            <div className='relative'>
              <input
                type={passwordVisible ? 'text' : 'password'}
                autoComplete='new-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSaving}
                placeholder={t.placeholderUserPassword}
                className='w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
              />
              <button
                type='button'
                onClick={() => setPasswordVisible((v) => !v)}
                disabled={isSaving}
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none'
                aria-label={
                  passwordVisible ? th.login.hidePassword : th.login.showPassword
                }
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              {t.userPasswordConfirm}{' '}
              <span className='text-red-500'>{t.required}</span>
            </label>
            <div className='relative'>
              <input
                type={confirmVisible ? 'text' : 'password'}
                autoComplete='new-password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSaving}
                placeholder={t.placeholderUserPasswordConfirm}
                className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 ${
                  showMismatchError
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <button
                type='button'
                onClick={() => setConfirmVisible((v) => !v)}
                disabled={isSaving}
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none'
                aria-label={
                  confirmVisible ? th.login.hidePassword : th.login.showPassword
                }
              >
                {confirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {showMismatchError && (
              <p className='mt-1 text-xs text-red-600'>
                {t.userErrorPasswordMismatch}
              </p>
            )}
          </div>
        </div>

        <div className='flex items-center justify-end gap-2 p-4 border-t border-gray-200'>
          <button
            type='button'
            onClick={onClose}
            disabled={isSaving}
            className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50'
          >
            {t.modalCancel}
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className='px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:from-transparent disabled:to-transparent disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed inline-flex items-center gap-2'
          >
            {isSaving && <Loader2 size={14} className='animate-spin' />}
            {isSaving ? th.common.loading : t.resetPasswordSubmit}
          </button>
        </div>
      </div>
    </div>
  )
}
