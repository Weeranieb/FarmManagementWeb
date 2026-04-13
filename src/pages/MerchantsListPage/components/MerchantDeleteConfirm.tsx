import { th } from '../../../locales/th'

const L = th.merchants

type Props = {
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
}

export function MerchantDeleteConfirm({
  onCancel,
  onConfirm,
  isPending,
}: Props) {
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-8 w-96 shadow-xl relative z-50'>
        <h2 className='text-xl text-gray-800 mb-2'>{L.deleteConfirmTitle}</h2>
        <p className='text-gray-600 mb-6'>{L.deleteConfirmMessage}</p>
        <div className='flex gap-3 justify-end'>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
          >
            {L.deleteConfirmNo}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isPending}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50'
          >
            {isPending ? th.common.loading : L.deleteConfirmYes}
          </button>
        </div>
      </div>
    </div>
  )
}
