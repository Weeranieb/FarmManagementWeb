import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { X } from 'lucide-react'
import { th } from '../../locales/th'
import type { FeedCollectionPageItem } from '../../api/feedCollection'

const L = th.feedCollections

export interface FeedCollectionUpdatePriceFormState {
  price: string
  date: string
}

interface FeedCollectionUpdatePriceModalProps {
  open: boolean
  feed: FeedCollectionPageItem | null
  onClose: () => void
  form: FeedCollectionUpdatePriceFormState
  setForm: Dispatch<SetStateAction<FeedCollectionUpdatePriceFormState>>
  onSubmit: (e: FormEvent) => void
  isPending: boolean
}

export function FeedCollectionUpdatePriceModal({
  open,
  feed,
  onClose,
  form,
  setForm,
  onSubmit,
  isPending,
}: FeedCollectionUpdatePriceModalProps) {
  if (!open || !feed) return null

  return (
    <div className='fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-8 w-96 relative'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl text-gray-800'>{L.updatePrice}</h2>
          <button
            type='button'
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className='mb-4'>
            <label className='block text-sm text-gray-600 mb-1'>
              {L.fieldName}
            </label>
            <input
              type='text'
              disabled
              aria-readonly='true'
              className='w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed'
              value={feed.name}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-sm text-gray-600 mb-1'>
              {L.fieldNewPrice}
            </label>
            <input
              type='number'
              step='0.01'
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-sm text-gray-600 mb-1'>
              {L.fieldDate}
            </label>
            <input
              type='date'
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <button
            type='submit'
            disabled={isPending}
            className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors'
          >
            {isPending ? th.common.loading : L.updatePrice}
          </button>
        </form>
      </div>
    </div>
  )
}
