import { useState, useMemo, useRef, useCallback } from 'react'
import {
  useDailyLogQuery,
  useDailyLogBulkMutation,
  useDailyLogTemplateImportMutation,
} from '../../hooks/useDailyLog'
import { useFeedCollectionListQuery } from '../../hooks/useFeedCollection'
import { FEED_TYPE_FRESH, FEED_TYPE_PELLET } from '../../constants/feedType'
import { useAppToast } from '../../contexts/AppToastContext'
import { th } from '../../locales/th'
import type { DailyFeedTabProps, DayRow, DirtyMonthState } from './types'
import {
  buildRowsFromMonth,
  clampYearMonth,
  emptyRow,
  getDaysInMonth,
  isBeforeCycleStart,
  isFutureDay,
  isRowEqual,
  isRowNonEmpty,
  monthNavigationBounds,
  todayYearMonth,
  abbrevThaiKgUnit,
  errorMessageForToast,
} from './utils'

const L = th.dailyFeed

export function useDailyFeedTab({
  pondId,
  farmId,
  farmPonds,
  cycleStartDate,
}: Pick<
  DailyFeedTabProps,
  'pondId' | 'farmId' | 'farmPonds' | 'cycleStartDate'
>) {
  const { showToast } = useAppToast()
  const { minMonth, maxMonth } = useMemo(
    () => monthNavigationBounds(cycleStartDate),
    [cycleStartDate],
  )
  const [currentMonth, setCurrentMonth] = useState(() => {
    const b = monthNavigationBounds(cycleStartDate)
    return clampYearMonth(todayYearMonth(), b.minMonth, b.maxMonth)
  })
  const [isEditing, setIsEditing] = useState(false)

  const viewMonth = useMemo(
    () => clampYearMonth(currentMonth, minMonth, maxMonth),
    [currentMonth, minMonth, maxMonth],
  )

  const hasActiveFarmPond = useMemo(
    () => farmPonds.some((p) => p.status === 'active'),
    [farmPonds],
  )

  const {
    data,
    isLoading,
    isError,
    error: monthQueryError,
    refetch: refetchMonthLog,
    isFetching,
  } = useDailyLogQuery(pondId, viewMonth)
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
  const [editBaselineRows, setEditBaselineRows] = useState<
    Record<number, DayRow>
  >({})
  const originalRowsRef = useRef<Record<number, DayRow>>({})
  const dirtyMonthsRef = useRef<Map<string, DirtyMonthState>>(new Map())

  const serverBuiltRows = useMemo(() => buildRowsFromMonth(data), [data])

  const switchMonth = useCallback(
    (target: string) => {
      if (isEditing) {
        dirtyMonthsRef.current.set(viewMonth, {
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
    },
    [isEditing, viewMonth, localRows, freshFcId, pelletFcId],
  )

  const hasUnsavedChanges = useCallback(() => {
    const orig = originalRowsRef.current
    const numDays = getDaysInMonth(viewMonth)
    const [cy, cm] = viewMonth.split('-').map(Number)
    for (let d = 1; d <= numDays; d++) {
      if (isFutureDay(cy, cm, d)) continue
      if (isBeforeCycleStart(cy, cm, d, cycleStartDate)) continue
      const cur = localRows[d] ?? emptyRow()
      const prev = orig[d] ?? emptyRow()
      if (!isRowEqual(cur, prev)) return true
    }
    const origFresh = data?.freshFeedCollectionId ?? null
    const origPellet = data?.pelletFeedCollectionId ?? null
    if (freshFcId !== origFresh || pelletFcId !== origPellet) return true
    return false
  }, [viewMonth, localRows, cycleStartDate, data, freshFcId, pelletFcId])

  const goToMonth = useCallback(
    (target: string) => {
      const next = clampYearMonth(target, minMonth, maxMonth)
      if (next === viewMonth) return
      if (!isEditing) {
        switchMonth(next)
        return
      }
      if (!hasUnsavedChanges()) {
        switchMonth(next)
        return
      }
      setPendingMonth(next)
    },
    [minMonth, maxMonth, viewMonth, isEditing, switchMonth, hasUnsavedChanges],
  )

  const confirmPendingMonth = useCallback(() => {
    if (pendingMonth == null) return
    switchMonth(clampYearMonth(pendingMonth, minMonth, maxMonth))
    setPendingMonth(null)
  }, [pendingMonth, minMonth, maxMonth, switchMonth])

  const dismissPendingMonth = useCallback(() => {
    setPendingMonth(null)
  }, [])

  const canGoPrevMonth = viewMonth > minMonth
  const canGoNextMonth = viewMonth < maxMonth

  const prevMonth = useCallback(() => {
    const [y, m] = viewMonth.split('-').map(Number)
    const pm = m === 1 ? 12 : m - 1
    const py = m === 1 ? y - 1 : y
    goToMonth(`${py}-${String(pm).padStart(2, '0')}`)
  }, [viewMonth, goToMonth])

  const nextMonth = useCallback(() => {
    const [y, m] = viewMonth.split('-').map(Number)
    const nm = m === 12 ? 1 : m + 1
    const ny = m === 12 ? y + 1 : y
    goToMonth(`${ny}-${String(nm).padStart(2, '0')}`)
  }, [viewMonth, goToMonth])

  const handleEdit = useCallback(() => {
    const rows = buildRowsFromMonth(data)
    const baseline = JSON.parse(JSON.stringify(rows)) as Record<number, DayRow>
    originalRowsRef.current = baseline
    setEditBaselineRows(baseline)
    setLocalRows(JSON.parse(JSON.stringify(rows)))
    setFreshFcId(data?.freshFeedCollectionId ?? null)
    setPelletFcId(data?.pelletFeedCollectionId ?? null)
    setIsEditing(true)
  }, [data])

  const handleCancel = useCallback(() => {
    setPendingMonth(null)
    dirtyMonthsRef.current.delete(viewMonth)
    originalRowsRef.current = {}
    setEditBaselineRows({})
    setIsEditing(false)
  }, [viewMonth])

  const handleNum = useCallback(
    (day: number, field: keyof DayRow, raw: string) => {
      const [y, m] = viewMonth.split('-').map(Number)
      if (isFutureDay(y, m, day)) return
      if (isBeforeCycleStart(y, m, day, cycleStartDate)) return
      const num = raw === '' ? 0 : parseFloat(raw)
      if (Number.isNaN(num) || num < 0) return
      const intFields: (keyof DayRow)[] = [
        'deathFishCount',
        'touristCatchCount',
      ]
      const v = intFields.includes(field) ? Math.floor(num) : num
      setLocalRows((prev) => ({
        ...prev,
        [day]: { ...(prev[day] ?? emptyRow()), [field]: v },
      }))
    },
    [viewMonth, cycleStartDate],
  )

  const handleSave = useCallback(() => {
    const numDays = getDaysInMonth(viewMonth)
    const [saveY, saveM] = viewMonth.split('-').map(Number)
    const entries: ({ day: number } & DayRow)[] = []
    const deleteDays: number[] = []
    const orig = originalRowsRef.current

    for (let d = 1; d <= numDays; d++) {
      if (isFutureDay(saveY, saveM, d)) continue
      if (isBeforeCycleStart(saveY, saveM, d, cycleStartDate)) continue
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
      dirtyMonthsRef.current.delete(viewMonth)
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
        month: viewMonth,
        freshFeedCollectionId: freshFcId ?? undefined,
        pelletFeedCollectionId: pelletFcId ?? undefined,
        entries,
        deleteDays: deleteDays.length > 0 ? deleteDays : undefined,
      },
      {
        onSuccess: () => {
          dirtyMonthsRef.current.delete(viewMonth)
          originalRowsRef.current = {}
          setEditBaselineRows({})
          setIsEditing(false)
        },
        onError: (err) => {
          showToast('error', errorMessageForToast(err))
        },
      },
    )
  }, [
    viewMonth,
    localRows,
    cycleStartDate,
    freshFcId,
    pelletFcId,
    bulkMutation,
    showToast,
  ])

  const daysInMonth = getDaysInMonth(viewMonth)
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  )
  const [yearNum, monthNum] = viewMonth.split('-').map(Number)

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
      if (isFutureDay(yearNum, monthNum, d)) continue
      if (isBeforeCycleStart(yearNum, monthNum, d, cycleStartDate)) continue
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
  }, [days, rowsForView, yearNum, monthNum, cycleStartDate])

  return {
    data,
    isLoading,
    isError,
    monthQueryError,
    refetchMonthLog,
    isFetching,
    freshFeeds,
    pelletFeeds,
    bulkMutation,
    templateImportMutation,
    hasActiveFarmPond,
    viewMonth,
    canGoPrevMonth,
    canGoNextMonth,
    prevMonth,
    nextMonth,
    handleEdit,
    handleCancel,
    handleSave,
    handleNum,
    confirmPendingMonth,
    dismissPendingMonth,
    pendingMonth,
    isEditing,
    setFreshFcId,
    setPelletFcId,
    freshFcForView,
    pelletFcForView,
    selectedFreshName,
    selectedPelletName,
    freshUnitLabel,
    pelletUnitLabel,
    totals,
    days,
    yearNum,
    monthNum,
    rowsForView,
    editBaselineRows,
    localRows,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    showToast,
  }
}
