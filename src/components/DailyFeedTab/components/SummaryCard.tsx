import type { ReactNode } from 'react'

export interface SummaryCardProps {
  label: string
  value: string
  sub?: string
  color: string
  icon: ReactNode
}

export function SummaryCard({
  label,
  value,
  sub,
  color,
  icon,
}: SummaryCardProps) {
  return (
    <div
      className={`rounded-lg border px-2 pt-2 pb-1.5 flex flex-col items-center w-full h-full min-h-0 ${color}`}
    >
      <p className='text-[11px] text-gray-500 text-center leading-tight shrink-0'>
        {label}
      </p>
      <div className='flex-1 flex flex-col items-center justify-center gap-0.5 py-1 min-h-0 w-full'>
        <div className='flex justify-center opacity-90 [&_svg]:block [&_svg]:shrink-0'>
          {icon}
        </div>
        <p className='font-bold text-gray-800 text-sm sm:text-base leading-tight text-center'>
          {value}
        </p>
      </div>
      <div className='shrink-0 w-full flex justify-center px-0.5'>
        {sub ? (
          <p className='text-[11px] text-gray-500 text-center leading-tight'>
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  )
}
