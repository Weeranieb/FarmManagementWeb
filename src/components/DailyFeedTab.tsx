import { UtensilsCrossed } from 'lucide-react'
import { th } from '../locales/th'

const L = th.pondDetail

interface DailyFeedTabProps {
  pondId: string
}

export function DailyFeedTab({ pondId }: DailyFeedTabProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50/50 p-8 text-center'>
      <UtensilsCrossed
        size={48}
        className='mx-auto text-gray-400 mb-3'
        aria-hidden
      />
      <p className='text-gray-600 font-medium mb-1'>{L.dailyFeedEmpty}</p>
      <p className='text-sm text-gray-500'>{L.dailyFeedDescription}</p>
      <p className='text-xs text-gray-400 mt-2'>
        {L.pondIdLabel}: {pondId}
      </p>
    </div>
  )
}
