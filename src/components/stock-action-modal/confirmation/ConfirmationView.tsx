import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import type {
  PondFillPreviewResponse,
  PondMovePreviewResponse,
  PondSellPreviewResponse,
} from '../../../api/pond'
import { th } from '../../../locales/th'
import type { ActionType, NormalizedPond, StockActionModalPond } from '../types'
import { AddPreviewDetails } from './preview/AddPreviewDetails'
import { SellPreviewDetails } from './preview/SellPreviewDetails'
import { TransferPreviewDetails } from './preview/TransferPreviewDetails'

export function ConfirmationView({
  actionType,
  pond,
  previewResult,
  destinationPond,
  activityDate,
  closePond,
  notes,
  buyer,
  merchants,
  submitError,
  isSubmitting,
  onBack,
  onConfirm,
  getConfirmButtonLabel,
  getButtonColor,
}: {
  actionType: ActionType
  pond: NormalizedPond
  previewResult:
    | PondFillPreviewResponse
    | PondMovePreviewResponse
    | PondSellPreviewResponse
  destinationPond: StockActionModalPond | null
  activityDate: string
  closePond: boolean
  notes: string
  buyer: string
  merchants: { id: number; name: string }[]
  submitError: string | null
  isSubmitting: boolean
  onBack: () => void
  onConfirm: () => void
  getConfirmButtonLabel: () => string
  getButtonColor: () => string
}) {
  const L = th.stockActionModal

  const accentMap = {
    add: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800',
      icon: <TrendingUp size={16} />,
    },
    transfer: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800',
      icon: <ArrowRight size={16} />,
    },
    sell: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-800',
      icon: <ShoppingCart size={16} />,
    },
  }
  const accent = accentMap[actionType]

  const merchantName = buyer
    ? (merchants.find((m) => String(m.id) === buyer)?.name ?? buyer)
    : '—'

  const formatDate = (d: string) => {
    try {
      const [y, m, day] = d.split('-').map(Number)
      return `${day}/${m}/${y + 543}`
    } catch {
      return d
    }
  }

  const stockBefore =
    'stockBefore' in previewResult
      ? (previewResult as PondFillPreviewResponse | PondMovePreviewResponse)
          .stockBefore
      : null
  const stockAfter =
    'stockAfter' in previewResult
      ? (previewResult as PondFillPreviewResponse | PondMovePreviewResponse)
          .stockAfter
      : null
  const stockDelta =
    'stockDelta' in previewResult
      ? (previewResult as PondFillPreviewResponse | PondMovePreviewResponse)
          .stockDelta
      : null

  return (
    <div className='p-6 space-y-5'>
      {/* Step indicator */}
      <div className='flex items-center gap-3 text-sm'>
        <div className='flex items-center gap-1.5 text-green-600'>
          <div className='w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold'>
            <Check size={14} />
          </div>
          <span className='font-medium'>{L.stepFillDetails}</span>
        </div>
        <div className='h-px flex-1 bg-gray-300' />
        <div className={`flex items-center gap-1.5 ${accent.text}`}>
          <div
            className={`w-6 h-6 rounded-full ${accent.badge} flex items-center justify-center text-xs font-bold`}
          >
            2
          </div>
          <span className='font-medium'>{L.stepReviewConfirm}</span>
        </div>
      </div>

      {/* Warning banner */}
      <div
        className={`flex items-center gap-3 rounded-lg p-3 ${actionType === 'add' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}
      >
        <AlertTriangle size={18} className='shrink-0' />
        <p className='text-sm font-medium'>{L.cannotUndo}</p>
      </div>

      {!previewResult.valid && previewResult.validationError && (
        <div className='rounded-lg p-3 bg-red-50 border border-red-200 text-sm text-red-700'>
          {previewResult.validationError}
        </div>
      )}

      {/* Transaction badge */}
      <div className='flex items-center gap-2'>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${accent.badge}`}
        >
          {accent.icon}
          {actionType === 'add'
            ? L.addStock
            : actionType === 'transfer'
              ? L.transfer
              : L.sellStock}
        </span>
      </div>

      {/* General info card */}
      <div className='bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2 text-sm'>
        <div className='flex justify-between'>
          <span className='text-gray-500'>
            {actionType === 'transfer' ? L.sourcePond : L.sourcePond}
          </span>
          <span className='font-medium text-gray-900'>{pond.name}</span>
        </div>
        {actionType === 'transfer' && destinationPond && (
          <div className='flex justify-between'>
            <span className='text-gray-500'>{L.destinationPondLabel}</span>
            <span className='font-medium text-gray-900'>
              {destinationPond.name}
            </span>
          </div>
        )}
        {actionType === 'sell' && (
          <div className='flex justify-between'>
            <span className='text-gray-500'>{L.buyerMarket}</span>
            <span className='font-medium text-gray-900'>{merchantName}</span>
          </div>
        )}
        <div className='flex justify-between'>
          <span className='text-gray-500'>{L.dateLabel}</span>
          <span className='font-medium text-gray-900'>
            {formatDate(activityDate)}
          </span>
        </div>
        {(actionType === 'sell' || actionType === 'transfer') && (
          <div className='flex justify-between'>
            <span className='text-gray-500'>{L.closePondAfter}</span>
            <span className='font-medium text-gray-900'>
              {closePond ? L.yes : L.no}
            </span>
          </div>
        )}
        {notes.trim() && (
          <div className='flex justify-between'>
            <span className='text-gray-500'>{L.notes}</span>
            <span className='font-medium text-gray-900 text-right max-w-[60%]'>
              {notes}
            </span>
          </div>
        )}
      </div>

      {/* Action-specific details */}
      {actionType === 'add' && 'baseStockCost' in previewResult && (
        <AddPreviewDetails
          preview={previewResult as PondFillPreviewResponse}
          accent={accent}
        />
      )}
      {actionType === 'transfer' && 'baseTransferCost' in previewResult && (
        <TransferPreviewDetails
          preview={previewResult as PondMovePreviewResponse}
          accent={accent}
        />
      )}
      {actionType === 'sell' && 'items' in previewResult && (
        <SellPreviewDetails
          preview={previewResult as PondSellPreviewResponse}
          accent={accent}
        />
      )}

      {stockBefore != null && stockAfter != null && stockDelta != null && (
        <div className={`rounded-lg p-4 ${accent.bg} border ${accent.border}`}>
          <p className={`text-sm font-semibold ${accent.text} mb-3`}>
            {L.stockImpact}
          </p>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <p className='text-xs text-gray-500'>{L.before}</p>
              <p className='text-xl font-bold text-gray-900'>
                {stockBefore.toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500'>{L.after}</p>
              <p className='text-xl font-bold text-gray-900'>
                {stockAfter.toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500'>
                {actionType === 'add'
                  ? L.added
                  : actionType === 'transfer'
                    ? L.transferred
                    : L.sold}
              </p>
              <p
                className={`text-xl font-bold ${stockDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {stockDelta >= 0 ? '+' : ''}
                {stockDelta.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className='rounded-lg p-3 bg-red-50 border border-red-200 text-sm text-red-700'>
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center justify-between gap-3 pt-4 border-t border-gray-200'>
        <button
          type='button'
          onClick={onBack}
          className='flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors'
        >
          <ArrowLeft size={16} />
          {L.backToEdit}
        </button>
        <button
          type='button'
          onClick={onConfirm}
          disabled={isSubmitting || !previewResult.valid}
          className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${getButtonColor()} text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting && (
            <Loader2 size={18} className='animate-spin' aria-hidden />
          )}
          {getConfirmButtonLabel()}
        </button>
      </div>
    </div>
  )
}
