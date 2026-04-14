import { useState, useCallback } from 'react'
import {
  X,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
  Save,
  RotateCcw,
  ImageIcon,
  Info,
} from 'lucide-react'
import { th } from '../locales/th'
import { scanApi, type ScanDailyLogResponse, type ScanEntry, type ScanConfidence } from '../api/scan'
import { dailyLogApi, type DailyLogBulkUpsertEntry } from '../api/dailyLog'
import { compressImages } from '../utils/imageCompress'

const L = th.dailyFeed

type ModalStep = 'upload' | 'processing' | 'review' | 'success'

interface PhotoScanModalProps {
  pondId: number
  currentMonth: string
  onClose: () => void
  onSaved: () => void
}

function confidenceColor(score: number): string {
  if (score >= 0.9) return 'border-green-400 bg-green-50'
  if (score >= 0.7) return 'border-yellow-400 bg-yellow-50'
  return 'border-red-400 bg-red-50'
}

function confidenceBadge(score: number): { label: string; color: string } {
  if (score >= 0.9) return { label: L.scanConfidenceHigh, color: 'text-green-700 bg-green-100' }
  if (score >= 0.7) return { label: L.scanConfidenceMedium, color: 'text-yellow-700 bg-yellow-100' }
  return { label: L.scanConfidenceLow, color: 'text-red-700 bg-red-100' }
}

export function PhotoScanModal({ pondId, currentMonth, onClose, onSaved }: PhotoScanModalProps) {
  const [step, setStep] = useState<ModalStep>('upload')
  const [month, setMonth] = useState(currentMonth)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanDailyLogResponse | null>(null)
  const [editedEntries, setEditedEntries] = useState<ScanEntry[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setError(null)

    const fileArr = Array.from(files)
    const validFiles = fileArr.filter((f) =>
      f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(f.name),
    )

    if (validFiles.length === 0) {
      setError('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG)')
      return
    }

    setSelectedFiles(validFiles)
    const urls = validFiles.map((f) => URL.createObjectURL(f))
    setPreviewUrls(urls)
  }, [])

  const handleScan = useCallback(async () => {
    if (selectedFiles.length === 0 || !month) return
    setError(null)
    setStep('processing')

    try {
      const compressed = await compressImages(selectedFiles)
      const result = await scanApi.scanDailyLog(pondId, {
        images: compressed,
        month,
      })

      if (!result.entries || result.entries.length === 0) {
        setError(L.scanNoData)
        setStep('upload')
        return
      }

      setScanResult(result)
      setEditedEntries([...result.entries])
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : L.scanError)
      setStep('upload')
    }
  }, [selectedFiles, month, pondId])

  const handleEntryChange = useCallback(
    (index: number, field: keyof ScanEntry, value: string) => {
      setEditedEntries((prev) => {
        const next = [...prev]
        const entry = { ...next[index] }
        if (field === 'day') {
          entry.day = parseInt(value, 10) || 0
        } else if (field === 'deathFishCount') {
          entry[field] = value === '' ? null : parseInt(value, 10)
        } else {
          ;(entry as Record<string, number | null>)[field] = value === '' ? null : parseFloat(value)
        }
        next[index] = entry
        return next
      })
    },
    [],
  )

  const handleSave = useCallback(async () => {
    if (editedEntries.length === 0) return
    setIsSaving(true)
    setError(null)

    try {
      const bulkEntries: DailyLogBulkUpsertEntry[] = editedEntries.map((e) => ({
        day: e.day,
        freshMorning: e.freshMorning ?? 0,
        freshEvening: e.freshEvening ?? 0,
        pelletMorning: e.pelletMorning ?? 0,
        pelletEvening: e.pelletEvening ?? 0,
        deathFishCount: e.deathFishCount ?? 0,
        touristCatchCount: 0,
      }))

      await dailyLogApi.bulkUpsert(pondId, {
        month,
        entries: bulkEntries,
      })

      setStep('success')
      setTimeout(() => {
        onSaved()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setIsSaving(false)
    }
  }, [editedEntries, month, pondId, onSaved, onClose])

  const handleRetake = useCallback(() => {
    setStep('upload')
    setScanResult(null)
    setEditedEntries([])
    setError(null)
  }, [])

  const getConfidence = (day: number, field: keyof ScanConfidence): number => {
    const c = scanResult?.confidence.find((c) => c.day === day)
    if (!c) return 0
    return (c[field] as number) ?? 0
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white'>
          <div className='flex items-center gap-3'>
            <Camera size={24} />
            <h2 className='text-xl font-semibold'>{L.scanTitle}</h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={step === 'processing'}
            className='rounded-lg p-1 hover:bg-white/20 disabled:opacity-50'
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto p-6'>
          {/* Step: Upload */}
          {step === 'upload' && (
            <div className='space-y-5'>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  {L.scanSelectMonth}
                </label>
                <input
                  type='month'
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  {L.scanSelectImages}
                </label>
                <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-violet-500 transition-colors'>
                  <input
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={handleFileSelect}
                    className='hidden'
                    id='photo-scan-input'
                  />
                  <label htmlFor='photo-scan-input' className='cursor-pointer'>
                    <ImageIcon size={48} className='mx-auto mb-3 text-gray-400' />
                    <p className='mb-1 text-gray-700'>
                      {selectedFiles.length > 0
                        ? `เลือกแล้ว ${selectedFiles.length} รูป`
                        : L.scanClickToSelect}
                    </p>
                    <p className='text-sm text-gray-500'>{L.scanImageHint}</p>
                  </label>
                </div>

                {previewUrls.length > 0 && (
                  <div className='mt-3 flex gap-2 overflow-x-auto pb-2'>
                    {previewUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Preview ${i + 1}`}
                        className='h-24 w-24 rounded-lg border border-gray-200 object-cover flex-shrink-0'
                      />
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className='flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4'>
                  <AlertCircle size={20} className='mt-0.5 flex-shrink-0 text-red-600' />
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className='flex flex-col items-center justify-center py-16'>
              <Loader2 size={48} className='animate-spin text-violet-600 mb-4' />
              <p className='text-gray-700 font-medium'>{L.scanProcessing}</p>
            </div>
          )}

          {/* Step: Review */}
          {step === 'review' && scanResult && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <Info size={16} />
                <span>{L.scanReviewHint}</span>
              </div>

              {/* Confidence legend */}
              <div className='flex flex-wrap gap-3 text-xs'>
                {[
                  { score: 0.95, ...confidenceBadge(0.95) },
                  { score: 0.8, ...confidenceBadge(0.8) },
                  { score: 0.5, ...confidenceBadge(0.5) },
                ].map((item) => (
                  <span
                    key={item.label}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${item.color}`}
                  >
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        item.score >= 0.9
                          ? 'bg-green-500'
                          : item.score >= 0.7
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                    />
                    {item.label}
                  </span>
                ))}
              </div>

              {/* Data table */}
              <div className='rounded-lg border border-gray-200 overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='bg-gray-50'>
                      <th className='px-3 py-2 text-left font-medium text-gray-600'>วัน</th>
                      <th className='px-3 py-2 text-center font-medium text-green-700'>สดเช้า</th>
                      <th className='px-3 py-2 text-center font-medium text-green-700'>สดเย็น</th>
                      <th className='px-3 py-2 text-center font-medium text-amber-700'>เม็ดเช้า</th>
                      <th className='px-3 py-2 text-center font-medium text-amber-700'>เม็ดเย็น</th>
                      <th className='px-3 py-2 text-center font-medium text-purple-700'>ปลาตาย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedEntries.map((entry, idx) => (
                      <tr key={entry.day} className='border-t border-gray-100'>
                        <td className='px-3 py-1.5 font-medium text-gray-800'>{entry.day}</td>
                        {(
                          [
                            'freshMorning',
                            'freshEvening',
                            'pelletMorning',
                            'pelletEvening',
                            'deathFishCount',
                          ] as const
                        ).map((field) => {
                          const conf = getConfidence(entry.day, field)
                          const val = entry[field]
                          return (
                            <td key={field} className='px-1 py-1'>
                              <input
                                type='number'
                                min={0}
                                step={field === 'deathFishCount' ? 1 : 'any'}
                                value={val ?? ''}
                                onChange={(e) => handleEntryChange(idx, field, e.target.value)}
                                className={`w-full rounded border-2 px-2 py-1 text-center text-sm outline-none focus:ring-2 focus:ring-violet-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${confidenceColor(conf)}`}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AI notes */}
              {scanResult.notes && (
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
                  <p className='text-xs font-medium text-blue-800 mb-1'>{L.scanNotes}</p>
                  <p className='text-sm text-blue-700'>{scanResult.notes}</p>
                </div>
              )}

              {/* Image thumbnails */}
              {previewUrls.length > 0 && (
                <div className='flex gap-2 overflow-x-auto pb-2'>
                  {previewUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Original ${i + 1}`}
                      className='h-32 rounded-lg border border-gray-200 object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-violet-400'
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              )}

              {error && (
                <div className='flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4'>
                  <AlertCircle size={20} className='mt-0.5 flex-shrink-0 text-red-600' />
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className='flex flex-col items-center justify-center py-16'>
              <CheckCircle size={56} className='text-green-500 mb-4' />
              <p className='text-lg font-medium text-gray-800'>
                {L.scanSuccess.replace('{count}', String(editedEntries.length))}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'processing' && step !== 'success' && (
          <div className='flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100'
            >
              {th.masterData.modalCancel}
            </button>

            {step === 'upload' && (
              <button
                type='button'
                onClick={handleScan}
                disabled={selectedFiles.length === 0 || !month}
                className='flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2 text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-300'
              >
                <Camera size={18} />
                สแกน
              </button>
            )}

            {step === 'review' && (
              <>
                <button
                  type='button'
                  onClick={handleRetake}
                  className='flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100'
                >
                  <RotateCcw size={16} />
                  {L.scanRetake}
                </button>
                <button
                  type='button'
                  onClick={handleSave}
                  disabled={isSaving || editedEntries.length === 0}
                  className='flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300'
                >
                  <Save size={18} />
                  {isSaving ? th.common.loading : L.scanSaveData}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
