import type { PondSellPreviewResponse } from '../../../../api/pond'
import { th } from '../../../../locales/th'
import { fmtCurrency } from '../../utils'

export function SellPreviewDetails({
  preview,
  accent,
}: {
  preview: PondSellPreviewResponse
  accent: { bg: string; border: string; text: string }
}) {
  const L = th.stockActionModal
  return (
    <div
      className={`rounded-lg p-4 ${accent.bg} border ${accent.border} space-y-3 text-sm`}
    >
      <p className={`text-sm font-semibold ${accent.text}`}>{L.saleDetails}</p>
      <div className='rounded-md overflow-hidden border border-gray-200 bg-white/50'>
        <div className='grid grid-cols-[1.2fr_1fr_1fr_1.1fr] gap-2 px-3 py-2 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>
          <div className='pl-1'>ไซส์</div>
          <div className='text-right pr-1'>{L.totalWeightLabel}</div>
          <div className='text-right pr-1'>{L.pricePerKgThb}</div>
          <div className='text-right pr-1'>{L.totalRevenueLabel}</div>
        </div>
        <div className='divide-y divide-gray-100'>
          {preview.items.map((item, i) => (
            <div
              key={i}
              className='grid grid-cols-[1.2fr_1fr_1fr_1.1fr] gap-2 px-3 py-2 items-center'
            >
              <div className='font-medium text-gray-900'>
                {item.fishSizeGradeName}
              </div>
              <div className='text-right tabular-nums font-semibold text-gray-900'>
                {item.weight.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                })}{' '}
                {L.unitKg}
              </div>
              <div className='text-right tabular-nums font-semibold text-gray-900'>
                {fmtCurrency(item.pricePerKg)}
              </div>
              <div className='text-right tabular-nums font-semibold text-gray-900'>
                {fmtCurrency(item.subtotal)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='mt-3 rounded-lg border border-gray-200/90 bg-white/80 px-3 py-2.5 shadow-sm'>
        <div className='grid grid-cols-[1.2fr_1fr_1fr_1.1fr] gap-2 items-center'>
          <div className='pl-1 text-sm font-semibold text-gray-700'>สรุป</div>
          <div className='text-right text-sm font-bold tabular-nums text-gray-900'>
            {preview.totalWeight.toLocaleString(undefined, {
              minimumFractionDigits: 1,
            })}{' '}
            {L.unitKg}
          </div>
          <div className='min-w-0' aria-hidden />
          <div
            className={`text-right text-sm font-bold tabular-nums ${accent.text}`}
          >
            {fmtCurrency(preview.totalRevenue)}
          </div>
        </div>
      </div>
    </div>
  )
}
