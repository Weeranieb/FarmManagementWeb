import type { ElementType, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

export interface ListRowProps {
  icon: ElementType<{ size?: number; className?: string }>
  label: string
  sub?: string
  trailing?: ReactNode
  onClick?: () => void
  danger?: boolean
  disabled?: boolean
  isLast?: boolean
}

export function ListRow({
  icon: Icon,
  label,
  sub,
  trailing,
  onClick,
  danger,
  disabled,
  isLast,
}: ListRowProps) {
  const interactive = Boolean(onClick) && !disabled

  const iconBg = disabled
    ? 'bg-slate-100 text-slate-400'
    : danger
      ? 'bg-red-50 text-red-600'
      : 'bg-blue-50 text-blue-600'

  const labelClass = danger
    ? 'text-red-600 font-medium'
    : disabled
      ? 'text-slate-400 font-medium'
      : 'text-slate-900 font-medium'

  return (
    <button
      type='button'
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      className={[
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
        isLast ? '' : 'border-b border-slate-100',
        interactive
          ? 'cursor-pointer hover:bg-slate-50'
          : 'cursor-default',
      ].join(' ')}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        <Icon size={18} />
      </span>
      <span className='min-w-0 flex-1'>
        <span className={`block truncate text-sm ${labelClass}`}>{label}</span>
        {sub ? (
          <span className='mt-0.5 block truncate text-xs text-slate-500'>
            {sub}
          </span>
        ) : null}
      </span>
      {trailing ? (
        <span className='shrink-0 text-xs text-slate-500'>{trailing}</span>
      ) : null}
      {interactive && !danger ? (
        <ChevronRight size={16} className='shrink-0 text-slate-400' />
      ) : null}
    </button>
  )
}
