import { useState } from 'react'
import { Eye, EyeOff, Loader2, X } from 'lucide-react'
import { th } from '../../locales/th'
import { useAppToast } from '../../contexts/AppToastContext'
import { useChangeMyPasswordMutation } from '../../hooks/useAuth'
import { isValidPassword } from '../../utils/password'
import { getApiErrorMessage } from '../../utils/apiErrorMessage'

const L = th.settings

type Props = {
  onClose: () => void
}

export function ChangePasswordModal({ onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const mutation = useChangeMyPasswordMutation()
  const { showToast } = useAppToast()

  const isNewValid = isValidPassword(newPassword)
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword
  const isReady =
    currentPassword.length > 0 && isNewValid && isMatch && !mutation.isPending

  const showMismatchError =
    confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleSave = async () => {
    if (!isReady) {
      if (!currentPassword) {
        showToast('error', L.currentPasswordRequired)
      } else if (!isNewValid) {
        showToast('error', th.adminMasterData.userErrorInvalidPassword)
      } else if (!isMatch) {
        showToast('error', th.adminMasterData.userErrorPasswordMismatch)
      }
      return
    }
    try {
      await mutation.mutateAsync({ currentPassword, newPassword })
      showToast('success', L.passwordChanged)
      onClose()
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(err, L.passwordChangeFailed),
      )
    }
  }

  const isSaving = mutation.isPending

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4'>
      <div className='max-h-full w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl'>
        <div className='flex items-center justify-between border-b border-gray-200 p-4'>
          <h3 className='text-base font-semibold text-gray-800'>
            {L.changePasswordTitle}
          </h3>
          <button
            type='button'
            onClick={onClose}
            disabled={isSaving}
            className='text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50'
            aria-label={th.adminMasterData.modalClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className='space-y-3 p-4'>
          <PasswordField
            label={L.currentPassword}
            required
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrent}
            onToggleVisible={() => setShowCurrent((v) => !v)}
            disabled={isSaving}
            autoComplete='current-password'
          />
          <PasswordField
            label={L.newPassword}
            required
            placeholder={th.adminMasterData.placeholderUserPassword}
            value={newPassword}
            onChange={setNewPassword}
            visible={showNew}
            onToggleVisible={() => setShowNew((v) => !v)}
            disabled={isSaving}
            autoComplete='new-password'
          />
          <PasswordField
            label={th.adminMasterData.userPasswordConfirm}
            required
            placeholder={th.adminMasterData.placeholderUserPasswordConfirm}
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirm}
            onToggleVisible={() => setShowConfirm((v) => !v)}
            disabled={isSaving}
            error={
              showMismatchError
                ? th.adminMasterData.userErrorPasswordMismatch
                : undefined
            }
            autoComplete='new-password'
          />
        </div>

        <div className='flex items-center justify-end gap-2 border-t border-gray-200 p-4'>
          <button
            type='button'
            onClick={onClose}
            disabled={isSaving}
            className='rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50'
          >
            {th.adminMasterData.modalCancel}
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={!isReady}
            className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-2 text-sm text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:from-transparent disabled:to-transparent disabled:text-gray-500'
          >
            {isSaving && <Loader2 size={14} className='animate-spin' />}
            {isSaving
              ? th.common.loading
              : th.adminMasterData.resetPasswordSubmit}
          </button>
        </div>
      </div>
    </div>
  )
}

type PasswordFieldProps = {
  label: string
  required?: boolean
  placeholder?: string
  value: string
  onChange: (v: string) => void
  visible: boolean
  onToggleVisible: () => void
  disabled?: boolean
  error?: string
  autoComplete?: string
}

function PasswordField({
  label,
  required,
  placeholder,
  value,
  onChange,
  visible,
  onToggleVisible,
  disabled,
  error,
  autoComplete,
}: PasswordFieldProps) {
  return (
    <div>
      <label className='mb-1 block text-sm text-gray-700'>
        {label}{' '}
        {required ? (
          <span className='text-red-500'>{th.adminMasterData.required}</span>
        ) : null}
      </label>
      <div className='relative'>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:border-transparent focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 ${
            error
              ? 'border-red-400 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        <button
          type='button'
          onClick={onToggleVisible}
          disabled={disabled}
          className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 outline-none transition-colors hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none'
          aria-label={visible ? th.login.hidePassword : th.login.showPassword}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? <p className='mt-1 text-xs text-red-600'>{error}</p> : null}
    </div>
  )
}
