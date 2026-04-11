import { useState, useMemo, useRef } from 'react'
import {
  Calendar,
  Save,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
  Edit2,
  Droplets,
  Fish,
  TrendingDown,
} from 'lucide-react'
import { th } from '../locales/th'
import {
  useDailyLogQuery,
  useDailyLogBulkMutation,
  useDailyLogTemplateImportMutation,
} from '../hooks/useDailyLog'
import { useFeedCollectionListQuery } from '../hooks/useFeedCollection'
import type { DailyLogMonth } from '../api/dailyLog'
import { TemplateImportModal, type FarmPondOption } from './TemplateImportModal'
import { FEED_TYPE_FRESH, FEED_TYPE_PELLET } from '../constants/feedType'
import { useAppToast } from '../contexts/AppToastContext'

const L = th.dailyFeed

/** Fixed width for sticky date column (thead/tbody/tfoot) to avoid covering fresh-morning under border-collapse + sticky. */
const DATE_COL_DIM = 'w-16 min-w-16 max-w-16'

/** Body row height + type; compact so a full month scrolls less. */
const DAY_BODY_ROW = 'h-7 min-h-7'
const DAY_BODY_TEXT = 'text-xs leading-tight'

interface DailyFeedTabProps {
  pondId: number
  farmId: number
  farmPonds: FarmPondOption[]
  showTouristCatch: boolean
}

function formatMonth(month: string) {
  const date = new Date(month + '-01')
  return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
}

function getDaysInMonth(month: string) {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m, 0).getDate()
}

function getDayOfWeek(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay()
}

/** True if this calendar day (local) is strictly after today (local). */
function isFutureDay(year: number, month: number, day: number): boolean {
  const rowDate = new Date(year, month - 1, day)
  const t = new Date()
  const todayStart = new Date(t.getFullYear(), t.getMonth(), t.getDate())
  return rowDate.getTime() > todayStart.getTime()
}

type DayRow = {
  freshMorning: number
  freshEvening: number
  pelletMorning: number
  pelletEvening: number
  deathFishCount: number
  touristCatchCount: number
}

function emptyRow(): DayRow {
  return {
    freshMorning: 0,
    freshEvening: 0,
    pelletMorning: 0,
    pelletEvening: 0,
    deathFishCount: 0,
    touristCatchCount: 0,
  }
}

function numField(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function buildRowsFromMonth(
  data: DailyLogMonth | undefined,
): Record<number, DayRow> {
  const rows: Record<number, DayRow> = {}
  if (!data?.entries) return rows
  for (const e of data.entries) {
    rows[e.day] = {
      freshMorning: numField(e.freshMorning),
      freshEvening: numField(e.freshEvening),
      pelletMorning: numField(e.pelletMorning),
      pelletEvening: numField(e.pelletEvening),
      deathFishCount: numField(e.deathFishCount),
      touristCatchCount: numField(e.touristCatchCount),
    }
  }
  return rows
}

function isRowNonEmpty(r: DayRow): boolean {
  return (
    r.freshMorning > 0 ||
    r.freshEvening > 0 ||
    r.pelletMorning > 0 ||
    r.pelletEvening > 0 ||
    r.deathFishCount > 0 ||
    r.touristCatchCount > 0
  )
}

function isRowEqual(a: DayRow, b: DayRow): boolean {
  return (
    a.freshMorning === b.freshMorning &&
    a.freshEvening === b.freshEvening &&
    a.pelletMorning === b.pelletMorning &&
    a.pelletEvening === b.pelletEvening &&
    a.deathFishCount === b.deathFishCount &&
    a.touristCatchCount === b.touristCatchCount
  )
}

type DirtyMonthState = {
  rows: Record<number, DayRow>
  freshFcId: number | null
  pelletFcId: number | null
  originalRows: Record<number, DayRow>
}

const fmt = (n: number, digits = 1) =>
  n % 1 === 0 ? String(n) : n.toFixed(digits)

const fmtOrEmpty = (n: number, digits = 1) =>
  Number.isFinite(n) && n > 0 ? fmt(n, digits) : ''

/** กิโลกรัม → กิโล in headers / totals (API often returns full word). */
function abbrevThaiKgUnit(unit: string): string {
  return unit.replace(/กิโลกรัม/g, 'กิโล')
}

function viewCellDisplay(val: number): string | number {
  if (!Number.isFinite(val) || val <= 0) return ''
  return val
}

const TOAST_ERR_MAX = 280
function errorMessageForToast(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  if (raw.length <= TOAST_ERR_MAX) return raw
  return `${raw.slice(0, TOAST_ERR_MAX - 1)}…`
}

interface SummaryCardProps {
  label: string
  value: string
  sub?: string
  color: string
  icon: React.ReactNode
}

function SummaryCard({ label, value, sub, color, icon }: SummaryCardProps) {
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

export function DailyFeedTab({
  pondId,
  farmId,
  farmPonds,
  showTouristCatch,
}: DailyFeedTabProps) {
  const { showToast } = useAppToast()
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  )
  const [isEditing, setIsEditing] = useState(false)

  const { data, isLoading } = useDailyLogQuery(pondId, currentMonth)
  const { data: feedCollections } = useFeedCollectionListQuery()
  const feedList = useMemo(
    () => feedCollections?.items ?? [],
    [feedCollections],
  )
  const freshFeeds = useMemo(
    () => feedList.filter((f) => f.feedType === FEED_TYPE_FRESH),
    [feedList],
  )
  const pelletFeeds = useMemo(
    () => feedList.filter((f) => f.feedType === FEED_TYPE_PELLET),
    [feedList],
  )

  const bulkMutation = useDailyLogBulkMutation(pondId)
  const templateImportMutation = useDailyLogTemplateImportMutation(farmId)

  const [freshFcId, setFreshFcId] = useState<number | null>(null)
  const [pelletFcId, setPelletFcId] = useState<number | null>(null)
  const [localRows, setLocalRows] = useState<Record<number, DayRow>>({})
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [pendingMonth, setPendingMonth] = useState<string | null>(null)
  /** Snapshot for save diff + must mirror originalRowsRef (refs cannot be read during render). */
  const [editBaselineRows, setEditBaselineRows] = useState<
    Record<number, DayRow>
  >({})
  const originalRowsRef = useRef<Record<number, DayRow>>({})
  const dirtyMonthsRef = useRef<Map<string, DirtyMonthState>>(new Map())

  const serverBuiltRows = useMemo(() => buildRowsFromMonth(data), [data])

  function switchMonth(target: string) {
    if (isEditing) {
      dirtyMonthsRef.current.set(currentMonth, {
        rows: JSON.parse(JSON.stringify(localRows)),
        freshFcId,
        pelletFcId,
        originalRows: JSON.parse(JSON.stringify(originalRowsRef.current)),
      })
    }
    const dirty = dirtyMonthsRef.current.get(target)
    if (dirty) {
      setLocalRows(dirty.rows)
      setFreshFcId(dirty.freshFcId)
      setPelletFcId(dirty.pelletFcId)
      originalRowsRef.current = dirty.originalRows
      setEditBaselineRows(JSON.parse(JSON.stringify(dirty.originalRows)))
      setIsEditing(true)
    } else {
      setIsEditing(false)
      setEditBaselineRows({})
    }
    setCurrentMonth(target)
  }

  function hasUnsavedChanges(): boolean {
    const orig = originalRowsRef.current
    const numDays = getDaysInMonth(currentMonth)
    for (let d = 1; d <= numDays; d++) {
      const cur = localRows[d] ?? emptyRow()
      const prev = orig[d] ?? emptyRow()
      if (!isRowEqual(cur, prev)) return true
    }
    const origFresh = data?.freshFeedCollectionId ?? null
    const origPellet = data?.pelletFeedCollectionId ?? null
    if (freshFcId !== origFresh || pelletFcId !== origPellet) return true
    return false
  }

  function goToMonth(target: string) {
    if (!isEditing) {
      switchMonth(target)
      return
    }
    if (!hasUnsavedChanges()) {
      switchMonth(target)
      return
    }
    setPendingMonth(target)
  }

  function confirmPendingMonth() {
    if (pendingMonth == null) return
    switchMonth(pendingMonth)
    setPendingMonth(null)
  }

  function dismissPendingMonth() {
    setPendingMonth(null)
  }

  function prevMonth() {
    const [y, m] = currentMonth.split('-').map(Number)
    const pm = m === 1 ? 12 : m - 1
    const py = m === 1 ? y - 1 : y
    goToMonth(`${py}-${String(pm).padStart(2, '0')}`)
  }

  function nextMonth() {
    const [y, m] = currentMonth.split('-').map(Number)
    const nm = m === 12 ? 1 : m + 1
    const ny = m === 12 ? y + 1 : y
    goToMonth(`${ny}-${String(nm).padStart(2, '0')}`)
  }

  function handleEdit() {
    const rows = buildRowsFromMonth(data)
    const baseline = JSON.parse(JSON.stringify(rows)) as Record<number, DayRow>
    originalRowsRef.current = baseline
    setEditBaselineRows(baseline)
    setLocalRows(JSON.parse(JSON.stringify(rows)))
    setFreshFcId(data?.freshFeedCollectionId ?? null)
    setPelletFcId(data?.pelletFeedCollectionId ?? null)
    setIsEditing(true)
  }

  function handleCancel() {
    setPendingMonth(null)
    dirtyMonthsRef.current.delete(currentMonth)
    originalRowsRef.current = {}
    setEditBaselineRows({})
    setIsEditing(false)
  }

  const handleNum = (day: number, field: keyof DayRow, raw: string) => {
    const [y, m] = currentMonth.split('-').map(Number)
    if (isFutureDay(y, m, day)) return
    const num = raw === '' ? 0 : parseFloat(raw)
    if (Number.isNaN(num) || num < 0) return
    const intFields: (keyof DayRow)[] = ['deathFishCount', 'touristCatchCount']
    const v = intFields.includes(field) ? Math.floor(num) : num
    setLocalRows((prev) => ({
      ...prev,
      [day]: { ...(prev[day] ?? emptyRow()), [field]: v },
    }))
  }

  function handleSave() {
    const numDays = getDaysInMonth(currentMonth)
    const [saveY, saveM] = currentMonth.split('-').map(Number)
    const entries: ({ day: number } & DayRow)[] = []
    const deleteDays: number[] = []
    const orig = originalRowsRef.current

    for (let d = 1; d <= numDays; d++) {
      if (isFutureDay(saveY, saveM, d)) continue
      const cur = localRows[d] ?? emptyRow()
      const prev = orig[d] ?? emptyRow()
      const curEmpty = !isRowNonEmpty(cur)
      const prevHadData = isRowNonEmpty(prev)

      if (prevHadData && curEmpty) {
        deleteDays.push(d)
      } else if (!isRowEqual(cur, prev)) {
        entries.push({ day: d, ...cur })
      }
    }

    if (entries.length === 0 && deleteDays.length === 0) {
      setIsEditing(false)
      dirtyMonthsRef.current.delete(currentMonth)
      originalRowsRef.current = {}
      setEditBaselineRows({})
      return
    }

    const hasFresh = entries.some(
      (e) => e.freshMorning > 0 || e.freshEvening > 0,
    )
    const hasPellet = entries.some(
      (e) => e.pelletMorning > 0 || e.pelletEvening > 0,
    )
    if (hasFresh && freshFcId == null) {
      showToast('error', L.selectFresh)
      return
    }
    if (hasPellet && pelletFcId == null) {
      showToast('error', L.selectPellet)
      return
    }
    bulkMutation.mutate(
      {
        month: currentMonth,
        freshFeedCollectionId: freshFcId ?? undefined,
        pelletFeedCollectionId: pelletFcId ?? undefined,
        entries,
        deleteDays: deleteDays.length > 0 ? deleteDays : undefined,
      },
      {
        onSuccess: () => {
          dirtyMonthsRef.current.delete(currentMonth)
          originalRowsRef.current = {}
          setEditBaselineRows({})
          setIsEditing(false)
        },
        onError: (err) => {
          showToast('error', errorMessageForToast(err))
        },
      },
    )
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  )
  const [yearNum, monthNum] = currentMonth.split('-').map(Number)

  const rowsForView = isEditing ? localRows : serverBuiltRows
  const freshFcForView = isEditing
    ? freshFcId
    : (data?.freshFeedCollectionId ?? null)
  const pelletFcForView = isEditing
    ? pelletFcId
    : (data?.pelletFeedCollectionId ?? null)

  const selectedFreshName = freshFeeds.find(
    (f) => f.id === freshFcForView,
  )?.name
  const selectedPelletName = pelletFeeds.find(
    (f) => f.id === pelletFcForView,
  )?.name

  const freshUnitLabel = abbrevThaiKgUnit(
    (data?.freshUnit && data.freshUnit.trim() !== '' ? data.freshUnit : null) ??
      L.unitFreshDefault,
  )
  const pelletUnitLabel = abbrevThaiKgUnit(
    (data?.pelletUnit && data.pelletUnit.trim() !== ''
      ? data.pelletUnit
      : null) ?? L.unitKg,
  )

  const totals = useMemo(() => {
    let freshMorning = 0
    let freshEvening = 0
    let pelletMorning = 0
    let pelletEvening = 0
    let deaths = 0
    let tourist = 0
    for (const d of days) {
      const r = rowsForView[d] ?? emptyRow()
      freshMorning += r.freshMorning
      freshEvening += r.freshEvening
      pelletMorning += r.pelletMorning
      pelletEvening += r.pelletEvening
      deaths += r.deathFishCount
      tourist += r.touristCatchCount
    }
    return {
      freshMorning,
      freshEvening,
      pelletMorning,
      pelletEvening,
      deaths,
      tourist,
      totalFresh: freshMorning + freshEvening,
      totalPellet: pelletMorning + pelletEvening,
    }
  }, [days, rowsForView])

  const getVal = (day: number, field: keyof DayRow): number =>
    rowsForView[day]?.[field] ?? 0

  function renderCell(
    day: number,
    field: keyof DayRow,
    bgClass: string,
    step = 'any',
    isLast = false,
    inputDisabled = false,
  ) {
    const val = getVal(day, field)
    const borderR = isLast ? '' : 'border-r border-gray-400'

    let diffBgTd = ''
    let inputDiffClass = ''
    if (isEditing && !inputDisabled) {
      const orig = editBaselineRows[day]
      const origVal = orig?.[field] ?? 0
      if (origVal !== val) {
        const origRowNonEmpty = orig ? isRowNonEmpty(orig) : false
        const curRow = localRows[day] ?? emptyRow()
        const rowFullyCleared = origRowNonEmpty && !isRowNonEmpty(curRow)
        const cellCleared = origVal !== 0 && val === 0
        if (rowFullyCleared || cellCleared) {
          diffBgTd = 'bg-red-50'
          inputDiffClass =
            'bg-red-50/90 text-red-900 focus:bg-red-50 focus:ring-2 focus:ring-red-300 focus:ring-inset'
        } else {
          diffBgTd = 'bg-blue-50'
          inputDiffClass =
            'bg-blue-50/90 text-blue-900 focus:bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:ring-inset'
        }
      }
    }
    const cellBgEdit = diffBgTd || bgClass

    if (!isEditing) {
      return (
        <td
          className={`${borderR} box-border ${DAY_BODY_ROW} align-middle px-1.5 text-center ${DAY_BODY_TEXT} text-gray-700 ${bgClass}`}
        >
          {viewCellDisplay(val)}
        </td>
      )
    }

    const locked = inputDisabled
    return (
      <td
        className={`${borderR} box-border ${DAY_BODY_ROW} align-middle border-b border-gray-300 p-0 ${cellBgEdit}`}
      >
        <input
          type='number'
          min={0}
          step={step}
          value={val === 0 ? '' : val}
          onChange={(e) => handleNum(day, field, e.target.value)}
          placeholder=''
          disabled={locked}
          className={`w-full h-7 min-h-7 px-0.5 text-center ${DAY_BODY_TEXT} border-0 outline-none rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            locked
              ? 'cursor-not-allowed bg-gray-100/80 text-gray-500 opacity-70'
              : inputDiffClass ||
                'bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:ring-inset'
          }`}
        />
      </td>
    )
  }

  if (isLoading) {
    return (
      <div className='text-center py-12 text-gray-500'>{th.common.loading}</div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Top Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={prevMonth}
            disabled={bulkMutation.isPending}
            aria-label={L.prevMonthAria}
            title={L.prevMonthAria}
            className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50'
          >
            <ChevronLeft size={18} className='text-gray-600' aria-hidden />
          </button>
          <div className='flex items-center gap-2 px-2 min-w-[170px] justify-center'>
            <Calendar size={17} className='text-blue-600 flex-shrink-0' />
            <span className='font-semibold text-gray-800 whitespace-nowrap'>
              {formatMonth(currentMonth)}
            </span>
          </div>
          <button
            type='button'
            onClick={nextMonth}
            disabled={bulkMutation.isPending}
            aria-label={L.nextMonthAria}
            title={L.nextMonthAria}
            className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50'
          >
            <ChevronRight size={18} className='text-gray-600' aria-hidden />
          </button>
        </div>

        <div className='flex items-center gap-2 flex-wrap'>
          {isEditing ? (
            <>
              <button
                type='button'
                onClick={handleCancel}
                className='flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm'
              >
                <X size={15} />
                {th.masterData.modalCancel}
              </button>
              <button
                type='button'
                onClick={handleSave}
                disabled={bulkMutation.isPending}
                className='flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm disabled:opacity-50'
              >
                <Save size={15} />
                {L.save}
              </button>
            </>
          ) : (
            <>
              <button
                type='button'
                onClick={() => setIsTemplateModalOpen(true)}
                disabled={
                  farmId <= 0 ||
                  farmPonds.length === 0 ||
                  templateImportMutation.isPending
                }
                className='flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Layers size={15} />
                {L.uploadTemplate}
              </button>
              <button
                type='button'
                onClick={handleEdit}
                className='flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm'
              >
                <Edit2 size={15} />
                {L.editData}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Feed Type Selectors */}
      <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              {L.selectFresh}
            </label>
            <select
              value={freshFcForView ?? ''}
              onChange={(e) =>
                setFreshFcId(
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              disabled={!isEditing}
              className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <option value=''></option>
              {freshFeeds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({abbrevThaiKgUnit(f.unit)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              {L.selectPellet}
            </label>
            <select
              value={pelletFcForView ?? ''}
              onChange={(e) =>
                setPelletFcId(
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              disabled={!isEditing}
              className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <option value=''></option>
              {pelletFeeds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({abbrevThaiKgUnit(f.unit)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className='bg-white rounded-xl border border-gray-400 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table
            className='w-full table-fixed text-sm border-collapse'
            style={{ minWidth: showTouristCatch ? 580 : 480 }}
          >
            <colgroup>
              <col className={DATE_COL_DIM} />
              <col className='w-[5.5rem]' />
              <col className='w-[5.5rem]' />
              <col className='w-[5.5rem]' />
              <col className='w-[5.5rem]' />
              <col className='w-24' />
              {showTouristCatch && <col className='w-28' />}
            </colgroup>
            <thead>
              <tr>
                <th
                  rowSpan={2}
                  className={`sticky left-0 z-20 bg-gray-100 border border-gray-400 px-2 py-1.5 text-center text-gray-700 text-xs leading-tight ${DATE_COL_DIM}`}
                >
                  {th.pondDetail.date}
                </th>
                <th
                  colSpan={2}
                  className='bg-green-100 border border-gray-400 px-2 py-1.5 text-center text-green-800 text-xs font-semibold leading-tight'
                >
                  <span className='inline-flex flex-wrap items-baseline justify-center gap-x-1 gap-y-0.5'>
                    <span>{L.freshFeed}</span>
                    {selectedFreshName && (
                      <span className='font-normal whitespace-nowrap'>
                        ({selectedFreshName})
                      </span>
                    )}
                  </span>
                </th>
                <th
                  colSpan={2}
                  className='bg-amber-100 border border-gray-400 px-2 py-1.5 text-center text-amber-800 text-xs font-semibold leading-tight'
                >
                  <span className='inline-flex flex-wrap items-baseline justify-center gap-x-1 gap-y-0.5'>
                    <span>{L.pelletFeed}</span>
                    {selectedPelletName && (
                      <span className='font-normal whitespace-nowrap'>
                        ({selectedPelletName})
                      </span>
                    )}
                  </span>
                </th>
                <th
                  rowSpan={2}
                  className='bg-purple-100 border border-gray-400 px-2 py-1.5 text-center text-purple-800 text-xs font-semibold leading-tight w-20'
                >
                  {L.deathFish}
                  <br />
                  <span className='font-normal'>({L.unitFish})</span>
                </th>
                {showTouristCatch && (
                  <th
                    rowSpan={2}
                    className='bg-fuchsia-100 border border-gray-400 px-2 py-1.5 text-center text-fuchsia-800 text-xs font-semibold leading-tight w-24'
                  >
                    {L.touristCatch}
                    <br />
                    <span className='font-normal'>({L.unitFish})</span>
                  </th>
                )}
              </tr>
              <tr>
                <th className='bg-green-50 border border-gray-400 px-1.5 py-1 text-center text-green-700 text-xs font-medium leading-tight w-20'>
                  {L.morning} ({freshUnitLabel})
                </th>
                <th className='bg-green-50 border border-gray-400 px-1.5 py-1 text-center text-green-700 text-xs font-medium leading-tight w-20'>
                  {L.evening} ({freshUnitLabel})
                </th>
                <th className='bg-amber-50 border border-gray-400 px-1.5 py-1 text-center text-amber-700 text-xs font-medium leading-tight w-20'>
                  {L.morning} ({pelletUnitLabel})
                </th>
                <th className='bg-amber-50 border border-gray-400 px-1.5 py-1 text-center text-amber-700 text-xs font-medium leading-tight w-20'>
                  {L.evening} ({pelletUnitLabel})
                </th>
              </tr>
            </thead>

            <tbody>
              {days.map((day) => {
                const dow = getDayOfWeek(yearNum, monthNum, day)
                const isWeekend = dow === 0 || dow === 6
                const rowIsFuture = isFutureDay(yearNum, monthNum, day)
                const r = rowsForView[day]
                const hasData =
                  r &&
                  (r.freshMorning ||
                    r.freshEvening ||
                    r.pelletMorning ||
                    r.pelletEvening ||
                    r.deathFishCount ||
                    (showTouristCatch && r.touristCatchCount > 0))
                const origRow = editBaselineRows[day]
                const origHadData = origRow ? isRowNonEmpty(origRow) : false
                const curRowForDelete = localRows[day] ?? emptyRow()
                const rowIsDelete =
                  isEditing &&
                  origHadData &&
                  !isRowNonEmpty(curRowForDelete) &&
                  !rowIsFuture

                return (
                  <tr
                    key={day}
                    className={`
                      border-b border-gray-300 transition-colors
                      ${isWeekend ? 'bg-gray-50/70' : 'bg-white'}
                      ${hasData && !isWeekend && !rowIsDelete ? 'bg-blue-50/20' : ''}
                      ${rowIsDelete ? 'bg-red-50/30' : ''}
                      ${!rowIsFuture && !rowIsDelete ? 'hover:bg-yellow-50/40' : ''}
                    `}
                  >
                    <td
                      className={`sticky left-0 z-10 ${DATE_COL_DIM} box-border ${DAY_BODY_ROW} align-middle border-r border-gray-400 px-1.5 text-center ${
                        rowIsDelete
                          ? 'bg-red-100'
                          : isWeekend
                            ? 'bg-gray-100'
                            : 'bg-gray-50'
                      }`}
                    >
                      <span
                        className={`font-bold ${DAY_BODY_TEXT} ${
                          rowIsFuture
                            ? 'text-gray-400'
                            : rowIsDelete
                              ? 'text-red-800 line-through decoration-red-600'
                              : isWeekend
                                ? 'text-gray-500'
                                : 'text-gray-800'
                        }`}
                      >
                        {day}
                      </span>
                    </td>
                    {renderCell(
                      day,
                      'freshMorning',
                      'bg-green-50/40',
                      'any',
                      false,
                      rowIsFuture,
                    )}
                    {renderCell(
                      day,
                      'freshEvening',
                      'bg-green-50/40',
                      'any',
                      false,
                      rowIsFuture,
                    )}
                    {renderCell(
                      day,
                      'pelletMorning',
                      'bg-amber-50/40',
                      'any',
                      false,
                      rowIsFuture,
                    )}
                    {renderCell(
                      day,
                      'pelletEvening',
                      'bg-amber-50/40',
                      'any',
                      false,
                      rowIsFuture,
                    )}
                    {renderCell(
                      day,
                      'deathFishCount',
                      'bg-purple-50/40',
                      '1',
                      false,
                      rowIsFuture,
                    )}
                    {showTouristCatch &&
                      renderCell(
                        day,
                        'touristCatchCount',
                        'bg-fuchsia-50/40',
                        '1',
                        true,
                        rowIsFuture,
                      )}
                  </tr>
                )
              })}
            </tbody>

            <tfoot>
              <tr className='border-t-2 border-gray-500 bg-gray-100'>
                <td
                  className={`sticky left-0 z-10 ${DATE_COL_DIM} box-border bg-gray-200 border-r border-gray-400 px-1.5 py-1.5 text-center font-bold text-gray-700 text-xs leading-tight`}
                >
                  {L.totalLabel}
                </td>
                <td className='border-r border-gray-400 px-1.5 py-1.5 text-center font-bold text-green-700 text-xs leading-tight bg-green-100'>
                  {fmtOrEmpty(totals.freshMorning)}
                </td>
                <td className='border-r border-gray-400 px-1.5 py-1.5 text-center font-bold text-green-700 text-xs leading-tight bg-green-100'>
                  {fmtOrEmpty(totals.freshEvening)}
                </td>
                <td className='border-r border-gray-400 px-1.5 py-1.5 text-center font-bold text-amber-700 text-xs leading-tight bg-amber-100'>
                  {fmtOrEmpty(totals.pelletMorning)}
                </td>
                <td className='border-r border-gray-400 px-1.5 py-1.5 text-center font-bold text-amber-700 text-xs leading-tight bg-amber-100'>
                  {fmtOrEmpty(totals.pelletEvening)}
                </td>
                <td className='border-r border-gray-400 px-1.5 py-1.5 text-center font-bold text-purple-700 text-xs leading-tight bg-purple-100'>
                  {totals.deaths}
                </td>
                {showTouristCatch && (
                  <td className='px-1.5 py-1.5 text-center font-bold text-fuchsia-700 text-xs leading-tight bg-fuchsia-100'>
                    {totals.tourist}
                  </td>
                )}
              </tr>
              <tr className='bg-blue-50'>
                <td
                  className={`sticky left-0 z-10 ${DATE_COL_DIM} box-border bg-blue-100 border-r border-gray-400 px-1.5 py-1.5 text-center font-bold text-blue-800 text-xs leading-tight`}
                >
                  {L.totalAllLabel}
                </td>
                <td
                  colSpan={2}
                  className='border-r border-gray-400 px-1.5 py-1.5 text-center font-semibold text-green-700 text-xs leading-tight bg-green-50'
                >
                  {`${fmt(totals.totalFresh)} ${freshUnitLabel}`}
                </td>
                <td
                  colSpan={2}
                  className='border-r border-gray-400 px-1.5 py-1.5 text-center font-semibold text-amber-700 text-xs leading-tight bg-amber-50'
                >
                  {fmt(totals.totalPellet)} {pelletUnitLabel}
                </td>
                <td className='border-r border-gray-400 px-1.5 py-1.5 text-center font-semibold text-purple-700 text-xs leading-tight bg-purple-50'>
                  {`${totals.deaths} ${L.unitFish}`}
                </td>
                {showTouristCatch && (
                  <td className='px-1.5 py-1.5 text-center font-semibold text-fuchsia-700 text-xs leading-tight bg-fuchsia-50'>
                    {`${totals.tourist} ${L.unitFish}`}
                  </td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        className={`grid grid-cols-2 gap-2 sm:gap-3 items-stretch ${showTouristCatch ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}
      >
        <SummaryCard
          label={L.freshBaitTotal}
          value={`${fmt(totals.totalFresh)} ${freshUnitLabel}`}
          sub={`${L.morning} ${fmt(totals.freshMorning)} / ${L.evening} ${fmt(totals.freshEvening)}`}
          color='border-green-200 bg-green-50'
          icon={<Droplets size={18} className='text-green-600' />}
        />
        <SummaryCard
          label={L.pelletTotal}
          value={`${fmt(totals.totalPellet)} ${pelletUnitLabel}`}
          sub={`${L.morning} ${fmt(totals.pelletMorning)} / ${L.evening} ${fmt(totals.pelletEvening)}`}
          color='border-amber-200 bg-amber-50'
          icon={<Fish size={18} className='text-amber-600' />}
        />
        <SummaryCard
          label={L.deadFishTotal}
          value={`${totals.deaths} ${L.unitFish}`}
          color='border-purple-200 bg-purple-50'
          icon={<TrendingDown size={18} className='text-purple-600' />}
        />
        {showTouristCatch && (
          <SummaryCard
            label={L.fishCaughtTotal}
            value={`${totals.tourist} ${L.unitFish}`}
            color='border-fuchsia-200 bg-fuchsia-50'
            icon={<Fish size={18} className='text-fuchsia-600' />}
          />
        )}
      </div>

      {pendingMonth != null && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
          role='presentation'
          onClick={dismissPendingMonth}
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='daily-feed-change-month-title'
            className='w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3.5 text-white'>
              <Calendar
                size={22}
                className='flex-shrink-0 opacity-95'
                aria-hidden
              />
              <h2
                id='daily-feed-change-month-title'
                className='text-base font-semibold leading-snug'
              >
                {L.changeMonthConfirmTitle}
              </h2>
            </div>
            <div className='px-5 py-4'>
              <p className='text-sm leading-relaxed text-gray-600'>
                {L.changeMonthConfirmBody}
              </p>
            </div>
            <div className='flex justify-end gap-2 border-t border-gray-100 bg-gray-50/80 px-5 py-3'>
              <button
                type='button'
                onClick={dismissPendingMonth}
                className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50'
              >
                {th.masterData.modalCancel}
              </button>
              <button
                type='button'
                onClick={confirmPendingMonth}
                className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700'
              >
                {L.changeMonthConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Import Modal */}
      {isTemplateModalOpen && farmId > 0 && (
        <TemplateImportModal
          key={pondId}
          onClose={() => setIsTemplateModalOpen(false)}
          farmPonds={farmPonds}
          defaultSelectedIds={[pondId]}
          isSubmitting={templateImportMutation.isPending}
          onImport={async (file, selectedPondIds) => {
            const res = await templateImportMutation.mutateAsync({
              file,
              selectedPondIds,
            })
            const totalRows = res.results.reduce(
              (sum, r) => sum + r.rowsImported,
              0,
            )
            let msg = L.templateToastImported
              .replace('{count}', String(res.results.length))
              .replace('{rows}', String(totalRows))
            if (res.skipped.length > 0) {
              msg += ` — ${L.templateToastSkipped.replace('{sheets}', res.skipped.join(', '))}`
            }
            showToast('success', msg)
            return res
          }}
        />
      )}
    </div>
  )
}
