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
import { th } from '../../locales/th'
import { TemplateImportModal } from '../TemplateImportModal'
import type { DailyFeedTabProps, DayRow } from './types'
import { DATE_COL_DIM, DAY_BODY_ROW, DAY_BODY_TEXT } from './constants'
import {
  emptyRow,
  errorMessageForToast,
  fmt,
  fmtOrEmpty,
  abbrevThaiKgUnit,
  formatMonth,
  getDayOfWeek,
  isBeforeCycleStart,
  isFutureDay,
  isRowNonEmpty,
  viewCellDisplay,
} from './utils'
import { SummaryCard } from './components/SummaryCard'
import { useDailyFeedTab } from './useDailyFeedTab'

const L = th.dailyFeed

export function DailyFeedTab({
  pondId,
  farmId,
  farmPonds,
  showTouristCatch,
  cycleStartDate,
}: DailyFeedTabProps) {
  const hook = useDailyFeedTab({
    pondId,
    farmId,
    farmPonds,
    cycleStartDate,
  })

  const {
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
  } = hook

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
          title={inputDisabled ? L.rowDayLocked : undefined}
          className={`${borderR} box-border ${DAY_BODY_ROW} align-middle px-1.5 text-center ${DAY_BODY_TEXT} ${
            inputDisabled
              ? 'bg-slate-200/90 text-slate-600'
              : `text-gray-700 ${bgClass}`
          }`}
        >
          {viewCellDisplay(val)}
        </td>
      )
    }

    const locked = inputDisabled
    return (
      <td
        className={`${borderR} box-border ${DAY_BODY_ROW} align-middle border-b border-gray-400 p-0 ${
          locked ? 'bg-slate-200/90' : cellBgEdit
        }`}
      >
        <input
          type='number'
          min={0}
          step={step}
          value={val === 0 ? '' : val}
          onChange={(e) => handleNum(day, field, e.target.value)}
          placeholder=''
          title={locked ? L.rowDayLocked : undefined}
          disabled={locked}
          className={`w-full h-7 min-h-7 px-0.5 text-center ${DAY_BODY_TEXT} border-0 outline-none rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            locked
              ? 'cursor-not-allowed bg-slate-300/95 text-slate-600 font-medium'
              : inputDiffClass ||
                'bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:ring-inset'
          }`}
        />
      </td>
    )
  }

  if (isError) {
    return (
      <div className='text-center py-12 space-y-4 px-4'>
        <p className='text-red-600 font-medium'>{L.loadMonthError}</p>
        <p className='text-sm text-gray-600 max-w-md mx-auto'>
          {errorMessageForToast(monthQueryError)}
        </p>
        <button
          type='button'
          onClick={() => void refetchMonthLog()}
          disabled={isFetching}
          className='inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isFetching ? th.common.loading : L.retryLoadMonth}
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='text-center py-12 text-gray-500'>{th.common.loading}</div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={prevMonth}
            disabled={bulkMutation.isPending || !canGoPrevMonth}
            aria-label={L.prevMonthAria}
            title={!canGoPrevMonth ? L.monthNavAtCycleStart : L.prevMonthAria}
            className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50'
          >
            <ChevronLeft size={18} className='text-gray-600' aria-hidden />
          </button>
          <div className='flex items-center gap-2 px-2 min-w-[170px] justify-center'>
            <Calendar size={17} className='text-blue-600 flex-shrink-0' />
            <span className='font-semibold text-gray-800 whitespace-nowrap'>
              {formatMonth(viewMonth)}
            </span>
          </div>
          <button
            type='button'
            onClick={nextMonth}
            disabled={bulkMutation.isPending || !canGoNextMonth}
            aria-label={L.nextMonthAria}
            title={!canGoNextMonth ? L.monthNavAtCurrentMonth : L.nextMonthAria}
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
                  !hasActiveFarmPond ||
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
              <tr className='[&>th]:border-t-0'>
                <th
                  rowSpan={2}
                  className={`sticky left-0 z-20 bg-gray-100 border border-gray-400 border-t-0 border-l-0 px-2 py-1.5 text-center text-gray-700 text-xs leading-tight ${DATE_COL_DIM}`}
                >
                  {th.pondDetail.date}
                </th>
                <th
                  colSpan={2}
                  className='bg-green-100 border border-gray-400 border-t-0 px-2 py-1.5 text-center text-green-800 text-xs font-semibold leading-tight'
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
                  className='bg-amber-100 border border-gray-400 border-t-0 px-2 py-1.5 text-center text-amber-800 text-xs font-semibold leading-tight'
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
                  className={`bg-purple-100 border border-gray-400 border-t-0 px-2 py-1.5 text-center text-purple-800 text-xs font-semibold leading-tight w-20 ${
                    showTouristCatch ? '' : 'border-r-0'
                  }`}
                >
                  {L.deathFish}
                  <br />
                  <span className='font-normal'>({L.unitFish})</span>
                </th>
                {showTouristCatch && (
                  <th
                    rowSpan={2}
                    className='bg-fuchsia-100 border border-gray-400 border-t-0 border-r-0 px-2 py-1.5 text-center text-fuchsia-800 text-xs font-semibold leading-tight w-24'
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
                <th className='bg-amber-50 border border-gray-400 border-r-0 px-1.5 py-1 text-center text-amber-700 text-xs font-medium leading-tight w-20'>
                  {L.evening} ({pelletUnitLabel})
                </th>
              </tr>
            </thead>

            <tbody>
              {days.map((day) => {
                const dow = getDayOfWeek(yearNum, monthNum, day)
                const isWeekend = dow === 0 || dow === 6
                const rowIsFuture = isFutureDay(yearNum, monthNum, day)
                const rowBeforeStart = isBeforeCycleStart(
                  yearNum,
                  monthNum,
                  day,
                  cycleStartDate,
                )
                const rowInactive = rowIsFuture || rowBeforeStart
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
                  !rowInactive

                return (
                  <tr
                    key={day}
                    className={`
                      border-b border-gray-400 transition-colors
                      ${
                        rowInactive
                          ? 'bg-slate-100'
                          : isWeekend
                            ? 'bg-gray-50/70'
                            : 'bg-white'
                      }
                      ${hasData && !isWeekend && !rowIsDelete && !rowInactive ? 'bg-blue-50/20' : ''}
                      ${rowIsDelete ? 'bg-red-50/30' : ''}
                      ${!rowInactive && !rowIsDelete ? 'hover:bg-yellow-50/40' : ''}
                    `}
                  >
                    <td
                      title={rowInactive ? L.rowDayLocked : undefined}
                      className={`sticky left-0 z-10 ${DATE_COL_DIM} box-border ${DAY_BODY_ROW} align-middle border-r border-gray-400 border-l-0 px-1.5 text-center ${
                        rowInactive
                          ? 'bg-slate-300/95'
                          : rowIsDelete
                            ? 'bg-red-100'
                            : isWeekend
                              ? 'bg-gray-100'
                              : 'bg-gray-50'
                      }`}
                    >
                      <span
                        className={`font-bold ${DAY_BODY_TEXT} ${
                          rowInactive
                            ? 'text-slate-600'
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
                      rowInactive,
                    )}
                    {renderCell(
                      day,
                      'freshEvening',
                      'bg-green-50/40',
                      'any',
                      false,
                      rowInactive,
                    )}
                    {renderCell(
                      day,
                      'pelletMorning',
                      'bg-amber-50/40',
                      'any',
                      false,
                      rowInactive,
                    )}
                    {renderCell(
                      day,
                      'pelletEvening',
                      'bg-amber-50/40',
                      'any',
                      false,
                      rowInactive,
                    )}
                    {renderCell(
                      day,
                      'deathFishCount',
                      'bg-purple-50/40',
                      '1',
                      !showTouristCatch,
                      rowInactive,
                    )}
                    {showTouristCatch &&
                      renderCell(
                        day,
                        'touristCatchCount',
                        'bg-fuchsia-50/40',
                        '1',
                        true,
                        rowInactive,
                      )}
                  </tr>
                )
              })}
            </tbody>

            <tfoot>
              <tr className='border-t border-gray-400 bg-gray-100'>
                <td
                  className={`sticky left-0 z-10 ${DATE_COL_DIM} box-border bg-gray-200 border-r border-gray-400 border-l-0 px-1.5 py-1.5 text-center font-bold text-gray-700 text-xs leading-tight`}
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
                <td
                  className={`border-r border-gray-400 px-1.5 py-1.5 text-center font-bold text-purple-700 text-xs leading-tight bg-purple-100 ${
                    showTouristCatch ? '' : 'border-r-0'
                  }`}
                >
                  {totals.deaths}
                </td>
                {showTouristCatch && (
                  <td className='border-r-0 px-1.5 py-1.5 text-center font-bold text-fuchsia-700 text-xs leading-tight bg-fuchsia-100'>
                    {totals.tourist}
                  </td>
                )}
              </tr>
              <tr className='border-t border-gray-400 bg-blue-50 [&>td]:border-b-0'>
                <td
                  className={`sticky left-0 z-10 ${DATE_COL_DIM} box-border bg-blue-100 border-r border-gray-400 border-l-0 px-1.5 py-1.5 text-center font-bold text-blue-800 text-xs leading-tight`}
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
                <td
                  className={`border-r border-gray-400 px-1.5 py-1.5 text-center font-semibold text-purple-700 text-xs leading-tight bg-purple-50 ${
                    showTouristCatch ? '' : 'border-r-0'
                  }`}
                >
                  {`${totals.deaths} ${L.unitFish}`}
                </td>
                {showTouristCatch && (
                  <td className='border-r-0 px-1.5 py-1.5 text-center font-semibold text-fuchsia-700 text-xs leading-tight bg-fuchsia-50'>
                    {`${totals.tourist} ${L.unitFish}`}
                  </td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

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

      {isTemplateModalOpen && farmId > 0 && (
        <TemplateImportModal
          key={`${pondId}-${farmPonds.length}`}
          onClose={() => setIsTemplateModalOpen(false)}
          farmPonds={farmPonds}
          defaultSelectedIds={[pondId]}
          isSubmitting={templateImportMutation.isPending}
          onImport={async (file, selectedPondIds) => {
            const res = await templateImportMutation.mutateAsync({
              file,
              selectedPondIds,
            })
            handleCancel()
            await refetchMonthLog()
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
