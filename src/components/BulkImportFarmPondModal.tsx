import { useMemo, useState } from 'react'
import {
  X,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Loader2,
  Info,
  ArrowLeft,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { th } from '../locales/th'
import type { FarmResponse } from '../api/farm'
import { pondApi } from '../api/pond'

const L = th.adminMasterData

interface BulkImportFarmPondModalProps {
  isOpen: boolean
  onClose: () => void
  selectedClientId: string
  selectedClientName: string
  existingFarms: FarmResponse[]
  existingPondsByFarmName: Record<string, string[]>
}

type Phase = 'initial' | 'preview' | 'success'

interface ParsedRow {
  rowNumber: number
  farmName: string
  pondName: string
}

interface RowError {
  rowNumber: number
  message: string
}

interface GroupedPond {
  name: string
  isDuplicate: boolean
}

interface GroupedFarm {
  farmName: string
  isExisting: boolean
  ponds: GroupedPond[]
}

interface ParseTotals {
  farmsNew: number
  farmsExisting: number
  pondsNew: number
  pondsDuplicate: number
}

interface ParseResult {
  rowErrors: RowError[]
  groupedFarms: GroupedFarm[]
  totals: ParseTotals
}

const MAX_ROWS = 5000

function groupRows(
  rows: ParsedRow[],
  existingFarms: FarmResponse[],
  existingPondsByFarmName: Record<string, string[]>,
): GroupedFarm[] {
  const existingFarmNamesLc = new Set(
    existingFarms.map((f) => f.name.toLowerCase()),
  )
  const existingPondsByFarmLc: Record<string, Set<string>> = {}
  for (const [name, ponds] of Object.entries(existingPondsByFarmName)) {
    existingPondsByFarmLc[name.toLowerCase()] = new Set(
      ponds.map((p) => p.toLowerCase()),
    )
  }

  const map = new Map<string, GroupedFarm>()
  for (const row of rows) {
    const key = row.farmName.toLowerCase()
    let g = map.get(key)
    if (!g) {
      g = {
        farmName: row.farmName,
        isExisting: existingFarmNamesLc.has(key),
        ponds: [],
      }
      map.set(key, g)
    }
    const existingPondSet = existingPondsByFarmLc[key] ?? new Set<string>()
    const pondLc = row.pondName.toLowerCase()
    const alreadyInGroup = g.ponds.some((p) => p.name.toLowerCase() === pondLc)
    const isDuplicate = existingPondSet.has(pondLc) || alreadyInGroup
    g.ponds.push({ name: row.pondName, isDuplicate })
  }
  return [...map.values()]
}

function computeTotals(grouped: GroupedFarm[]): ParseTotals {
  let farmsNew = 0
  let farmsExisting = 0
  let pondsNew = 0
  let pondsDuplicate = 0
  for (const g of grouped) {
    if (g.isExisting) farmsExisting++
    else farmsNew++
    for (const p of g.ponds) {
      if (p.isDuplicate) pondsDuplicate++
      else pondsNew++
    }
  }
  return { farmsNew, farmsExisting, pondsNew, pondsDuplicate }
}

export function BulkImportFarmPondModal({
  isOpen,
  onClose,
  selectedClientId,
  selectedClientName,
  existingFarms,
  existingPondsByFarmName,
}: BulkImportFarmPondModalProps) {
  const [phase, setPhase] = useState<Phase>('initial')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [rowErrorsExpanded, setRowErrorsExpanded] = useState(false)

  const busy = parsing || submitting || downloadingTemplate

  const hasImportable = useMemo(
    () => (parseResult ? parseResult.totals.pondsNew > 0 : false),
    [parseResult],
  )

  const resetState = () => {
    setPhase('initial')
    setSelectedFile(null)
    setParsing(false)
    setSubmitting(false)
    setDownloadingTemplate(false)
    setError(null)
    setParseResult(null)
    setRowErrorsExpanded(false)
  }

  const handleClose = () => {
    if (busy) return
    resetState()
    onClose()
  }

  const handleBackToFile = () => {
    if (busy) return
    setPhase('initial')
    setSelectedFile(null)
    setParseResult(null)
    setError(null)
    setRowErrorsExpanded(false)
  }

  const handleDownloadTemplate = async () => {
    if (busy) return
    setError(null)
    setDownloadingTemplate(true)
    try {
      await pondApi.downloadTemplate()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : L.bulkImportErrorDownloadTemplate,
      )
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ''

    setError(null)
    const lower = file.name.toLowerCase()
    if (!lower.endsWith('.xlsx')) {
      setError(L.bulkImportErrorBadExtension)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    await handleParse(file)
  }

  const handleParse = async (file: File) => {
    setParsing(true)
    setError(null)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      if (!sheetName) throw new Error(L.bulkImportErrorEmptyFile)
      const sheet = wb.Sheets[sheetName]
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        blankrows: false,
        defval: '',
      })

      if (aoa.length === 0) throw new Error(L.bulkImportErrorEmptyFile)
      if (aoa.length > MAX_ROWS + 1) {
        throw new Error(L.bulkImportErrorTooManyRows)
      }

      const header = (aoa[0] ?? []).map((c) =>
        String(c ?? '').trim().toLowerCase(),
      )
      const farmIdx = header.findIndex(
        (h) => h === 'farm name' || h === 'ชื่อฟาร์ม',
      )
      const pondIdx = header.findIndex(
        (h) => h === 'pond name' || h === 'ชื่อบ่อ',
      )
      if (farmIdx === -1 || pondIdx === -1) {
        throw new Error(L.bulkImportErrorBadHeaders)
      }

      const rows: ParsedRow[] = []
      const rowErrors: RowError[] = []

      for (let i = 1; i < aoa.length; i++) {
        const r = aoa[i] ?? []
        const farmName = String(r[farmIdx] ?? '').trim()
        const pondName = String(r[pondIdx] ?? '').trim()
        const rowNumber = i + 1

        if (!farmName && !pondName) continue

        if (!farmName) {
          rowErrors.push({
            rowNumber,
            message: L.bulkImportErrorMissingFarm,
          })
          continue
        }
        if (!pondName) {
          rowErrors.push({
            rowNumber,
            message: L.bulkImportErrorMissingPond,
          })
          continue
        }
        if (farmName.length > 100) {
          rowErrors.push({
            rowNumber,
            message: L.bulkImportErrorFarmTooLong,
          })
          continue
        }
        if (pondName.length > 100) {
          rowErrors.push({
            rowNumber,
            message: L.bulkImportErrorPondTooLong,
          })
          continue
        }
        rows.push({ rowNumber, farmName, pondName })
      }

      const grouped = groupRows(rows, existingFarms, existingPondsByFarmName)
      const totals = computeTotals(grouped)
      setParseResult({ rowErrors, groupedFarms: grouped, totals })
      setPhase('preview')
    } catch (e) {
      setError(
        e instanceof Error ? e.message : L.bulkImportErrorParseFailed,
      )
      setSelectedFile(null)
    } finally {
      setParsing(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!parseResult) return
    setSubmitting(true)
    setError(null)
    try {
      // TODO(backend): replace with real bulk-create endpoint when ready.
      // Expected payload:
      // {
      //   clientId: Number(selectedClientId),
      //   farms: parseResult.groupedFarms.map(g => ({
      //     name: g.farmName,
      //     isExisting: g.isExisting,
      //     ponds: g.ponds.filter(p => !p.isDuplicate).map(p => p.name),
      //   })),
      // }
      console.group('[BulkImport] Stub submit — would POST to backend')
      console.log('clientId:', selectedClientId)
      console.log('totals:', parseResult.totals)
      console.log('groupedFarms:', parseResult.groupedFarms)
      console.groupEnd()
      await new Promise((r) => setTimeout(r, 400))
      setPhase('success')
    } catch (e) {
      setError(
        e instanceof Error ? e.message : L.bulkImportErrorImportFailed,
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-4 text-white'>
          <div className='flex min-w-0 items-center gap-3'>
            <FileSpreadsheet size={22} className='shrink-0' />
            <div className='min-w-0'>
              <h2 className='text-base font-semibold'>{L.bulkImportTitle}</h2>
              {selectedClientName && (
                <p className='truncate text-xs text-white/70'>
                  {L.bulkImportSubtitle(selectedClientName)}
                </p>
              )}
            </div>
          </div>
          <button
            type='button'
            disabled={busy}
            onClick={handleClose}
            className='rounded-lg p-1 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40'
            aria-label={L.modalClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto p-6'>
          {phase === 'initial' && (
            <>
              <div className='mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3'>
                <Info
                  size={18}
                  className='mt-0.5 shrink-0 text-blue-600'
                  aria-hidden
                />
                <p className='text-sm text-blue-900'>
                  {L.bulkImportInstructions}
                </p>
              </div>

              <div className='mb-5'>
                <button
                  type='button'
                  onClick={() => void handleDownloadTemplate()}
                  disabled={busy}
                  className='flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {downloadingTemplate ? (
                    <Loader2 size={16} className='animate-spin' aria-hidden />
                  ) : (
                    <Download size={16} />
                  )}
                  {L.bulkImportDownloadTemplate}
                </button>
              </div>

              <div className='mb-2'>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  {L.bulkImportUploadLabel}
                </label>
                <div
                  className={`rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors ${
                    busy
                      ? 'pointer-events-none opacity-60'
                      : 'hover:border-blue-500'
                  }`}
                >
                  <input
                    type='file'
                    accept='.xlsx'
                    onChange={(e) => void handleFileSelect(e)}
                    disabled={busy}
                    className='hidden'
                    id='bulk-import-farm-pond-input'
                  />
                  <label
                    htmlFor='bulk-import-farm-pond-input'
                    className={
                      busy ? 'cursor-not-allowed' : 'cursor-pointer'
                    }
                  >
                    {parsing ? (
                      <Loader2
                        size={40}
                        className='mx-auto mb-3 animate-spin text-blue-600'
                      />
                    ) : (
                      <Upload
                        size={40}
                        className='mx-auto mb-3 text-gray-400'
                      />
                    )}
                    <p className='mb-1 break-all text-gray-700'>
                      {parsing
                        ? L.bulkImportParsing
                        : selectedFile
                          ? selectedFile.name
                          : L.bulkImportClickToUpload}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {selectedFile && !parsing
                        ? L.bulkImportTapToChangeFile
                        : L.bulkImportFormatHint}
                    </p>
                  </label>
                </div>
              </div>

              {error && (
                <div className='mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4'>
                  <AlertCircle
                    size={18}
                    className='mt-0.5 shrink-0 text-red-600'
                  />
                  <p className='text-sm text-red-800'>{error}</p>
                </div>
              )}
            </>
          )}

          {phase === 'preview' && parseResult && (
            <>
              <h3 className='mb-3 text-sm font-semibold text-gray-800'>
                {L.bulkImportPreviewTitle}
              </h3>

              {/* Stats strip */}
              <div className='mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4'>
                <StatTile
                  label={L.bulkImportStatNewFarms}
                  value={parseResult.totals.farmsNew}
                  tone='green'
                />
                <StatTile
                  label={L.bulkImportStatExistingFarms}
                  value={parseResult.totals.farmsExisting}
                  tone='gray'
                />
                <StatTile
                  label={L.bulkImportStatNewPonds}
                  value={parseResult.totals.pondsNew}
                  tone='green'
                />
                <StatTile
                  label={L.bulkImportStatDuplicatePonds}
                  value={parseResult.totals.pondsDuplicate}
                  tone='amber'
                />
              </div>

              {/* Row errors */}
              {parseResult.rowErrors.length > 0 && (
                <div className='mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3'>
                  <button
                    type='button'
                    onClick={() => setRowErrorsExpanded((v) => !v)}
                    className='flex w-full items-start gap-2 text-left'
                  >
                    <AlertCircle
                      size={18}
                      className='mt-0.5 shrink-0 text-amber-600'
                    />
                    <span className='text-sm font-medium text-amber-900'>
                      {L.bulkImportRowErrorsTitle} (
                      {parseResult.rowErrors.length})
                    </span>
                  </button>
                  {rowErrorsExpanded && (
                    <ul className='mt-2 max-h-32 space-y-1 overflow-y-auto pl-7 text-xs text-amber-800'>
                      {parseResult.rowErrors.map((err, i) => (
                        <li key={i}>
                          {L.bulkImportRowErrorPrefix(err.rowNumber)}:{' '}
                          {err.message}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!rowErrorsExpanded && (
                    <p className='mt-1 pl-7 text-xs text-amber-700'>
                      {L.bulkImportRowErrorPrefix(
                        parseResult.rowErrors[0].rowNumber,
                      )}
                      : {parseResult.rowErrors[0].message}
                      {parseResult.rowErrors.length > 1 && ' ...'}
                    </p>
                  )}
                </div>
              )}

              {/* Grouped farms */}
              {parseResult.groupedFarms.length === 0 ? (
                <div className='rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500'>
                  {L.bulkImportEmptyHint}
                </div>
              ) : (
                <ul className='space-y-2'>
                  {parseResult.groupedFarms.map((g, i) => (
                    <li
                      key={`${g.farmName}-${i}`}
                      className='rounded-lg border border-gray-200 bg-white p-3'
                    >
                      <div className='flex items-center justify-between gap-2'>
                        <span className='break-all text-sm font-medium text-gray-800'>
                          {g.farmName}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                            g.isExisting
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {g.isExisting
                            ? L.bulkImportBadgeExisting
                            : L.bulkImportBadgeNew}
                        </span>
                      </div>
                      <ul className='mt-2 space-y-1 pl-2'>
                        {g.ponds.map((p, j) => (
                          <li
                            key={`${p.name}-${j}`}
                            className='flex items-center gap-2 text-xs'
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                p.isDuplicate ? 'bg-amber-400' : 'bg-green-500'
                              }`}
                              aria-hidden
                            />
                            <span
                              className={`break-all ${
                                p.isDuplicate
                                  ? 'text-amber-700 line-through'
                                  : 'text-gray-700'
                              }`}
                            >
                              {p.name}
                            </span>
                            {p.isDuplicate && (
                              <span className='shrink-0 text-[10px] font-medium uppercase tracking-wide text-amber-600'>
                                {L.bulkImportBadgeDuplicate}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}

              {error && (
                <div className='mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4'>
                  <AlertCircle
                    size={18}
                    className='mt-0.5 shrink-0 text-red-600'
                  />
                  <p className='text-sm text-red-800'>{error}</p>
                </div>
              )}
            </>
          )}

          {phase === 'success' && parseResult && (
            <div className='flex flex-col items-center justify-center gap-4 py-8 text-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                <CheckCircle size={36} className='text-green-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800'>
                {L.bulkImportSuccessTitle}
              </h3>
              <p className='text-sm text-gray-700'>
                {L.bulkImportSuccessSummary(
                  parseResult.totals.farmsNew,
                  parseResult.totals.pondsNew,
                )}
              </p>
              <p className='max-w-md text-xs text-gray-500'>
                {L.bulkImportSuccessDisclaimer}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4'>
          {phase === 'initial' && (
            <button
              type='button'
              disabled={busy}
              onClick={handleClose}
              className='rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {L.modalCancel}
            </button>
          )}

          {phase === 'preview' && (
            <>
              <button
                type='button'
                disabled={busy}
                onClick={handleBackToFile}
                className='flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <ArrowLeft size={14} />
                {L.bulkImportPreviewBack}
              </button>
              <button
                type='button'
                disabled={busy}
                onClick={handleClose}
                className='rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {L.modalCancel}
              </button>
              <button
                type='button'
                onClick={() => void handleConfirmImport()}
                disabled={!hasImportable || busy}
                title={!hasImportable ? L.bulkImportEmptyHint : undefined}
                className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:hover:shadow-none'
              >
                {submitting ? (
                  <Loader2 size={16} className='animate-spin' aria-hidden />
                ) : (
                  <CheckCircle size={16} aria-hidden />
                )}
                {submitting
                  ? L.bulkImportSubmitting
                  : L.bulkImportConfirm}
              </button>
            </>
          )}

          {phase === 'success' && (
            <button
              type='button'
              onClick={handleClose}
              className='rounded-lg bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-lg'
            >
              {L.modalClose}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'green' | 'gray' | 'amber'
}) {
  const toneClasses =
    tone === 'green'
      ? 'border-green-200 bg-green-50 text-green-800'
      : tone === 'amber'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-gray-200 bg-gray-50 text-gray-700'
  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClasses}`}>
      <p className='text-[11px] font-medium uppercase tracking-wide opacity-80'>
        {label}
      </p>
      <p className='text-xl font-semibold tabular-nums'>{value}</p>
    </div>
  )
}
