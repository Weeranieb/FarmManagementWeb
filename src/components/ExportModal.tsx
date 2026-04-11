import { useState } from 'react'
import {
  X,
  Download,
  Calendar,
  Check,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react'
import { th } from '../locales/th'
import { apiClient } from '../lib/api-client'
import { dailyLogApi } from '../api/dailyLog'

const EL = th.exportReport

interface ExportModalProps {
  onClose: () => void
  scope: 'pond' | 'farm'
  name: string
  entityId: number
}

export function ExportModal({
  onClose,
  scope,
  name,
  entityId,
}: ExportModalProps) {
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setError(null)
    if (entityId <= 0) {
      setError(EL.exportFailed)
      return
    }
    const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
    const path =
      scope === 'pond'
        ? dailyLogApi.pondExportPath(entityId, monthStr)
        : dailyLogApi.farmExportPath(entityId, monthStr)
    const fallbackName = `daily-log-${monthStr}.xlsx`

    setExporting(true)
    try {
      await apiClient.downloadBlob(path, fallbackName)
      setDone(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : EL.exportFailed
      setError(msg)
    } finally {
      setExporting(false)
    }
  }

  const handleClose = () => {
    setSelectedMonth(today.getMonth() + 1)
    setSelectedYear(today.getFullYear())
    setExporting(false)
    setDone(false)
    setError(null)
    onClose()
  }

  const years = [
    today.getFullYear(),
    today.getFullYear() - 1,
    today.getFullYear() - 2,
  ]

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#1c2d4f] to-[#243a63] text-white flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <Download size={20} />
            <div>
              <h2 className='font-semibold text-base'>{EL.title}</h2>
              <p className='text-xs text-white/70 truncate max-w-[260px]'>
                {name}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={handleClose}
            className='p-1.5 hover:bg-white/20 rounded-lg transition-colors'
            aria-label={EL.close}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto p-5 space-y-4'>
          {/* Step 1 — Report type (only daily_feed for now) */}
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5'>
              1. {EL.selectReportType}
            </p>
            <button
              type='button'
              className='w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-500 bg-blue-50 shadow-sm text-left'
            >
              <div className='p-2 rounded-lg border text-blue-600 bg-blue-100 border-blue-200 flex-shrink-0'>
                <Calendar size={18} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-blue-700'>
                  {EL.dailyFeedMonthly}
                </p>
                <p className='text-xs text-gray-500 mt-0.5 leading-tight'>
                  {EL.dailyFeedMonthlyDesc}
                </p>
              </div>
              <Check size={16} className='text-blue-600 flex-shrink-0' />
            </button>
          </div>

          {/* Step 2 — Month picker */}
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5'>
              2. {EL.selectMonth}
            </p>
            <div className='flex gap-2 flex-wrap'>
              {EL.monthsShort.map((m, idx) => (
                <button
                  key={idx}
                  type='button'
                  onClick={() => setSelectedMonth(idx + 1)}
                  disabled={exporting}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    selectedMonth === idx + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className='flex gap-2 mt-2'>
              {years.map((y) => (
                <button
                  key={y}
                  type='button'
                  onClick={() => setSelectedYear(y)}
                  disabled={exporting}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    selectedYear === y
                      ? 'bg-[#1c2d4f] text-white border-[#1c2d4f]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {y + 543}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 — Format (xlsx only for now) */}
          <div>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5'>
              3. {EL.selectFormat}
            </p>
            <button
              type='button'
              className='flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-blue-600 text-white border-blue-600 text-xs font-medium'
            >
              <FileSpreadsheet size={14} />
              {EL.formatXlsx}
            </button>
          </div>

          {/* Summary */}
          <div className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'>
            <p className='text-xs text-gray-500 mb-1'>{EL.exportSummary}</p>
            <div className='flex items-center gap-1.5 text-sm text-gray-800 font-medium flex-wrap'>
              <span>{EL.dailyFeedMonthly}</span>
              <span className='text-gray-400'>›</span>
              <span>
                {EL.monthsShort[selectedMonth - 1]} {selectedYear + 543}
              </span>
              <span className='text-gray-400'>›</span>
              <span className='uppercase text-blue-600'>.xlsx</span>
            </div>
          </div>

          {error && (
            <div className='flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700'>
              <AlertCircle size={18} className='flex-shrink-0 mt-0.5' />
              <div>
                <p className='font-medium text-red-900'>{EL.exportFailed}</p>
                <p className='mt-1 text-red-800'>{error}</p>
              </div>
            </div>
          )}

          {/* Done message */}
          {done && (
            <div className='flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700'>
              <Check size={18} className='flex-shrink-0' />
              <span>{EL.exportSuccess}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 flex-shrink-0'>
          <button
            type='button'
            onClick={handleClose}
            className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm'
          >
            {EL.close}
          </button>
          <button
            type='button'
            onClick={() => void handleExport()}
            disabled={exporting || done}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
              !exporting && !done
                ? 'bg-[#1c2d4f] text-white hover:bg-[#243a63]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {exporting ? (
              <>
                <Loader2 size={15} className='animate-spin' />
                {EL.exporting}
              </>
            ) : done ? (
              <>
                <Check size={15} />
                {EL.done}
              </>
            ) : (
              <>
                <Download size={15} />
                {EL.button}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
