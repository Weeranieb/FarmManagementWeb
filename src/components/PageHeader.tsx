import type { ElementType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { th } from '../locales/th'

const L = th.layout

export interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Renders inline after the title (e.g. status badge). */
  titleAddon?: ReactNode
  actions?: ReactNode
  backTo?: string
  backLabel?: string
  icon?: ElementType<{ size?: number; className?: string }>
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  titleAddon,
  actions,
  backTo,
  backLabel,
  icon: Icon,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-6 ${className}`}>
      <div className='flex min-w-0 items-start gap-3'>
        {backTo && (
          <Link
            to={backTo}
            title={backLabel ?? L.back}
            aria-label={backLabel ?? L.back}
            className='mt-0.5 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700'
          >
            <ArrowLeft size={20} />
          </Link>
        )}
        <div
          className='mt-0.5 h-10 w-1 shrink-0 rounded-full bg-blue-500'
          aria-hidden
        />
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2.5'>
            {Icon && (
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50'>
                <Icon size={17} className='text-blue-600' />
              </div>
            )}
            <h1 className='text-xl font-semibold tracking-tight text-slate-900'>
              {title}
            </h1>
            {titleAddon}
          </div>
          {subtitle ? (
            <p className='mt-0.5 text-sm leading-relaxed text-slate-500'>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className='flex shrink-0 flex-wrap items-center justify-end gap-2 pt-0.5'>
          {actions}
        </div>
      ) : null}
    </div>
  )
}
