import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { th, type AdminMasterDataLocale } from '../../../locales/th'
import { UserLevel } from '../../../constants/userLevel'
import { getApiErrorMessage } from '../../../utils/apiErrorMessage'
import {
  filterPhoneInput,
  isDigitsOnly,
  THAI_PHONE_MAX_LENGTH,
} from '../../../utils/phoneInput'
import { filterEmailInput, isValidEmail } from '../../../utils/emailInput'
import { useAdminUpdateUserMutation } from '../../../hooks/useUser'
import { useAppToast } from '../../../contexts/AppToastContext'
import type { DropdownItem } from '../../../api/client'
import type { UserResponse } from '../../../api/user'

type T = AdminMasterDataLocale

type Props = {
  t: T
  user: UserResponse
  clientList: DropdownItem[]
  isOpen: boolean
  onClose: () => void
}

export function EditUserModal({ t, user, clientList, isOpen, onClose }: Props) {
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email ?? '')
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName ?? '')
  const [contactNumber, setContactNumber] = useState(user.contactNumber ?? '')
  const [userLevel, setUserLevel] = useState<number>(user.userLevel)
  const [clientId, setClientId] = useState<string>(
    user.clientId != null ? String(user.clientId) : '',
  )

  const mutation = useAdminUpdateUserMutation()
  const { showToast } = useAppToast()

  const requiresClient = userLevel === UserLevel.ClientAdmin
  const isValid =
    username.trim().length > 0 &&
    firstName.trim().length > 0 &&
    (!email || isValidEmail(email)) &&
    (!contactNumber || isDigitsOnly(contactNumber)) &&
    (!requiresClient || clientId !== '')

  const isSaving = mutation.isPending

  const handleSave = async () => {
    if (!isValid) {
      if (requiresClient && clientId === '') {
        showToast('error', t.userErrorClientRequired)
      } else if (email && !isValidEmail(email)) {
        showToast('error', t.userErrorInvalidEmail)
      } else {
        showToast('error', t.userErrorFillRequired)
      }
      return
    }
    try {
      await mutation.mutateAsync({
        id: user.id,
        body: {
          username: username.trim(),
          email: email.trim() ? email.trim() : null,
          firstName: firstName.trim(),
          lastName: lastName.trim() ? lastName.trim() : null,
          contactNumber: contactNumber.trim(),
          userLevel,
          clientId: clientId ? Number(clientId) : null,
        },
      })
      showToast('success', t.userSuccessUpdated(username.trim()))
      onClose()
    } catch (err) {
      showToast(
        'error',
        getApiErrorMessage(err, t.userErrorUpdateFailed),
      )
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto'>
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <h3 className='text-base font-semibold text-gray-800'>
            {t.editUserTitle}
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
          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              {t.userUsername} <span className='text-red-500'>{t.required}</span>
            </label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSaving}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100'
            />
          </div>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              {t.userEmail}
            </label>
            <input
              type='email'
              autoComplete='email'
              value={email}
              onChange={(e) => setEmail(filterEmailInput(e.target.value))}
              disabled={isSaving}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent outline-none disabled:bg-gray-100 ${
                email && !isValidEmail(email)
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {email && !isValidEmail(email) && (
              <p className='mt-1 text-xs text-red-600'>
                {t.userErrorInvalidEmail}
              </p>
            )}
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm text-gray-700 mb-1'>
                {t.userFirstName}{' '}
                <span className='text-red-500'>{t.required}</span>
              </label>
              <input
                type='text'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSaving}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100'
              />
            </div>
            <div>
              <label className='block text-sm text-gray-700 mb-1'>
                {t.userLastName}
              </label>
              <input
                type='text'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSaving}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100'
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
              maxLength={THAI_PHONE_MAX_LENGTH}
              value={contactNumber}
              onChange={(e) => setContactNumber(filterPhoneInput(e.target.value))}
              disabled={isSaving}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100'
            />
          </div>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              {t.userUserLevel}
            </label>
            <select
              value={userLevel}
              onChange={(e) => setUserLevel(Number(e.target.value))}
              disabled={isSaving}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100'
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
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isSaving}
              className='w-full px-3 py-2 text-sm bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100'
            >
              <option value=''>{t.selectClient}</option>
              {clientList.map((c) => (
                <option key={c.key} value={String(c.key)}>
                  {c.value}
                </option>
              ))}
            </select>
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
            {isSaving ? th.common.loading : t.updateUser}
          </button>
        </div>
      </div>
    </div>
  )
}
