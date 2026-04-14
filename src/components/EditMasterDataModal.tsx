import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { filterDigitsOnly, isDigitsOnly } from '../utils/phoneInput'
import { th } from '../locales/th'

export interface EditMasterDataModalLocale {
  labelName: string
  placeholderName: string
  errorNameRequired: string
  save: string
  cancel: string
  close: string
}

const defaultLocale: EditMasterDataModalLocale = {
  labelName: 'ชื่อ',
  placeholderName: 'กรอกชื่อ',
  errorNameRequired: 'กรุณากรอกชื่อ',
  save: 'บันทึก',
  cancel: 'ยกเลิก',
  close: 'ปิด',
}

/** Full client edit block (name stays in the main field above). Omit for farm/pond. */
export interface EditMasterDataModalClientExtras {
  ownerName: string
  contactNumber: string
  onOwnerNameChange: (value: string) => void
  onContactNumberChange: (value: string) => void
  isTouristFishingEnabled: boolean
  onTouristFishingEnabledChange: (value: boolean) => void
  touristFishingLabel: string
  labelOwnerName: string
  labelContactNumber: string
  placeholderOwnerName: string
  placeholderContactNumber: string
  errorOwnerRequired: string
  errorContactRequired: string
  errorContactDigitsOnly: string
}

interface EditMasterDataModalProps {
  isOpen: boolean
  onClose: () => void
  currentName: string
  title: string
  onSave: (newName: string) => void | Promise<void>
  /** When true, blocks interaction and shows saving overlay (set by parent during API). */
  isSaving?: boolean
  locale?: Partial<EditMasterDataModalLocale>
  clientEditExtras?: EditMasterDataModalClientExtras | null
}

export function EditMasterDataModal({
  isOpen,
  onClose,
  currentName,
  title,
  onSave,
  isSaving = false,
  locale: localeOverride,
  clientEditExtras,
}: EditMasterDataModalProps) {
  const locale = { ...defaultLocale, ...localeOverride }
  const [name, setName] = useState(currentName)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return
    const trimmed = name.trim()
    setError('')
    if (!trimmed) {
      setError(locale.errorNameRequired)
      return
    }
    if (clientEditExtras) {
      if (!clientEditExtras.ownerName.trim()) {
        setError(clientEditExtras.errorOwnerRequired)
        return
      }
      const contactTrimmed = clientEditExtras.contactNumber.trim()
      if (!contactTrimmed) {
        setError(clientEditExtras.errorContactRequired)
        return
      }
      if (!isDigitsOnly(contactTrimmed)) {
        setError(clientEditExtras.errorContactDigitsOnly)
        return
      }
    }
    onSave(trimmed)
    // Parent closes modal on success; don't close here so errors keep modal open
  }

  const formCanSubmit = clientEditExtras
    ? Boolean(name.trim()) &&
      Boolean(clientEditExtras.ownerName.trim()) &&
      isDigitsOnly(clientEditExtras.contactNumber)
    : Boolean(name.trim())

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50'
        onClick={() => {
          if (!isSaving) onClose()
        }}
        aria-hidden
      />
      <div className='relative overflow-hidden rounded-lg bg-white shadow-xl w-full max-w-md mx-4 p-6'>
        {isSaving && (
          <div
            className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-white/70 backdrop-blur-[1px]'
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
            <span className='text-sm font-medium text-slate-700'>
              {th.common.loading}
            </span>
          </div>
        )}
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-gray-800'>{title}</h2>
          <button
            type='button'
            disabled={isSaving}
            onClick={() => {
              if (!isSaving) onClose()
            }}
            className='p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40'
            aria-label={locale.close}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              {locale.labelName}
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              disabled={isSaving}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={locale.placeholderName}
              autoFocus
            />
            {error && (
              <p className='mt-1 text-sm text-red-600' role='alert'>
                {error}
              </p>
            )}
          </div>
          {clientEditExtras && (
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {clientEditExtras.labelOwnerName}
                </label>
                <input
                  type='text'
                  value={clientEditExtras.ownerName}
                  onChange={(e) => {
                    clientEditExtras.onOwnerNameChange(e.target.value)
                    if (error) setError('')
                  }}
                  disabled={isSaving}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500'
                  placeholder={clientEditExtras.placeholderOwnerName}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {clientEditExtras.labelContactNumber}
                </label>
                <input
                  type='tel'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  value={clientEditExtras.contactNumber}
                  onChange={(e) => {
                    clientEditExtras.onContactNumberChange(
                      filterDigitsOnly(e.target.value),
                    )
                    if (error) setError('')
                  }}
                  disabled={isSaving}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500'
                  placeholder={clientEditExtras.placeholderContactNumber}
                />
              </div>
              <div className='flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3'>
                <input
                  id='edit-client-tourist-fishing'
                  type='checkbox'
                  checked={clientEditExtras.isTouristFishingEnabled}
                  disabled={isSaving}
                  onChange={(e) =>
                    clientEditExtras.onTouristFishingEnabledChange(
                      e.target.checked,
                    )
                  }
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50'
                />
                <label
                  htmlFor='edit-client-tourist-fishing'
                  className='text-sm text-gray-800 cursor-pointer select-none'
                >
                  {clientEditExtras.touristFishingLabel}
                </label>
              </div>
            </>
          )}
          <div className='flex justify-end gap-2 pt-2'>
            <button
              type='button'
              disabled={isSaving}
              onClick={() => {
                if (!isSaving) onClose()
              }}
              className='px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            >
              {locale.cancel}
            </button>
            <button
              type='submit'
              disabled={!formCanSubmit || isSaving}
              className='inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
            >
              {isSaving && (
                <Loader2
                  className='h-4 w-4 shrink-0 animate-spin'
                  aria-hidden
                />
              )}
              {isSaving ? th.common.loading : locale.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
