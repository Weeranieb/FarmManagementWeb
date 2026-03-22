import { ArrowRight, Fish } from 'lucide-react'
import { th } from '../../../locales/th'
import type { NormalizedPond, StockActionModalPond } from '../types'

export function TransferPondCards({
  pond,
  quantity,
  remainingStock,
  destinationPond,
  destinationCurrentStock,
}: {
  pond: NormalizedPond
  quantity: number
  remainingStock: number
  destinationPond: StockActionModalPond | null
  destinationCurrentStock: number
}) {
  const L = th.stockActionModal

  return (
    <div className='grid grid-cols-2 gap-4'>
      <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='p-2 bg-blue-600 rounded-lg'>
            <Fish size={20} className='text-white' />
          </div>
          <div>
            <p className='text-xs text-blue-700 font-medium'>Source Pond</p>
            <p className='text-sm font-semibold text-blue-900'>{pond.name}</p>
          </div>
        </div>
        <div>
          <p className='text-xs text-blue-700 font-medium mb-2'>
            {L.currentStock}
          </p>
          {quantity > 0 ? (
            <div className='flex items-center gap-2'>
              <p className='text-2xl font-bold text-blue-900'>
                {pond.currentStock.toLocaleString()}
              </p>
              <ArrowRight size={20} className='text-blue-600 flex-shrink-0' />
              <p className='text-2xl font-bold text-blue-600'>
                {remainingStock.toLocaleString()}
              </p>
            </div>
          ) : (
            <p className='text-2xl font-bold text-blue-900'>
              {pond.currentStock.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <div
        className={`rounded-lg p-4 border ${
          destinationPond
            ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200'
            : 'bg-gray-50 border-gray-200 border-dashed'
        }`}
      >
        {destinationPond ? (
          <>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 bg-green-600 rounded-lg'>
                <Fish size={20} className='text-white' />
              </div>
              <div>
                <p className='text-xs text-green-700 font-medium'>
                  {L.destinationPond}
                </p>
                <p className='text-sm font-semibold text-green-900'>
                  {destinationPond.name}
                </p>
              </div>
            </div>
            <div>
              <p className='text-xs text-green-700 font-medium mb-2'>
                {L.currentStock}
              </p>
              {quantity > 0 ? (
                <div className='flex items-center gap-2'>
                  <p className='text-2xl font-bold text-green-900'>
                    {destinationCurrentStock.toLocaleString()}
                  </p>
                  <ArrowRight
                    size={20}
                    className='text-green-600 flex-shrink-0'
                  />
                  <p className='text-2xl font-bold text-green-600'>
                    {(destinationCurrentStock + quantity).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className='text-2xl font-bold text-green-900'>
                  {destinationCurrentStock.toLocaleString()}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <p className='text-sm text-gray-500'>{L.selectDestinationPond}</p>
          </div>
        )}
      </div>
    </div>
  )
}
