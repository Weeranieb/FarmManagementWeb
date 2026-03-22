import type { PondMovePreviewResponse } from '../../../../api/pond'
import { th } from '../../../../locales/th'
import { fmtCurrency } from '../../utils'

export function TransferPreviewDetails({
  preview,
  accent,
}: {
  preview: PondMovePreviewResponse
  accent: { bg: string; border: string; text: string }
}) {
  const L = th.stockActionModal
  const fishTypeLabels = th.fishType
  return (
    <div
      className={`rounded-lg p-4 ${accent.bg} border ${accent.border} space-y-2 text-sm`}
    >
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.species}</span>
        <span className='font-medium text-gray-900'>
          {fishTypeLabels[preview.species as keyof typeof fishTypeLabels] ??
            preview.species}
        </span>
      </div>
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.quantity}</span>
        <span className='font-medium text-gray-900'>
          {preview.quantity.toLocaleString()}
        </span>
      </div>
      {preview.avgWeightKg > 0 && (
        <>
          <div className='flex justify-between'>
            <span className='text-gray-600'>{L.avgWeightKg}</span>
            <span className='font-medium text-gray-900'>
              {preview.avgWeightKg.toFixed(2)} {L.unitKg}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-600'>{L.totalWeight}</span>
            <span className='font-medium text-gray-900'>
              {preview.totalWeight.toFixed(2)} {L.unitKg}
            </span>
          </div>
        </>
      )}
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.costPerUnitThb}</span>
        <span className='font-medium text-gray-900'>
          {fmtCurrency(preview.costPerUnit)}
        </span>
      </div>
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.baseTransferCost}</span>
        <span className='font-medium text-gray-900'>
          {fmtCurrency(preview.baseTransferCost)}
        </span>
      </div>
      {preview.additionalCosts?.length > 0 && (
        <>
          <div className='border-t border-gray-200 pt-2 mt-2'>
            <p className='text-xs text-gray-500 mb-1'>{L.additionalCosts}</p>
          </div>
          {preview.additionalCosts.map((c, i) => (
            <div key={i} className='flex justify-between pl-3'>
              <span className='text-gray-600'>{c.title}</span>
              <span className='font-medium text-gray-900'>
                {fmtCurrency(c.cost)}
              </span>
            </div>
          ))}
        </>
      )}
      <div className='border-t border-gray-300 pt-2 mt-2 flex justify-between font-semibold'>
        <span className={accent.text}>{L.grandTotal}</span>
        <span className={accent.text}>{fmtCurrency(preview.totalCost)}</span>
      </div>
    </div>
  )
}
