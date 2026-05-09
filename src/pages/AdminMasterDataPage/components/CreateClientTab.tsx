import { th, type AdminMasterDataLocale } from '../../../locales/th'
import {
  filterPhoneInput,
  THAI_PHONE_MAX_LENGTH,
} from '../../../utils/phoneInput'
import { filterEmailInput, isValidEmail } from '../../../utils/emailInput'

type T = AdminMasterDataLocale

type Props = {
  t: T
  clientForm: {
    name: string
    contactPerson: string
    phone: string
    email: string
  }
  setClientForm: React.Dispatch<
    React.SetStateAction<{
      name: string
      contactPerson: string
      phone: string
      email: string
    }>
  >
  onSubmit: (e: React.FormEvent) => void
  isClientFormValid: boolean
  isSubmitting?: boolean
}

export function CreateClientTab({
  t,
  clientForm,
  setClientForm,
  onSubmit,
  isClientFormValid,
  isSubmitting = false,
}: Props) {
  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <div>
        <label className='block text-sm text-gray-700 mb-1'>
          {t.clientName} <span className='text-red-500'>{t.required}</span>
        </label>
        <input
          type='text'
          value={clientForm.name}
          onChange={(e) =>
            setClientForm({ ...clientForm, name: e.target.value })
          }
          disabled={isSubmitting}
          placeholder={t.placeholderClientName}
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
        />
      </div>
      <div>
        <label className='block text-sm text-gray-700 mb-1'>
          {t.contactPerson} <span className='text-red-500'>{t.required}</span>
        </label>
        <input
          type='text'
          value={clientForm.contactPerson}
          onChange={(e) =>
            setClientForm({
              ...clientForm,
              contactPerson: e.target.value,
            })
          }
          disabled={isSubmitting}
          placeholder={t.placeholderContactPerson}
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
        />
      </div>
      <div>
        <label className='block text-sm text-gray-700 mb-1'>
          {t.phone} <span className='text-red-500'>{t.required}</span>
        </label>
        <input
          type='tel'
          inputMode='numeric'
          pattern='[0-9]*'
          autoComplete='tel-national'
          maxLength={THAI_PHONE_MAX_LENGTH}
          value={clientForm.phone}
          onChange={(e) =>
            setClientForm({
              ...clientForm,
              phone: filterPhoneInput(e.target.value),
            })
          }
          disabled={isSubmitting}
          placeholder={t.placeholderPhone}
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500'
        />
      </div>
      <div>
        <label className='block text-sm text-gray-700 mb-1'>{t.email}</label>
        <input
          type='email'
          autoComplete='email'
          value={clientForm.email}
          onChange={(e) =>
            setClientForm({
              ...clientForm,
              email: filterEmailInput(e.target.value),
            })
          }
          disabled={isSubmitting}
          placeholder={t.placeholderEmail}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 ${
            clientForm.email && !isValidEmail(clientForm.email)
              ? 'border-red-400 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {clientForm.email && !isValidEmail(clientForm.email) && (
          <p className='mt-1 text-xs text-red-600'>{t.userErrorInvalidEmail}</p>
        )}
      </div>
      <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
        <button
          type='submit'
          disabled={!isClientFormValid || isSubmitting}
          className='flex-1 flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
        >
          {isSubmitting ? th.common.loading : t.createClient}
        </button>
        <button
          type='button'
          disabled={isSubmitting}
          onClick={() =>
            setClientForm({
              name: '',
              contactPerson: '',
              phone: '',
              email: '',
            })
          }
          className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {t.reset}
        </button>
      </div>
    </form>
  )
}
