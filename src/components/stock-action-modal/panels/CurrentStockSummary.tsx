import { Fish } from 'lucide-react'
import { th } from '../../../locales/th'
import type { NormalizedPond } from '../types'

const fishTypeLabels = th.fishType

export function CurrentStockSummary({ pond }: { pond: NormalizedPond }) {
  const L = th.stockActionModal

  return (
    <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-600 rounded-lg'>
            <Fish size={20} className='text-white' />
          </div>
          <div>
            <p className='text-xs text-blue-700 font-medium'>
              {L.currentStock}
            </p>
            <p className='text-xl font-bold text-blue-900'>
              {pond.currentStock.toLocaleString()}
            </p>
          </div>
        </div>
        <div className='text-right'>
          <p className='text-xs text-blue-700 font-medium'>
            {L.speciesAvailable}
          </p>
          <div className='flex gap-1 mt-1 justify-end'>
            {pond.species.length > 0 ? (
              pond.species.map((species, index) => (
                <span
                  key={index}
                  className='text-xs px-2 py-1 bg-white text-blue-700 rounded border border-blue-200 font-medium'
                >
                  {fishTypeLabels[species as keyof typeof fishTypeLabels] ??
                    species}
                </span>
              ))
            ) : (
              <span className='text-xs text-gray-500'>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
