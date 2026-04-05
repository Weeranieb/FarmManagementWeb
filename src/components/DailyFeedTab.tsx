import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Calendar,
  Save,
  ChevronLeft,
  ChevronRight,
  Edit,
  Upload,
} from 'lucide-react'
import { th } from '../locales/th'
import {
  useDailyLogQuery,
  useDailyLogBulkMutation,
  useDailyLogUploadMutation,
} from '../hooks/useDailyLog'
import { useFeedCollectionListQuery } from '../hooks/useFeedCollection'
import type { DailyLogMonth } from '../api/dailyLog'
import { ExcelUploadModal } from './ExcelUploadModal'
import { FEED_TYPE_FRESH, FEED_TYPE_PELLET } from '../constants/feedType'
import { useAppToast } from '../contexts/AppToastContext'

const L = th.dailyFeed

interface DailyFeedTabProps {
  pondId: string
}

function formatMonth(month: string) {
  const date = new Date(month + '-01')
  return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
}

function getDaysInMonth(month: string) {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m, 0).getDate()
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

function buildRowsFromMonth(data: DailyLogMonth | undefined): {
  rows: Record<number, DayRow>
  freshPrice: Record<number, number | null>
  pelletPrice: Record<number, number | null>
} {
  const rows: Record<number, DayRow> = {}
  const freshPrice: Record<number, number | null> = {}
  const pelletPrice: Record<number, number | null> = {}
  if (!data?.entries) {
    return { rows, freshPrice, pelletPrice }
  }
  for (const e of data.entries) {
    rows[e.day] = {
      freshMorning: e.freshMorning,
      freshEvening: e.freshEvening,
      pelletMorning: e.pelletMorning,
      pelletEvening: e.pelletEvening,
      deathFishCount: e.deathFishCount,
      touristCatchCount: e.touristCatchCount,
    }
    freshPrice[e.day] = e.freshUnitPrice
    pelletPrice[e.day] = e.pelletUnitPrice
  }
  return { rows, freshPrice, pelletPrice }
}

export function DailyFeedTab({ pondId }: DailyFeedTabProps) {
  const { showToast } = useAppToast()
  const numPondId = Number(pondId)
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  )

  const { data, isLoading } = useDailyLogQuery(numPondId, currentMonth)
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

  const bulkMutation = useDailyLogBulkMutation(numPondId)
  const uploadMutation = useDailyLogUploadMutation(numPondId)

  const [isEditing, setIsEditing] = useState(false)
  const [freshFcId, setFreshFcId] = useState<number | null>(null)
  const [pelletFcId, setPelletFcId] = useState<number | null>(null)
  const [localRows, setLocalRows] = useState<Record<number, DayRow>>({})
  const [priceFreshByDay, setPriceFreshByDay] = useState<
    Record<number, number | null>
  >({})
  const [pricePelletByDay, setPricePelletByDay] = useState<
    Record<number, number | null>
  >({})

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  useEffect(() => {
    if (isEditing) return
    const { rows, freshPrice, pelletPrice } = buildRowsFromMonth(data)
    setLocalRows(rows)
    setPriceFreshByDay(freshPrice)
    setPricePelletByDay(pelletPrice)
    setFreshFcId(data?.freshFeedCollectionId ?? null)
    setPelletFcId(data?.pelletFeedCollectionId ?? null)
  }, [data, isEditing, currentMonth])

  function prevMonth() {
    const [y, m] = currentMonth.split('-').map(Number)
    const pm = m === 1 ? 12 : m - 1
    const py = m === 1 ? y - 1 : y
    setCurrentMonth(`${py}-${String(pm).padStart(2, '0')}`)
    setIsEditing(false)
  }

  function nextMonth() {
    const [y, m] = currentMonth.split('-').map(Number)
    const nm = m === 12 ? 1 : m + 1
    const ny = m === 12 ? y + 1 : y
    setCurrentMonth(`${ny}-${String(nm).padStart(2, '0')}`)
    setIsEditing(false)
  }

  function startEdit() {
    const { rows } = buildRowsFromMonth(data)
    const days = getDaysInMonth(currentMonth)
    const next: Record<number, DayRow> = { ...rows }
    for (let d = 1; d <= days; d++) {
      if (!next[d]) next[d] = emptyRow()
    }
    setLocalRows(next)
    setFreshFcId(data?.freshFeedCollectionId ?? null)
    setPelletFcId(data?.pelletFeedCollectionId ?? null)
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  const handleNum = (day: number, field: keyof DayRow, raw: string) => {
    const num = raw === '' ? 0 : parseFloat(raw)
    if (Number.isNaN(num) || num < 0) return
    const intFields: (keyof DayRow)[] = ['deathFishCount', 'touristCatchCount']
    const v = intFields.includes(field) ? Math.floor(num) : num
    setLocalRows((prev) => ({
      ...prev,
      [day]: { ...(prev[day] ?? emptyRow()), [field]: v },
    }))
  }

  function save() {
    const days = getDaysInMonth(currentMonth)
    const entries = []
    for (let d = 1; d <= days; d++) {
      entries.push({
        day: d,
        ...(localRows[d] ?? emptyRow()),
      })
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
      },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  )

  const totals = useCallback(() => {
    let fq = 0
    let pq = 0
    let cost = 0
    for (const d of days) {
      const r = localRows[d] ?? emptyRow()
      fq += r.freshMorning + r.freshEvening
      pq += r.pelletMorning + r.pelletEvening
      const fp = priceFreshByDay[d]
      const pp = pricePelletByDay[d]
      if (fp != null) {
        cost += (r.freshMorning + r.freshEvening) * fp
      }
      if (pp != null) {
        cost += (r.pelletMorning + r.pelletEvening) * pp
      }
    }
    return {
      fq,
      pq,
      cost,
      deaths: days.reduce((s, d) => s + (localRows[d]?.deathFishCount ?? 0), 0),
      tourist: days.reduce(
        (s, d) => s + (localRows[d]?.touristCatchCount ?? 0),
        0,
      ),
    }
  }, [days, localRows, priceFreshByDay, pricePelletByDay])

  const t = totals()

  if (isLoading) {
    return (
      <div className='text-center py-12 text-gray-500'>{th.common.loading}</div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <button
            type='button'
            onClick={prevMonth}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ChevronLeft size={20} className='text-gray-600' />
          </button>
          <div className='flex items-center gap-2'>
            <Calendar size={20} className='text-blue-600' />
            <h3 className='text-xl font-semibold text-gray-800'>
              {formatMonth(currentMonth)}
            </h3>
          </div>
          <button
            type='button'
            onClick={nextMonth}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ChevronRight size={20} className='text-gray-600' />
          </button>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <button
            type='button'
            onClick={() => setIsUploadModalOpen(true)}
            disabled={
              (freshFeeds.length === 0 && pelletFeeds.length === 0) ||
              bulkMutation.isPending ||
              uploadMutation.isPending
            }
            className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Upload size={18} />
            {L.uploadExcel}
          </button>
          {isEditing ? (
            <>
              <button
                type='button'
                onClick={cancelEdit}
                className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50'
              >
                {th.masterData.modalCancel}
              </button>
              <button
                type='button'
                onClick={save}
                disabled={bulkMutation.isPending}
                className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
              >
                <Save size={18} />
                {L.save}
              </button>
            </>
          ) : (
            <button
              type='button'
              onClick={startEdit}
              className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
            >
              <Edit size={18} />
              {L.edit}
            </button>
          )}
        </div>
      </div>

      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
        <p className='mb-3 text-sm text-gray-600'>{L.pickFeedTypesHint}</p>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='mb-1 block text-xs font-medium text-gray-600'>
              {L.selectFresh}
            </label>
            <select
              value={freshFcId ?? ''}
              onChange={(e) =>
                setFreshFcId(
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              disabled={!isEditing}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50'
            >
              <option value=''>—</option>
              {freshFeeds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='mb-1 block text-xs font-medium text-gray-600'>
              {L.selectPellet}
            </label>
            <select
              value={pelletFcId ?? ''}
              onChange={(e) =>
                setPelletFcId(
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              disabled={!isEditing}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50'
            >
              <option value=''>—</option>
              {pelletFeeds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.unit})
                </option>
              ))}
            </select>
          </div>
        </div>
        {(data?.freshFeedCollectionName || data?.pelletFeedCollectionName) && (
          <p className='mt-2 text-xs text-gray-500'>
            {data.freshFeedCollectionName && (
              <span className='mr-3'>
                {L.freshFeed}: {data.freshFeedCollectionName} ({data.freshUnit})
              </span>
            )}
            {data.pelletFeedCollectionName && (
              <span>
                {L.pelletFeed}: {data.pelletFeedCollectionName} (
                {data.pelletUnit})
              </span>
            )}
          </p>
        )}
      </div>

      <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm'>
        <table className='w-full min-w-[720px] border-collapse text-sm'>
          <thead>
            <tr className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white'>
              <th className='sticky left-0 z-10 bg-blue-600 px-2 py-2 text-left'>
                {th.pondDetail.date}
              </th>
              <th className='px-1 py-2 text-center' colSpan={2}>
                {L.freshFeed}
              </th>
              <th className='px-1 py-2 text-center' colSpan={2}>
                {L.pelletFeed}
              </th>
              <th className='px-1 py-2 text-center'>{L.deathFish}</th>
              <th className='px-1 py-2 text-center'>{L.touristCatch}</th>
            </tr>
            <tr className='bg-blue-700/90 text-xs text-white'>
              <th className='sticky left-0 z-10 bg-blue-700 px-2 py-1' />
              <th className='px-1 py-1'>{L.morning}</th>
              <th className='px-1 py-1'>{L.evening}</th>
              <th className='px-1 py-1'>{L.morning}</th>
              <th className='px-1 py-1'>{L.evening}</th>
              <th className='px-1 py-1'>#</th>
              <th className='px-1 py-1'>#</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => {
              const r = localRows[d] ?? emptyRow()
              return (
                <tr
                  key={d}
                  className='border-b border-gray-100 hover:bg-blue-50/40'
                >
                  <td className='sticky left-0 z-[1] bg-white px-2 py-1 font-medium text-gray-800'>
                    {d}
                  </td>
                  {(
                    [
                      'freshMorning',
                      'freshEvening',
                      'pelletMorning',
                      'pelletEvening',
                    ] as const
                  ).map((field) => (
                    <td key={field} className='px-1 py-0.5'>
                      <input
                        type='number'
                        min={0}
                        step='any'
                        disabled={!isEditing}
                        value={r[field] === 0 ? '' : r[field]}
                        onChange={(e) => handleNum(d, field, e.target.value)}
                        className='w-full min-w-[56px] rounded border border-gray-200 px-1 py-1 text-center text-xs disabled:bg-gray-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                      />
                    </td>
                  ))}
                  {(['deathFishCount', 'touristCatchCount'] as const).map(
                    (field) => (
                      <td key={field} className='px-1 py-0.5'>
                        <input
                          type='number'
                          min={0}
                          step={1}
                          disabled={!isEditing}
                          value={r[field] === 0 ? '' : r[field]}
                          onChange={(e) => handleNum(d, field, e.target.value)}
                          className='w-full min-w-[48px] rounded border border-gray-200 px-1 py-1 text-center text-xs disabled:bg-gray-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                        />
                      </td>
                    ),
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg border border-gray-200 bg-gradient-to-br from-sky-50 to-white p-4'>
          <div className='text-xs text-gray-600'>{L.freshFeed}</div>
          <div className='text-lg font-bold text-sky-700'>
            {t.fq.toLocaleString()}{' '}
            <span className='text-sm font-normal text-gray-500'>
              {data?.freshUnit ?? ''}
            </span>
          </div>
        </div>
        <div className='rounded-lg border border-gray-200 bg-gradient-to-br from-violet-50 to-white p-4'>
          <div className='text-xs text-gray-600'>{L.pelletFeed}</div>
          <div className='text-lg font-bold text-violet-700'>
            {t.pq.toLocaleString()}{' '}
            <span className='text-sm font-normal text-gray-500'>
              {data?.pelletUnit ?? ''}
            </span>
          </div>
        </div>
        <div className='rounded-lg border border-gray-200 bg-gradient-to-br from-amber-50 to-white p-4'>
          <div className='text-xs text-gray-600'>{L.totalCost}</div>
          <div className='text-lg font-bold text-amber-800'>
            ฿{t.cost.toLocaleString()}
          </div>
        </div>
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <div className='text-xs text-gray-600'>
            {L.deathFish} / {L.touristCatch}
          </div>
          <div className='text-lg font-semibold text-gray-800'>
            {t.deaths} / {t.tourist}
          </div>
        </div>
      </div>

      {isUploadModalOpen && (
        <ExcelUploadModal
          key={`${currentMonth}-${freshFeeds.map((f) => f.id).join(',')}-${pelletFeeds.map((f) => f.id).join(',')}`}
          onClose={() => setIsUploadModalOpen(false)}
          currentMonth={currentMonth}
          freshFeeds={freshFeeds}
          pelletFeeds={pelletFeeds}
          isSubmitting={uploadMutation.isPending}
          onUpload={(file, ids) =>
            uploadMutation.mutateAsync({
              file,
              month: currentMonth,
              ...ids,
            })
          }
        />
      )}
    </div>
  )
}
