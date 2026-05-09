import { th, type AdminMasterDataLocale } from '../../../locales/th'

type Props = {
  t: AdminMasterDataLocale
  username: string
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
}

export function UserDeleteConfirm({
  t,
  username,
  onCancel,
  onConfirm,
  isPending,
}: Props) {
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-8 w-[28rem] max-w-[90vw] shadow-xl relative z-50'>
        <h2 className='text-xl font-semibold text-gray-900 mb-3'>
          {t.userDeleteConfirmTitle}
        </h2>
        <p className='text-base text-gray-700 leading-relaxed'>
          {t.userDeleteConfirmMessage(username)}
        </p>
        <p className='text-sm text-red-600 leading-relaxed mb-6'>
          {t.userDeleteConfirmWarning}
        </p>
        <div className='flex gap-3 justify-end'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isPending}
            className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50'
          >
            {t.userDeleteConfirmCancel}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isPending}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50'
          >
            {isPending ? th.common.loading : t.userDeleteConfirmSubmit}
          </button>
        </div>
      </div>
    </div>
  )
}
