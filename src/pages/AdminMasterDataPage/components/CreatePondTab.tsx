import type { FarmResponse } from '../../../api/farm'
import { formatFarmDisplayNameTH } from '../../../utils/masterDataName'
import type { AdminMasterDataLocale } from '../../../locales/th'

type T = AdminMasterDataLocale

type PondFormRow = { name: string }

type Props = {
  t: T
  selectedClientId: string
  selectedFarmId: string
  setSelectedFarmId: (id: string) => void
  clientFarms: FarmResponse[]
  farmListLoading: boolean
  pondForms: PondFormRow[]
  addPondForm: () => void
  removePondForm: (index: number) => void
  updatePondForm: (
    index: number,
    field: string,
    value: string | boolean,
  ) => void
  onSubmit: (e: React.FormEvent) => void
  onResetPonds: () => void
}

export function CreatePondTab({
  t,
  selectedClientId,
  selectedFarmId,
  setSelectedFarmId,
  clientFarms,
  farmListLoading,
  pondForms,
  addPondForm,
  removePondForm,
  updatePondForm,
  onSubmit,
  onResetPonds,
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
          {t.selectFarm} <span className='text-red-500'>{t.required}</span>
        </label>
        <select
          value={selectedFarmId}
          onChange={(e) => setSelectedFarmId(e.target.value)}
          disabled={farmListLoading}
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed'
          aria-label={t.selectFarm}
        >
          <option value=''>
            {farmListLoading
              ? t.loading
              : clientFarms.length === 0
                ? `-- ${t.noFarmsYet} --`
                : t.selectFarmOption}
          </option>
          {clientFarms.map((farm) => (
            <option key={farm.id} value={String(farm.id)}>
              {formatFarmDisplayNameTH(farm.name)}
            </option>
          ))}
        </select>
      </div>
      <div className='space-y-3'>
        {pondForms.map((pondForm, index) => (
          <div
            key={index}
            role='group'
            aria-label={t.pondFormRowAriaLabel(index + 1)}
            className='p-3 border border-gray-200 rounded-lg space-y-3'
          >
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-gray-800 tabular-nums'>
                {index + 1}.
              </span>
              {pondForms.length > 1 && (
                <button
                  type='button'
                  onClick={() => removePondForm(index)}
                  className='px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-all'
                >
                  {t.remove}
                </button>
              )}
            </div>
            <div>
              <label className='block text-xs text-gray-700 mb-1'>
                {t.pondName} <span className='text-red-500'>{t.required}</span>
              </label>
              <input
                type='text'
                value={pondForm.name}
                onChange={(e) => updatePondForm(index, 'name', e.target.value)}
                placeholder={t.placeholderPondName}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type='button'
        onClick={addPondForm}
        className='w-full flex items-center justify-center px-4 py-2 text-sm border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all'
      >
        {t.addAnotherPond}
      </button>
      <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
        <button
          type='submit'
          disabled={!selectedFarmId || pondForms.some((f) => !f.name.trim())}
          className='flex-1 flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:from-transparent disabled:to-transparent'
        >
          {t.createPonds} {pondForms.length} {t.pond}
        </button>
        <button
          type='button'
          onClick={onResetPonds}
          className='px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
        >
          {t.reset}
        </button>
      </div>
    </form>
  )
}
