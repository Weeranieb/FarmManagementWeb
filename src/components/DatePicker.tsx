import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]

const YEAR_RANGE = 20 // years before/after for dropdown

function formatDisplayDate(ymd: string): string {
  if (!ymd) return '—'
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return ymd
  return `${d} ${THAI_MONTHS[m - 1]} ${y + 543}`
}

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  max?: string
  min?: string
  className?: string
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

export function DatePicker({
  value,
  onChange,
  max,
  min,
  className = '',
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: DatePickerProps) {
  const initial = value || new Date().toISOString().split('T')[0]
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = initial.split('-').map(Number)
    return { year: y, month: m - 1 }
  })
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const handleOpenToggle = () => {
    if (!open && value) {
      const [y, m] = value.split('-').map(Number)
      if (y && m) setViewDate({ year: y, month: m - 1 })
    }
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      const tr = triggerRef.current
      const pop = popoverRef.current
      const target = e.target as Node
      if (tr?.contains(target) || pop?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const maxDate = useMemo(() => (max ? new Date(max) : null), [max])
  const minDate = useMemo(() => (min ? new Date(min) : null), [min])

  const { days } = useMemo(() => {
    const y = viewDate.year
    const m = viewDate.month
    const first = new Date(y, m, 1)
    const last = new Date(y, m + 1, 0)
    const firstDayOfWeek = first.getDay()
    const daysInMonth = last.getDate()
    const days: (null | { day: number; date: Date; disabled: boolean })[] = []

    for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d)
      let disabled = false
      if (maxDate && date > maxDate) disabled = true
      if (minDate && date < minDate) disabled = true
      days.push({ day: d, date, disabled })
    }
    return { days }
  }, [viewDate.year, viewDate.month, maxDate, minDate])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const toYMD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const selectDay = (cell: { day: number; date: Date; disabled: boolean }) => {
    if (cell.disabled) return
    onChange(toYMD(cell.date))
    setOpen(false)
  }

  const isToday = (d: Date) => toYMD(d) === toYMD(today)

  const prevMonth = () => {
    setViewDate((v) =>
      v.month === 0
        ? { year: v.year - 1, month: 11 }
        : { year: v.year, month: v.month - 1 },
    )
  }

  const nextMonth = () => {
    setViewDate((v) =>
      v.month === 11
        ? { year: v.year + 1, month: 0 }
        : { year: v.year, month: v.month + 1 },
    )
  }

  const canGoNext =
    !maxDate || new Date(viewDate.year, viewDate.month + 1, 0) <= maxDate
  const canGoPrev =
    !minDate || new Date(viewDate.year, viewDate.month, 1) >= minDate

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear()
    const minY = minDate ? minDate.getFullYear() : now - YEAR_RANGE
    const maxY = maxDate ? maxDate.getFullYear() : now + 2
    const list: number[] = []
    for (let y = minY; y <= maxY; y++) list.push(y)
    return list.reverse()
  }, [minDate, maxDate])

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = Number(e.target.value)
    if (!Number.isNaN(m)) setViewDate((v) => ({ ...v, month: m }))
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const y = Number(e.target.value)
    if (!Number.isNaN(y)) setViewDate((v) => ({ ...v, year: y }))
  }

  return (
    <div className='relative'>
      <div
        ref={triggerRef}
        role='button'
        tabIndex={0}
        onClick={handleOpenToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleOpenToggle()
          }
        }}
        className={`
          w-full flex items-center justify-between gap-2
          px-4 py-2.5 rounded-lg border bg-white
          cursor-pointer text-left text-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${ariaInvalid ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}
          ${className}
        `}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        aria-label='เลือกวันที่'
      >
        <span className='tabular-nums'>
          {formatDisplayDate(value || initial)}
        </span>
        <Calendar size={18} className='text-gray-400 shrink-0' />
      </div>

      <input type='hidden' value={value} readOnly id={id} required />

      {open && (
        <div
          ref={popoverRef}
          className='absolute left-0 top-full mt-1 z-50 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden min-w-[320px]'
          role='dialog'
          aria-modal='true'
          aria-label='ปฏิทินเลือกวันที่'
        >
          <div className='flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3'>
            <button
              type='button'
              onClick={prevMonth}
              disabled={!canGoPrev}
              className='p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:pointer-events-none text-gray-600'
              aria-label='เดือนก่อน'
            >
              <ChevronLeft size={22} />
            </button>
            <div className='flex-1 flex items-center gap-2'>
              <select
                value={viewDate.month}
                onChange={handleMonthChange}
                className='flex-1 min-w-0 px-3 py-2 text-base font-medium text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer'
                aria-label='เลือกเดือน'
              >
                {THAI_MONTHS.map((label, idx) => (
                  <option key={label} value={idx}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={viewDate.year}
                onChange={handleYearChange}
                className='flex-1 min-w-0 px-3 py-2 text-base font-medium text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer tabular-nums'
                aria-label='เลือกปี'
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y + 543}
                  </option>
                ))}
              </select>
            </div>
            <button
              type='button'
              onClick={nextMonth}
              disabled={!canGoNext}
              className='p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:pointer-events-none text-gray-600'
              aria-label='เดือนถัดไป'
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-7 gap-1 text-center text-sm text-gray-500 font-medium mb-2'>
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((w) => (
                <div key={w} className='py-1.5'>
                  {w}
                </div>
              ))}
            </div>
            <div className='grid grid-cols-7 gap-1.5'>
              {days.map((cell, i) => {
                if (!cell) return <div key={i} />
                const { day, date, disabled } = cell
                const todayCell = isToday(date)
                return (
                  <button
                    key={i}
                    type='button'
                    disabled={disabled}
                    onClick={() => selectDay(cell)}
                    className={`
                      w-11 h-11 rounded-lg text-base font-medium
                      disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
                      ${!disabled ? 'hover:bg-blue-100 text-gray-800' : ''}
                      ${todayCell && !disabled ? 'ring-2 ring-blue-500 ring-inset bg-blue-50' : ''}
                      ${value === toYMD(date) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    `}
                    aria-label={`${day} ${THAI_MONTHS[viewDate.month]} ${viewDate.year + 543}`}
                    aria-pressed={value === toYMD(date)}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
