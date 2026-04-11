import { useState } from 'react'
import {
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react'
import { th } from '../locales/th'
import type { DailyLogTemplateImportResponse } from '../api/dailyLog'

const L = th.dailyFeed

export interface FarmPondOption {
  id: number
  name: string
}

interface TemplateImportModalProps {
  onClose: () => void
  farmPonds: FarmPondOption[]
  defaultSelectedIds: number[]
  isSubmitting?: boolean
  onImport: (
    file: File,
    selectedPondIds: number[],
  ) => Promise<DailyLogTemplateImportResponse>
}

export function TemplateImportModal({
  onClose,
  farmPonds,
  defaultSelectedIds,
  isSubmitting = false,
  onImport,
}: TemplateImportModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(defaultSelectedIds),
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const togglePond = (id: number) => {
    setError(null)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

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
    if (selectedFile == null) return
    if (selectedIds.size === 0) {
      setError(L.templateSelectPondError)
      return
    }
    setError(null)
    try {
      await onImport(selectedFile, Array.from(selectedIds))
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : L.excelParseError)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setError(null)
    setSelectedIds(new Set(defaultSelectedIds))
    onClose()
  }

  if (farmPonds.length === 0) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
        <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-2xl'>
          <p className='text-gray-700'>{L.templateSelectPondError}</p>
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
        <div className='flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white'>
          <div className='flex items-center gap-3'>
            <FileSpreadsheet size={24} />
            <h2 className='text-xl font-semibold'>{L.templateTitle}</h2>
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
          <p className='mb-4 text-sm text-gray-600'>{L.templatePondHint}</p>

          <div className='mb-6'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              {L.templatePondLabel}
            </label>
            <ul className='max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3'>
              {farmPonds.map((p) => (
                <li key={p.id}>
                  <label className='flex cursor-pointer items-center gap-2 text-sm text-gray-800'>
                    <input
                      type='checkbox'
                      checked={selectedIds.has(p.id)}
                      onChange={() => togglePond(p.id)}
                      className='h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500'
                    />
                    <span>{p.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className='mb-6'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              {L.templateFileLabel}
            </label>
            <div
              className={`rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors ${
                isSubmitting
                  ? 'pointer-events-none opacity-60'
                  : 'hover:border-emerald-500'
              }`}
            >
              <input
                type='file'
                accept='.xlsx'
                onChange={handleFileSelect}
                disabled={isSubmitting}
                className='hidden'
                id='template-import-daily-log'
              />
              <label
                htmlFor='template-import-daily-log'
                className={
                  isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
                }
              >
                <Upload size={48} className='mx-auto mb-3 text-gray-400' />
                <p className='mb-1 text-gray-700'>
                  {selectedFile ? selectedFile.name : L.excelClickToUpload}
                </p>
                <p className='text-sm text-gray-500'>.xlsx</p>
              </label>
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

          {selectedFile && selectedIds.size > 0 && (
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
            disabled={!selectedFile || selectedIds.size === 0 || isSubmitting}
            className='flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            <CheckCircle size={18} />
            {L.templateConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}
