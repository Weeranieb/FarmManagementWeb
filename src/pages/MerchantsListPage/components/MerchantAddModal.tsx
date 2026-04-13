import { X } from 'lucide-react'
import { th } from '../../../locales/th'

const L = th.merchants

type Props = {
  open: boolean
  onClose: () => void
  formData: { name: string; contactNumber: string; location: string }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string
      contactNumber: string
      location: string
    }>
  >
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
}

export function MerchantAddModal({
  open,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isPending,
}: Props) {
  if (!open) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-8 w-96 shadow-xl relative z-50'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl text-gray-800'>{L.modalTitle}</h2>
          <button
            type='button'
            className='text-gray-500 hover:text-gray-700'
            onClick={onClose}
            aria-label={L.modalClose}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                {L.name}
              </label>
              <input
                type='text'
                placeholder={L.placeholderName}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                {L.contact}
              </label>
              <input
                type='text'
                placeholder={L.placeholderContact}
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactNumber: e.target.value,
                  })
                }
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                {L.location}
              </label>
              <input
                type='text'
                placeholder={L.placeholderLocation}
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value,
                  })
                }
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              />
            </div>
          </div>
          <div className='mt-6'>
            <button
              type='submit'
              disabled={isPending}
              className='w-full px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50'
            >
              {isPending ? th.common.loading : L.submitAdd}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
