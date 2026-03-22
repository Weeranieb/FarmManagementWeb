import { ArrowRight, ShoppingCart, TrendingUp, X } from 'lucide-react'
import { th } from '../../locales/th'
import type { ActionType } from './types'

export function StockActionModalHeader({
  pondName,
  onClose,
  showConfirmation,
  actionType,
  onActionTypeChange,
}: {
  pondName: string
  onClose: () => void
  showConfirmation: boolean
  actionType: ActionType
  onActionTypeChange: (type: ActionType) => void
}) {
  const L = th.stockActionModal

  return (
    <div className='px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10'>
      <div className='flex items-center justify-between'>
        <div>
          <h2
            id='stock-action-modal-title'
            className='text-xl font-semibold text-gray-900'
          >
            {L.title}
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            <span className='font-medium text-blue-600'>{pondName}</span>
          </p>
        </div>
        <button
          type='button'
          onClick={onClose}
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          aria-label={L.ariaClose}
        >
          <X size={20} className='text-gray-500' />
        </button>
      </div>
      <div className='mt-5 grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg'>
        <button
          type='button'
          disabled={showConfirmation}
          onClick={() => onActionTypeChange('add')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            actionType === 'add'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp size={16} />
          {L.addStock}
        </button>
        <button
          type='button'
          disabled={showConfirmation}
          onClick={() => onActionTypeChange('transfer')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            actionType === 'transfer'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowRight size={16} />
          {L.transfer}
        </button>
        <button
          type='button'
          disabled={showConfirmation}
          onClick={() => onActionTypeChange('sell')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            actionType === 'sell'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingCart size={16} />
          {L.sellStock}
        </button>
      </div>
    </div>
  )
}
