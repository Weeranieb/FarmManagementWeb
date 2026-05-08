import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { th, type AdminMasterDataLocale } from '../../../locales/th'
import { UserLevel } from '../../../constants/userLevel'
import { filterDigitsOnly, isDigitsOnly } from '../../../utils/phoneInput'
import { useCreateUserMutation } from '../../../hooks/useUser'
import { useAppToast } from '../../../contexts/AppToastContext'
import type { DropdownItem } from '../../../api/client'

type T = AdminMasterDataLocale

type Props = {
  t: T
  clientList: DropdownItem[]
  clientListLoading: boolean
}

type FormState = {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  contactNumber: string
  userLevel: number
  clientId: string
}

const EMPTY_FORM: FormState = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  contactNumber: '',
  userLevel: UserLevel.Normal,
  clientId: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function CreateUserTab({ t, clientList, clientListLoading }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const { showToast } = useAppToast()
  const mutation = useCreateUserMutation()

  const isSubmitting = mutation.isPending

  const requiresClient = form.userLevel === UserLevel.ClientAdmin

  const isValid =
    form.username.trim().length > 0 &&
    form.password.length >= 6 &&
    form.firstName.trim().length > 0 &&
    (!form.email || EMAIL_RE.test(form.email)) &&
    (!form.contactNumber || isDigitsOnly(form.contactNumber)) &&
    (!requiresClient || form.clientId !== '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      if (requiresClient && form.clientId === '') {
        showToast('error', t.userErrorClientRequired)
      } else if (form.email && !EMAIL_RE.test(form.email)) {
        showToast('error', t.userErrorInvalidEmail)
      } else {
        showToast('error', t.userErrorFillRequired)
      }
      return
    }
    try {
      await mutation.mutateAsync({
        username: form.username.trim(),
        password: form.password,
        email: form.email.trim() ? form.email.trim() : null,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() ? form.lastName.trim() : null,
        contactNumber: form.contactNumber.trim(),
        userLevel: form.userLevel,
        clientId: form.clientId ? Number(form.clientId) : null,
      })
      showToast('success', t.userSuccessCreated(form.username.trim()))
      setForm(EMPTY_FORM)
      setPasswordVisible(false)
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : t.userErrorCreateFailed,
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-3'>
      <div>
        <label className='block text-sm text-gray-700 mb-1'>
          {t.userUsername} <span className='text-red-500'>{t.required}</span>
        </label>
        <input
          type='text'
          autoComplete='off'
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          disabled={isSubmitting}
          placeholder={t.placeholderUsername}
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
        />
      </div>

      <div>
        <label className='block text-sm text-gray-700 mb-1'>
          {t.userPassword} <span className='text-red-500'>{t.required}</span>
        </label>
        <div className='relative'>
          <input
            type={passwordVisible ? 'text' : 'password'}
            autoComplete='new-password'
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={isSubmitting}
            placeholder={t.placeholderUserPassword}
            className='w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
          />
          <button
            type='button'
            onClick={() => setPasswordVisible((v) => !v)}
            disabled={isSubmitting}
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
          {t.userEmail}
        </label>
        <input
          type='email'
          autoComplete='off'
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value.toLowerCase() })
          }
          disabled={isSubmitting}
          placeholder={t.placeholderUserEmail}
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
        />
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm text-gray-700 mb-1'>
            {t.userFirstName} <span className='text-red-500'>{t.required}</span>
          </label>
          <input
            type='text'
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            disabled={isSubmitting}
            placeholder={t.placeholderUserFirstName}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
          />
        </div>
        <div>
          <label className='block text-sm text-gray-700 mb-1'>
            {t.userLastName}
          </label>
          <input
            type='text'
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            disabled={isSubmitting}
            placeholder={t.placeholderUserLastName}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm text-gray-700 mb-1'>
          {t.userContactNumber}
        </label>
        <input
          type='tel'
          inputMode='numeric'
          pattern='[0-9]*'
          value={form.contactNumber}
          onChange={(e) =>
            setForm({
              ...form,
              contactNumber: filterDigitsOnly(e.target.value),
            })
          }
          disabled={isSubmitting}
          placeholder={t.placeholderUserContactNumber}
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
        />
      </div>

      <div>
        <label className='block text-sm text-gray-700 mb-1'>
          {t.userUserLevel} <span className='text-red-500'>{t.required}</span>
        </label>
        <select
          value={form.userLevel}
          onChange={(e) =>
            setForm({ ...form, userLevel: Number(e.target.value) })
          }
          disabled={isSubmitting}
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
        >
          <option value={UserLevel.Normal}>{t.userLevelNormal}</option>
          <option value={UserLevel.ClientAdmin}>
            {t.userLevelClientAdmin}
          </option>
        </select>
      </div>

      <div className='rounded-lg border-2 border-blue-400 bg-blue-50/60 p-3'>
        <label className='block text-sm font-semibold text-blue-900 mb-1'>
          {t.userClient}
          {requiresClient && (
            <span className='text-red-500 ml-0.5'>{t.required}</span>
          )}
        </label>
        <select
          value={form.clientId}
          onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          disabled={isSubmitting || clientListLoading}
          className='w-full px-3 py-2 text-sm bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
        >
          <option value=''>
            {clientListLoading ? t.loadingClients : t.selectClient}
          </option>
          {clientList.map((c) => (
            <option key={c.key} value={String(c.key)}>
              {c.value}
            </option>
          ))}
        </select>
      </div>

      <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
        <button
          type='submit'
          disabled={!isValid || isSubmitting}
          className='flex-1 flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
        >
          {isSubmitting ? th.common.loading : t.createUser}
        </button>
        <button
          type='button'
          disabled={isSubmitting}
          onClick={() => {
            setForm(EMPTY_FORM)
            setPasswordVisible(false)
          }}
          className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {t.reset}
        </button>
      </div>
    </form>
  )
}
