import { useState, useMemo, useCallback } from 'react'
import {
  Calendar,
  Plus,
  Save,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Upload,
} from 'lucide-react'
import { th } from '../locales/th'
import {
  useDailyFeedQuery,
  useDailyFeedBulkMutation,
  useDailyFeedDeleteMutation,
  useDailyFeedUploadMutation,
} from '../hooks/useDailyFeed'
import { useFeedCollectionListQuery } from '../hooks/useFeedCollection'
import type { DailyFeedEntry, DailyFeedTable } from '../api/dailyFeed'
import { ExcelUploadModal } from './ExcelUploadModal'

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

function getDayName(month: string, day: number) {
  const date = new Date(`${month}-${String(day).padStart(2, '0')}`)
  return date.toLocaleDateString('th-TH', { weekday: 'short' })
}

function isWeekend(month: string, day: number) {
  const date = new Date(`${month}-${String(day).padStart(2, '0')}`)
  const dow = date.getDay()
  return dow === 0 || dow === 6
}

function getWeeks(daysInMonth: number): number[][] {
  const weeks: number[][] = []
  let current: number[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    current.push(d)
    if (current.length === 7 || d === daysInMonth) {
      weeks.push(current)
      current = []
    }
  }
  return weeks
}

type LocalData = Record<number, { morning: number; evening: number }>

function buildLocalData(entries: DailyFeedEntry[]): LocalData {
  const map: LocalData = {}
  for (const e of entries) {
    map[e.day] = { morning: e.morning, evening: e.evening }
  }
  return map
}

export function DailyFeedTab({ pondId }: DailyFeedTabProps) {
  const numPondId = Number(pondId)
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  )

  const { data: tables = [], isLoading } = useDailyFeedQuery(
    numPondId,
    currentMonth,
  )
  const { data: feedCollections } = useFeedCollectionListQuery()
  const feedList = useMemo(
    () => feedCollections?.items ?? [],
    [feedCollections],
  )

  const excelFeedOptions = useMemo(
    () => feedList.map((f) => ({ id: f.id, name: f.name, unit: f.unit })),
    [feedList],
  )

  const bulkMutation = useDailyFeedBulkMutation(numPondId)
  const deleteMutation = useDailyFeedDeleteMutation(numPondId)
  const uploadMutation = useDailyFeedUploadMutation(numPondId)

  const [editingTableId, setEditingTableId] = useState<number | null>(null)
  const [localEdits, setLocalEdits] = useState<LocalData>({})

  // "Add feed type" state
  const [showAddPicker, setShowAddPicker] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const existingFcIds = useMemo(
    () => new Set(tables.map((t) => t.feedCollectionId)),
    [tables],
  )
  const availableFeeds = feedList.filter((f) => !existingFcIds.has(f.id))

  function prevMonth() {
    const [y, m] = currentMonth.split('-').map(Number)
    const pm = m === 1 ? 12 : m - 1
    const py = m === 1 ? y - 1 : y
    setCurrentMonth(`${py}-${String(pm).padStart(2, '0')}`)
    setEditingTableId(null)
  }

  function nextMonth() {
    const [y, m] = currentMonth.split('-').map(Number)
    const nm = m === 12 ? 1 : m + 1
    const ny = m === 12 ? y + 1 : y
    setCurrentMonth(`${ny}-${String(nm).padStart(2, '0')}`)
    setEditingTableId(null)
  }

  function startEditing(table: DailyFeedTable) {
    setEditingTableId(table.feedCollectionId)
    setLocalEdits(buildLocalData(table.entries))
  }

  function handleCellChange(
    day: number,
    field: 'morning' | 'evening',
    value: string,
  ) {
    const num = value === '' ? 0 : parseFloat(value)
    if (isNaN(num)) return
    setLocalEdits((prev) => ({
      ...prev,
      [day]: { ...(prev[day] ?? { morning: 0, evening: 0 }), [field]: num },
    }))
  }

  function saveEdits(feedCollectionId: number) {
    const entries = Object.entries(localEdits)
      .map(([dayStr, v]) => ({
        day: Number(dayStr),
        morning: v.morning,
        evening: v.evening,
      }))
      .filter((e) => e.morning > 0 || e.evening > 0)

    bulkMutation.mutate(
      { feedCollectionId, month: currentMonth, entries },
      { onSuccess: () => setEditingTableId(null) },
    )
  }

  function handleDeleteTable(feedCollectionId: number) {
    if (!confirm(L.confirmDelete)) return
    deleteMutation.mutate(feedCollectionId)
  }

  function handleAddFeedType(feedCollectionId: number) {
    setShowAddPicker(false)
    // Create empty entry for day 1 to register the feed table
    bulkMutation.mutate({
      feedCollectionId,
      month: currentMonth,
      entries: [{ day: 1, morning: 0, evening: 0 }],
    })
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const weeks = getWeeks(daysInMonth)

  const calcTableTotals = useCallback(
    (table: DailyFeedTable, overrideData?: LocalData) => {
      const data = overrideData ?? buildLocalData(table.entries)
      let totalMorning = 0
      let totalEvening = 0
      let totalCost = 0

      const priceMap: Record<number, number | null> = {}
      for (const e of table.entries) {
        priceMap[e.day] = e.unitPrice
      }

      for (const [dayStr, v] of Object.entries(data)) {
        totalMorning += v.morning
        totalEvening += v.evening
        const price = priceMap[Number(dayStr)] ?? null
        if (price != null) {
          totalCost += (v.morning + v.evening) * price
        }
      }
      return { totalMorning, totalEvening, totalCost }
    },
    [],
  )

  const grandTotals = useMemo(() => {
    let qty = 0
    let cost = 0
    for (const t of tables) {
      const { totalMorning, totalEvening, totalCost } = calcTableTotals(t)
      qty += totalMorning + totalEvening
      cost += totalCost
    }
    return { qty, cost }
  }, [tables, calcTableTotals])

  if (isLoading) {
    return (
      <div className='text-center py-12 text-gray-500'>{th.common.loading}</div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
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
            onClick={nextMonth}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ChevronRight size={20} className='text-gray-600' />
          </button>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => setIsUploadModalOpen(true)}
            disabled={
              excelFeedOptions.length === 0 ||
              bulkMutation.isPending ||
              uploadMutation.isPending
            }
            className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Upload size={18} />
            {L.uploadExcel}
          </button>
          <div className='relative'>
            <button
              onClick={() => setShowAddPicker(!showAddPicker)}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Plus size={18} />
              {L.addFeedType}
            </button>
            {showAddPicker && availableFeeds.length > 0 && (
              <div className='absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[220px]'>
                {availableFeeds.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleAddFeedType(f.id)}
                    className='block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 first:rounded-t-lg last:rounded-b-lg'
                  >
                    {f.name} <span className='text-gray-400'>({f.unit})</span>
                  </button>
                ))}
              </div>
            )}
            {showAddPicker && availableFeeds.length === 0 && (
              <div className='absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[220px] p-4 text-sm text-gray-500'>
                {L.noFeedAvailable}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables */}
      {tables.length === 0 ? (
        <div className='rounded-lg border border-gray-200 bg-gray-50/50 p-12 text-center'>
          <Calendar size={48} className='mx-auto text-gray-400 mb-3' />
          <p className='text-gray-600 mb-1'>{L.empty}</p>
          <p className='text-sm text-gray-500'>{L.emptyHint}</p>
        </div>
      ) : (
        <div className='space-y-6'>
          {tables.map((table) => {
            const isEditing = editingTableId === table.feedCollectionId
            const displayData = isEditing
              ? localEdits
              : buildLocalData(table.entries)
            const { totalMorning, totalEvening, totalCost } = calcTableTotals(
              table,
              isEditing ? localEdits : undefined,
            )

            return (
              <div
                key={table.feedCollectionId}
                className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden'
              >
                {/* Table Header */}
                <div className='px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 flex-1'>
                      <span className='font-semibold'>
                        {table.feedCollectionName}
                      </span>
                      <div className='flex items-center gap-4 text-sm'>
                        <span>
                          <span className='opacity-80'>{L.total}:</span>{' '}
                          <span className='font-semibold'>
                            {(totalMorning + totalEvening).toLocaleString()}{' '}
                            {table.feedUnit}
                          </span>
                        </span>
                        <span>
                          <span className='opacity-80'>{L.cost}:</span>{' '}
                          <span className='font-semibold'>
                            ฿{totalCost.toLocaleString()}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {isEditing ? (
                        <button
                          onClick={() => saveEdits(table.feedCollectionId)}
                          disabled={bulkMutation.isPending}
                          className='flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50'
                        >
                          <Save size={16} />
                          {L.save}
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditing(table)}
                          className='flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur'
                        >
                          <Edit size={16} />
                          {L.edit}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteTable(table.feedCollectionId)
                        }
                        disabled={deleteMutation.isPending}
                        className='p-2 bg-white/20 text-white rounded-lg hover:bg-red-500 transition-colors backdrop-blur disabled:opacity-50'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className='p-4'>
                  {weeks.map((week, wi) => (
                    <div key={wi} className='mb-3'>
                      <div className='grid grid-cols-7 gap-2'>
                        {week.map((day) => {
                          const dayData = displayData[day] ?? {
                            morning: 0,
                            evening: 0,
                          }
                          const dayTotal = dayData.morning + dayData.evening
                          const weekend = isWeekend(currentMonth, day)

                          return (
                            <div
                              key={day}
                              className={`border rounded-lg p-3 ${weekend ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'} hover:bg-blue-50 transition-colors`}
                            >
                              <div className='text-center mb-3'>
                                <div
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${weekend ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white'}`}
                                >
                                  {day}
                                </div>
                                <div className='text-[10px] text-gray-400 mt-0.5'>
                                  {getDayName(currentMonth, day)}
                                </div>
                              </div>
                              <div className='space-y-2'>
                                <div className='flex items-center gap-1.5'>
                                  <label className='text-xs text-gray-600 font-medium flex-shrink-0'>
                                    {L.morning}
                                  </label>
                                  <input
                                    type='number'
                                    value={dayData.morning || ''}
                                    onChange={(e) =>
                                      handleCellChange(
                                        day,
                                        'morning',
                                        e.target.value,
                                      )
                                    }
                                    disabled={!isEditing}
                                    placeholder='0'
                                    className='w-full px-1.5 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:border-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                  />
                                </div>
                                <div className='flex items-center gap-1.5'>
                                  <label className='text-xs text-gray-600 font-medium flex-shrink-0'>
                                    {L.evening}
                                  </label>
                                  <input
                                    type='number'
                                    value={dayData.evening || ''}
                                    onChange={(e) =>
                                      handleCellChange(
                                        day,
                                        'evening',
                                        e.target.value,
                                      )
                                    }
                                    disabled={!isEditing}
                                    placeholder='0'
                                    className='w-full px-1.5 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:border-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                  />
                                </div>
                                {dayTotal > 0 && (
                                  <div className='text-center pt-1.5 border-t border-gray-200 mt-1.5'>
                                    <span className='text-xs font-bold text-blue-600'>
                                      {dayTotal} {table.feedUnit}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal Footer */}
                <div className='px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200'>
                  <div className='grid grid-cols-3 gap-6'>
                    <div className='text-center'>
                      <div className='text-xs text-gray-600 mb-1'>
                        {L.morningTotal}
                      </div>
                      <div className='text-lg font-bold text-blue-600'>
                        {totalMorning.toLocaleString()} {table.feedUnit}
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xs text-gray-600 mb-1'>
                        {L.eveningTotal}
                      </div>
                      <div className='text-lg font-bold text-indigo-600'>
                        {totalEvening.toLocaleString()} {table.feedUnit}
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xs text-gray-600 mb-1'>
                        {L.totalCost}
                      </div>
                      <div className='text-lg font-bold text-green-600'>
                        ฿{totalCost.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Grand Summary */}
      {tables.length > 0 && (
        <div className='bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white'>
          <h3 className='text-lg font-semibold mb-4 opacity-90'>
            {L.monthlySummary}
          </h3>
          <div className='grid grid-cols-3 gap-6'>
            <div className='bg-white/10 backdrop-blur rounded-lg p-4 text-center'>
              <div className='text-sm opacity-80 mb-2'>{L.feedTypes}</div>
              <div className='text-3xl font-bold'>{tables.length}</div>
            </div>
            <div className='bg-white/10 backdrop-blur rounded-lg p-4 text-center'>
              <div className='text-sm opacity-80 mb-2'>{L.totalQuantity}</div>
              <div className='text-3xl font-bold'>
                {grandTotals.qty.toLocaleString()}
              </div>
            </div>
            <div className='bg-white/10 backdrop-blur rounded-lg p-4 text-center'>
              <div className='text-sm opacity-80 mb-2'>{L.totalCost}</div>
              <div className='text-3xl font-bold'>
                ฿{grandTotals.cost.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <ExcelUploadModal
          key={`${currentMonth}-${excelFeedOptions.map((f) => f.id).join(',')}`}
          onClose={() => setIsUploadModalOpen(false)}
          currentMonth={currentMonth}
          feeds={excelFeedOptions}
          isSubmitting={uploadMutation.isPending}
          onUpload={(file, feedCollectionId) =>
            uploadMutation.mutateAsync({
              file,
              month: currentMonth,
              feedCollectionId,
            })
          }
        />
      )}
    </div>
  )
}
