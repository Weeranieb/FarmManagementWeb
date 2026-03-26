import { useState } from 'react'
import {
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react'
import { th } from '../locales/th'

const L = th.dailyFeed

export interface ExcelFeedOption {
  id: number
  name: string
  unit: string
}

interface ExcelUploadModalProps {
  onClose: () => void
  currentMonth: string
  feeds: ExcelFeedOption[]
  isSubmitting?: boolean
  onUpload: (
    file: File,
    feedCollectionId: number,
  ) => Promise<{ rowsImported: number; savedPath: string }>
}

export function ExcelUploadModal({
  onClose,
  currentMonth,
  feeds,
  isSubmitting = false,
  onUpload,
}: ExcelUploadModalProps) {
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(
    () => feeds[0]?.id ?? null,
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    const lower = file.name.toLowerCase()
    if (!lower.endsWith('.xlsx')) {
      setError(L.excelUploadError)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleSubmit = async () => {
    if (selectedFile == null || selectedFeedId == null) return
    setError(null)
    try {
      await onUpload(selectedFile, selectedFeedId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : L.excelParseError)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setError(null)
    onClose()
  }

  if (feeds.length === 0) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
        <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-2xl'>
          <p className='text-gray-700'>{L.excelNoFeeds}</p>
          <button
            type='button'
            onClick={handleClose}
            className='mt-4 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100'
          >
            {th.masterData.modalClose}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl'>
        <div className='flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white'>
          <div className='flex items-center gap-3'>
            <FileSpreadsheet size={24} />
            <h2 className='text-xl font-semibold'>{L.excelTitle}</h2>
          </div>
          <button
            type='button'
            onClick={handleClose}
            className='rounded-lg p-1 hover:bg-white/20'
          >
            <X size={24} />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-6'>
          <p className='mb-4 text-sm text-gray-600'>{L.excelServerNote}</p>

          <div className='mb-6'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              {L.selectFeedForExcel}
            </label>
            <select
              value={selectedFeedId ?? ''}
              onChange={(e) => setSelectedFeedId(Number(e.target.value))}
              className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500'
            >
              {feeds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.unit})
                </option>
              ))}
            </select>
          </div>

          <div className='mb-6'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              {L.excelFileLabel}
            </label>
            <div className='rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-500'>
              <input
                type='file'
                accept='.xlsx'
                onChange={handleFileSelect}
                className='hidden'
                id='excel-upload-daily-feed'
              />
              <label
                htmlFor='excel-upload-daily-feed'
                className='cursor-pointer'
              >
                <Upload size={48} className='mx-auto mb-3 text-gray-400' />
                <p className='mb-1 text-gray-700'>
                  {selectedFile ? selectedFile.name : L.excelClickToUpload}
                </p>
                <p className='text-sm text-gray-500'>.xlsx</p>
              </label>
            </div>

            <div className='mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4'>
              <h4 className='mb-2 text-sm font-semibold text-blue-900'>
                {L.excelFormatTitle}
              </h4>
              <div className='text-sm text-blue-800'>
                <p className='mb-1'>• {L.excelFormatLine1}</p>
                <p className='mb-1'>• {L.excelFormatLine2}</p>
                <p className='mb-1'>• {L.excelFormatLine3}</p>
                <p>• {L.excelMonthOnly}</p>
                <p className='mt-2 font-medium text-blue-900'>
                  {L.excelMonthLabel}: {currentMonth}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className='mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4'>
              <AlertCircle
                size={20}
                className='mt-0.5 flex-shrink-0 text-red-600'
              />
              <div>
                <h4 className='mb-1 text-sm font-semibold text-red-900'>
                  {L.excelUploadError}
                </h4>
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            </div>
          )}

          {selectedFile && !error && (
            <div className='flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4'>
              <CheckCircle size={20} className='text-green-600' />
              <p className='text-sm text-green-800'>{L.excelReadyToSend}</p>
            </div>
          )}
        </div>

        <div className='flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4'>
          <button
            type='button'
            onClick={handleClose}
            className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100'
          >
            {th.masterData.modalCancel}
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={!selectedFile || selectedFeedId == null || isSubmitting}
            className='flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            <CheckCircle size={18} />
            {L.excelConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}
