import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { X } from 'lucide-react'
import { th } from '../../locales/th'
import { FEED_TYPE_OPTIONS, type FeedTypeValue } from '../../constants/feedType'

const L = th.feedCollections

export interface FeedCollectionAddFormState {
  name: string
  unit: string
  feedType: FeedTypeValue
  fcr: string
  price: string
  effectiveDate: string
}

interface FeedCollectionAddModalProps {
  open: boolean
  onClose: () => void
  form: FeedCollectionAddFormState
  setForm: Dispatch<SetStateAction<FeedCollectionAddFormState>>
  onSubmit: (e: FormEvent) => void
  isPending: boolean
  isError: boolean
  error: unknown
}

export function FeedCollectionAddModal({
  open,
  onClose,
  form,
  setForm,
  onSubmit,
  isPending,
  isError,
  error,
}: FeedCollectionAddModalProps) {
  if (!open) return null

  return (
    <div className='fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-8 w-96 relative'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl text-gray-800'>{L.addFeed}</h2>
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
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-sm text-gray-600 mb-1'>
              {L.fieldUnit}
            </label>
            <input
              type='text'
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-sm text-gray-600 mb-1'>
              {L.fieldFeedType}
            </label>
            <select
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
              value={form.feedType}
              onChange={(e) =>
                setForm({
                  ...form,
                  feedType: e.target.value as FeedTypeValue,
                })
              }
            >
              {FEED_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-4'>
            <label className='block text-sm text-gray-600 mb-1'>
              {L.fieldFcr}
            </label>
            <input
              type='number'
              step='any'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
              value={form.fcr}
              onChange={(e) => setForm({ ...form, fcr: e.target.value })}
              placeholder={L.fieldFcrPlaceholder}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-sm text-gray-600 mb-1'>
              {L.fieldPrice}
            </label>
            <input
              type='number'
              step='0.01'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-sm text-gray-600 mb-1'>
              {L.fieldPriceEffectiveDate}
            </label>
            <input
              type='date'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
              value={form.effectiveDate}
              onChange={(e) =>
                setForm({ ...form, effectiveDate: e.target.value })
              }
            />
            <p className='text-xs text-gray-500 mt-1'>
              {L.fieldPriceEffectiveDateHint}
            </p>
          </div>
          {isError && (
            <p className='mb-3 text-sm text-red-600' role='alert'>
              {L.saveFailed}
              {error instanceof Error ? `: ${error.message}` : ''}
            </p>
          )}
          <button
            type='submit'
            disabled={isPending}
            className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors'
          >
            {isPending ? th.common.loading : L.addFeed}
          </button>
        </form>
      </div>
    </div>
  )
}
