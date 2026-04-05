import { useState } from 'react'
import { X } from 'lucide-react'

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
}

interface EditMasterDataModalProps {
  isOpen: boolean
  onClose: () => void
  currentName: string
  title: string
  onSave: (newName: string) => void
  locale?: Partial<EditMasterDataModalLocale>
  clientEditExtras?: EditMasterDataModalClientExtras | null
}

export function EditMasterDataModal({
  isOpen,
  onClose,
  currentName,
  title,
  onSave,
  locale: localeOverride,
  clientEditExtras,
}: EditMasterDataModalProps) {
  const locale = { ...defaultLocale, ...localeOverride }
  const [name, setName] = useState(currentName)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
      if (!clientEditExtras.contactNumber.trim()) {
        setError(clientEditExtras.errorContactRequired)
        return
      }
    }
    onSave(trimmed)
    // Parent closes modal on success; don't close here so errors keep modal open
  }

  const formCanSubmit = clientEditExtras
    ? Boolean(name.trim()) &&
      Boolean(clientEditExtras.ownerName.trim()) &&
      Boolean(clientEditExtras.contactNumber.trim())
    : Boolean(name.trim())

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50'
        onClick={onClose}
        aria-hidden
      />
      <div className='relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-gray-800'>{title}</h2>
          <button
            type='button'
            onClick={onClose}
            className='p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                  placeholder={clientEditExtras.placeholderOwnerName}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {clientEditExtras.labelContactNumber}
                </label>
                <input
                  type='tel'
                  value={clientEditExtras.contactNumber}
                  onChange={(e) => {
                    clientEditExtras.onContactNumberChange(e.target.value)
                    if (error) setError('')
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                  placeholder={clientEditExtras.placeholderContactNumber}
                />
              </div>
              <div className='flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3'>
                <input
                  id='edit-client-tourist-fishing'
                  type='checkbox'
                  checked={clientEditExtras.isTouristFishingEnabled}
                  onChange={(e) =>
                    clientEditExtras.onTouristFishingEnabledChange(
                      e.target.checked,
                    )
                  }
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
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
              onClick={onClose}
              className='px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
            >
              {locale.cancel}
            </button>
            <button
              type='submit'
              disabled={!formCanSubmit}
              className='px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
            >
              {locale.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
