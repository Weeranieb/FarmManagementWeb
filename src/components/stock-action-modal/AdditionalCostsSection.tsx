import { Plus, Trash2 } from 'lucide-react'
import { th } from '../../locales/th'
import type { AdditionalCost } from './types'

const focusRing = {
  blue: 'focus:ring-blue-500',
  purple: 'focus:ring-purple-500',
} as const

const addButton = {
  blue: 'text-blue-600 hover:bg-blue-50',
  purple: 'text-purple-600 hover:bg-purple-50',
} as const

export function AdditionalCostsSection({
  additionalCosts,
  fieldErrors,
  onAdd,
  onRemove,
  onChange,
  clearFieldError,
  variant = 'blue',
}: {
  additionalCosts: AdditionalCost[]
  fieldErrors: Record<string, string>
  onAdd: () => void
  onRemove: (id: string) => void
  onChange: (id: string, field: 'category' | 'cost', value: string) => void
  clearFieldError: (field: string) => void
  variant?: keyof typeof focusRing
}) {
  const L = th.stockActionModal
  const ring = focusRing[variant]
  const addCls = addButton[variant]

  return (
    <div className='border-t border-gray-200 pt-4'>
      <div className='flex items-center justify-between mb-3'>
        <label className='block text-sm font-medium text-gray-700'>
          {L.additionalCosts}
        </label>
        <button
          type='button'
          onClick={onAdd}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${addCls} rounded-lg transition-colors`}
        >
          <Plus size={16} />
          {L.addCost}
        </button>
      </div>
      {additionalCosts.length > 0 && (
        <div className='space-y-3'>
          {additionalCosts.map((cost) => (
            <div key={cost.id} className='flex gap-3 items-start'>
              <div className='flex-1'>
                <input
                  type='text'
                  placeholder={L.categoryPlaceholder}
                  value={cost.category}
                  onChange={(e) => {
                    onChange(cost.id, 'category', e.target.value)
                    clearFieldError(`category_${cost.id}`)
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 ${ring} focus:border-transparent outline-none transition-all ${
                    fieldErrors[`category_${cost.id}`]
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {fieldErrors[`category_${cost.id}`] && (
                  <p className='text-sm text-red-600 mt-1' role='alert'>
                    {fieldErrors[`category_${cost.id}`]}
                  </p>
                )}
              </div>
              <div className='w-32'>
                <div className='relative'>
                  <span
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium'
                    aria-hidden
                  >
                    {L.currencySymbol}
                  </span>
                  <input
                    type='number'
                    placeholder='0.00'
                    step='0.01'
                    min='0'
                    value={cost.cost || ''}
                    onChange={(e) => {
                      onChange(cost.id, 'cost', e.target.value)
                      clearFieldError(`cost_${cost.id}`)
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 ${ring} focus:border-transparent outline-none transition-all ${
                      fieldErrors[`cost_${cost.id}`]
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                </div>
                {fieldErrors[`cost_${cost.id}`] && (
                  <p className='text-sm text-red-600 mt-1' role='alert'>
                    {fieldErrors[`cost_${cost.id}`]}
                  </p>
                )}
              </div>
              <button
                type='button'
                onClick={() => onRemove(cost.id)}
                className='p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                title={L.removeCost}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
      {additionalCosts.length === 0 && (
        <div className='text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
          <p className='text-sm text-gray-500'>{L.noAdditionalCosts}</p>
        </div>
      )}
    </div>
  )
}
