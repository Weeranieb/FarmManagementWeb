import type { AdminMasterDataLocale } from '../../../locales/th'

type T = AdminMasterDataLocale

type Props = {
  t: T
  selectedClientId: string
  farmForm: { name: string }
  onFarmNameChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onReset: () => void
}

export function CreateFarmTab({
  t,
  selectedClientId,
  farmForm,
  onFarmNameChange,
  onSubmit,
  onReset,
}: Props) {
  if (!selectedClientId) {
    return (
      <div className='rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-gray-600'>
        <p className='text-sm'>{t.pleaseSelectClientFirst}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <div>
        <label className='block text-sm text-gray-700 mb-1'>
          {t.farmName} <span className='text-red-500'>{t.required}</span>
        </label>
        <input
          type='text'
          value={farmForm.name}
          onChange={(e) => onFarmNameChange(e.target.value)}
          placeholder={t.placeholderFarmName}
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
        />
      </div>
      <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
        <button
          type='submit'
          disabled={!farmForm.name.trim()}
          className='flex-1 flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
        >
          {t.createFarm}
        </button>
        <button
          type='button'
          onClick={onReset}
          className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
        >
          {t.reset}
        </button>
      </div>
    </form>
  )
}
