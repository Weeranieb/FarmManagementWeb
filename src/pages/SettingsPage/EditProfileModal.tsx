import { useMemo, useState } from 'react'
import { KeyRound, Loader2, X } from 'lucide-react'
import { th } from '../../locales/th'
import { useAppToast } from '../../contexts/AppToastContext'
import { useUpdateMeMutation } from '../../hooks/useAuth'
import { filterEmailInput, isValidEmail } from '../../utils/emailInput'
import { filterPhoneInput, THAI_PHONE_MAX_LENGTH } from '../../utils/phoneInput'
import type { User } from '../../api/auth'
import { ChangePasswordModal } from './ChangePasswordModal'

const L = th.settings

type Form = {
  firstName: string
  lastName: string
  username: string
  email: string
  contactNumber: string
}

type Errors = Partial<Record<keyof Form, string>>

function toForm(user: User | undefined): Form {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    username: user?.username ?? '',
    email: '', // not exposed in current User type
    contactNumber: user?.contactNumber ?? '',
  }
}

type Props = {
  user: User
  onClose: () => void
}

export function EditProfileModal({ user, onClose }: Props) {
  const initial = useMemo(() => toForm(user), [user])
  const [form, setForm] = useState<Form>(initial)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const mutation = useUpdateMeMutation()
  const { showToast } = useAppToast()

  const errors = useMemo<Errors>(() => {
    const e: Errors = {}
    if (!form.firstName.trim()) e.firstName = L.fieldRequired
    if (!form.username.trim()) e.username = L.fieldRequired
    if (form.email && !isValidEmail(form.email)) e.email = L.fieldInvalidEmail
    if (form.contactNumber && form.contactNumber.length !== THAI_PHONE_MAX_LENGTH) {
      e.contactNumber = L.fieldInvalidPhone
    }
    return e
  }, [form])

  const dirty = (Object.keys(form) as (keyof Form)[]).some(
    (k) => form[k] !== initial[k],
  )
  const valid = Object.keys(errors).length === 0
  const canSave = dirty && valid && !mutation.isPending

  const setField =
    (key: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      const next =
        key === 'email'
          ? filterEmailInput(raw)
          : key === 'contactNumber'
            ? filterPhoneInput(raw)
            : raw
      setForm((prev) => ({ ...prev, [key]: next }))
    }

  const handleSave = async () => {
    if (!canSave) return
    try {
      await mutation.mutateAsync({
        username: form.username.trim(),
        email: form.email.trim() || null,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || null,
        contactNumber: form.contactNumber.trim(),
      })
      showToast('success', L.profileSaved)
      onClose()
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : L.profileSaveFailed,
      )
    }
  }

  const isSaving = mutation.isPending

  return (
    <>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
        <div className='max-h-full w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl'>
          <div className='flex items-center justify-between border-b border-gray-200 p-4'>
            <h3 className='text-base font-semibold text-gray-800'>
              {L.editProfileTitle}
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
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <Field
                label={L.fieldFirstName}
                required
                error={errors.firstName}
                value={form.firstName}
                onChange={setField('firstName')}
                placeholder={L.placeholderFirstName}
                disabled={isSaving}
              />
              <Field
                label={L.fieldLastName}
                value={form.lastName}
                onChange={setField('lastName')}
                placeholder={L.placeholderLastName}
                disabled={isSaving}
              />
            </div>

            <Field
              label={L.fieldUsername}
              required
              error={errors.username}
              value={form.username}
              onChange={setField('username')}
              placeholder={L.placeholderUsername}
              disabled={isSaving}
              autoComplete='username'
            />

            <Field
              label={L.fieldEmail}
              error={errors.email}
              value={form.email}
              onChange={setField('email')}
              placeholder={L.placeholderEmail}
              disabled={isSaving}
              type='email'
              autoComplete='email'
            />

            <Field
              label={L.fieldContact}
              error={errors.contactNumber}
              value={form.contactNumber}
              onChange={setField('contactNumber')}
              placeholder={L.placeholderContact}
              disabled={isSaving}
              inputMode='numeric'
              maxLength={THAI_PHONE_MAX_LENGTH}
              autoComplete='tel'
            />

            <div className='pt-2'>
              <button
                type='button'
                onClick={() => setShowPasswordModal(true)}
                disabled={isSaving}
                className='inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50'
              >
                <KeyRound size={16} className='text-blue-600' />
                {L.changePassword}
              </button>
            </div>
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
              disabled={!canSave}
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-2 text-sm text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:from-transparent disabled:to-transparent disabled:text-gray-500'
            >
              {isSaving && <Loader2 size={14} className='animate-spin' />}
              {isSaving ? th.common.loading : L.saveProfile}
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal ? (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      ) : null}
    </>
  )
}

type FieldProps = {
  label: string
  required?: boolean
  error?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  type?: string
  inputMode?: 'text' | 'numeric' | 'email' | 'tel'
  maxLength?: number
  autoComplete?: string
}

function Field({
  label,
  required,
  error,
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
  inputMode,
  maxLength,
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label className='mb-1 block text-sm text-gray-700'>
        {label}{' '}
        {required ? (
          <span className='text-red-500'>{th.adminMasterData.required}</span>
        ) : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 ${
          error
            ? 'border-red-400 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {error ? <p className='mt-1 text-xs text-red-600'>{error}</p> : null}
    </div>
  )
}
