import { useEffect, useMemo, useState } from 'react'
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
import { farmApi, type FarmHierarchyItem } from '../api/farm'
import {
  pondApi,
  type BulkImportFarmPondResponse,
  type BulkImportPondItem,
} from '../api/pond'
import {
  formatFarmDisplayNameTH,
  formatPondDisplayNameTH,
  normalizeFarmNameForStore,
  normalizePondNameForStore,
} from '../utils/masterDataName'
import { getApiErrorMessage } from '../utils/apiErrorMessage'

const L = th.adminMasterData

interface BulkImportFarmPondModalProps {
  isOpen: boolean
  onClose: () => void
  selectedClientId: string
  selectedClientName: string
  onImported?: () => void | Promise<void>
}

type Phase = 'initial' | 'preview' | 'success'

interface RowError {
  rowNumber: number
  message: string
}

interface GroupedPond {
  name: string
  area: number | null
  isExistingPond: boolean
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
  pondsToUpdate: number
  pondsUnchanged: number
}

interface ParseResult {
  rowErrors: RowError[]
  groupedFarms: GroupedFarm[]
  totals: ParseTotals
}

// Max pond rows accepted per file (template ships with 23 pre-filled rows; we allow plenty of headroom).
const MAX_ROWS = 5000

function computeTotals(grouped: GroupedFarm[]): ParseTotals {
  let farmsNew = 0
  let farmsExisting = 0
  let pondsNew = 0
  let pondsToUpdate = 0
  let pondsUnchanged = 0
  for (const g of grouped) {
    if (g.isExisting) farmsExisting++
    else farmsNew++
    for (const p of g.ponds) {
      if (!p.isExistingPond) pondsNew++
      else if (p.area !== null) pondsToUpdate++
      else pondsUnchanged++
    }
  }
  return { farmsNew, farmsExisting, pondsNew, pondsToUpdate, pondsUnchanged }
}

function parseAreaCell(raw: unknown): { value: number | null; ok: boolean } {
  if (raw === null || raw === undefined) return { value: null, ok: true }
  // Reject types Excel can return that aren't valid as area:
  //   - boolean (cell formatted as TRUE/FALSE)
  //   - Date (cell formatted as a date)
  // Without these guards, String(date)/String(bool) would slip through the
  // strip-non-numeric path and yield a misleading number.
  if (typeof raw === 'boolean') return { value: null, ok: false }
  if (raw instanceof Date) return { value: null, ok: false }
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw < 0) return { value: null, ok: false }
    return { value: raw, ok: true }
  }
  if (typeof raw !== 'string') return { value: null, ok: false }
  const str = raw.trim()
  if (str === '') return { value: null, ok: true }
  // Strip everything except digits, decimal point, and minus so "2.5 ไร่",
  // "2,500", or "2.5 rai" all parse.
  const cleaned = str.replace(/[^\d.-]/g, '')
  if (cleaned === '' || cleaned === '.' || cleaned === '-') {
    return { value: null, ok: false }
  }
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n < 0) return { value: null, ok: false }
  return { value: n, ok: true }
}

export function BulkImportFarmPondModal({
  isOpen,
  onClose,
  selectedClientId,
  selectedClientName,
  onImported,
}: BulkImportFarmPondModalProps) {
  const [phase, setPhase] = useState<Phase>('initial')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [rowErrorsExpanded, setRowErrorsExpanded] = useState(true)
  const [importResult, setImportResult] =
    useState<BulkImportFarmPondResponse | null>(null)
  // Modal owns its existing-data lookup so it doesn't depend on the parent
  // page having expanded the target farm. Refetched on every open and again
  // after a successful import.
  const [hierarchy, setHierarchy] = useState<FarmHierarchyItem[]>([])
  const [hierarchyLoading, setHierarchyLoading] = useState(false)
  const [hierarchyError, setHierarchyError] = useState<string | null>(null)

  const loadHierarchy = async () => {
    const id = Number(selectedClientId)
    if (!Number.isFinite(id) || id <= 0) return
    setHierarchyLoading(true)
    setHierarchyError(null)
    try {
      const data = await farmApi.getFarmHierarchy(id)
      setHierarchy(data ?? [])
    } catch (e) {
      setHierarchyError(getApiErrorMessage(e, L.bulkImportErrorLoadExisting))
      setHierarchy([])
    } finally {
      setHierarchyLoading(false)
    }
  }

  // Fetch fresh existing-pond data whenever the modal opens for a client.
  useEffect(() => {
    if (!isOpen) return
    void loadHierarchy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedClientId])

  const busy =
    parsing || submitting || downloadingTemplate || hierarchyLoading

  const hasImportable = useMemo(() => {
    if (!parseResult) return false
    const { pondsNew, pondsToUpdate } = parseResult.totals
    return pondsNew + pondsToUpdate > 0
  }, [parseResult])

  const resetState = () => {
    setPhase('initial')
    setSelectedFile(null)
    setParsing(false)
    setSubmitting(false)
    setDownloadingTemplate(false)
    setError(null)
    setParseResult(null)
    setRowErrorsExpanded(true)
    setImportResult(null)
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
    setRowErrorsExpanded(true)
  }

  const handleDownloadTemplate = async () => {
    if (busy) return
    setError(null)
    setDownloadingTemplate(true)
    try {
      await pondApi.downloadTemplate()
    } catch (e) {
      setError(getApiErrorMessage(e, L.bulkImportErrorDownloadTemplate))
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

      // Template layout (1 farm per file):
      //   Row 1: A='ชื่อฟาร์ม', B=<farm name>
      //   Row 2: A='บ่อที่', B='ชื่อบ่อ', C='ขนาดบ่อ (ไร่)'
      //   Row 3+: pond #, pond name, pond area
      if (aoa.length < 3) throw new Error(L.bulkImportErrorEmptyFile)
      if (aoa.length > MAX_ROWS + 2) {
        throw new Error(L.bulkImportErrorTooManyRows)
      }

      const row1 = aoa[0] ?? []
      const farmLabel = String(row1[0] ?? '').trim().toLowerCase()
      if (farmLabel !== 'ชื่อฟาร์ม' && farmLabel !== 'farm name') {
        throw new Error(L.bulkImportErrorBadHeaders)
      }
      // Accept string or finite number as farm name; reject Date/boolean/etc.
      const rawFarmCell = row1[1]
      const farmRaw =
        typeof rawFarmCell === 'string'
          ? rawFarmCell.trim()
          : typeof rawFarmCell === 'number' && Number.isFinite(rawFarmCell)
            ? String(rawFarmCell)
            : ''
      const farmName = normalizeFarmNameForStore(farmRaw)
      if (!farmName) throw new Error(L.bulkImportErrorMissingFarm)
      if (farmName.length > 100) {
        throw new Error(L.bulkImportErrorFarmTooLong)
      }

      const row2 = (aoa[1] ?? []).map((c) =>
        String(c ?? '').trim().toLowerCase(),
      )
      const pondIdx = row2.findIndex(
        (h) => h.includes('ชื่อบ่อ') || h.includes('pond name'),
      )
      if (pondIdx === -1) throw new Error(L.bulkImportErrorBadHeaders)
      const areaIdx = row2.findIndex(
        (h) => h.includes('ขนาด') || h.includes('area'),
      )

      const farmLc = farmName.toLowerCase()
      const matchedFarm = hierarchy.find(
        (f) => f.name.toLowerCase() === farmLc,
      )
      const isFarmExisting = !!matchedFarm
      const existingPondSet = new Set(
        (matchedFarm?.ponds ?? []).map((p) => p.name.toLowerCase()),
      )

      const rowErrors: RowError[] = []
      const ponds: GroupedPond[] = []
      // Map pondNameLc → first row number where it appeared, so we can
      // report "row X is a duplicate of row Y" instead of silently dropping.
      const seenInFileLc = new Map<string, number>()

      for (let i = 2; i < aoa.length; i++) {
        const r = aoa[i] ?? []
        const rawPondCell = r[pondIdx]
        const pondRaw =
          typeof rawPondCell === 'string'
            ? rawPondCell.trim()
            : typeof rawPondCell === 'number' && Number.isFinite(rawPondCell)
              ? String(rawPondCell)
              : ''
        const pondName = normalizePondNameForStore(pondRaw)
        const rowNumber = i + 1
        if (!pondName) {
          // Truly empty cells are skipped silently (template ships with
          // pre-filled row numbers in column A but blank ponds). If the user
          // typed *something* that normalized to empty (e.g. just "บ่อ ",
          // a boolean, or a date cell), flag it instead of dropping silently.
          const cellHasContent =
            rawPondCell !== undefined &&
            rawPondCell !== null &&
            String(rawPondCell).trim() !== ''
          if (cellHasContent) {
            rowErrors.push({
              rowNumber,
              message: L.bulkImportErrorMissingPond,
            })
          }
          continue
        }
        if (pondName.length > 100) {
          rowErrors.push({
            rowNumber,
            message: L.bulkImportErrorPondTooLong,
          })
          continue
        }
        let area: number | null = null
        if (areaIdx !== -1) {
          const parsed = parseAreaCell(r[areaIdx])
          if (!parsed.ok) {
            const badValue = String(r[areaIdx] ?? '').trim() || '—'
            rowErrors.push({
              rowNumber,
              message: L.bulkImportErrorInvalidArea(badValue),
            })
            continue
          }
          area = parsed.value
        }
        const pondLc = pondName.toLowerCase()
        const firstRow = seenInFileLc.get(pondLc)
        if (firstRow !== undefined) {
          rowErrors.push({
            rowNumber,
            message: L.bulkImportErrorDuplicatePond(
              formatPondDisplayNameTH(pondName),
              firstRow,
            ),
          })
          continue
        }
        seenInFileLc.set(pondLc, rowNumber)
        ponds.push({
          name: pondName,
          area,
          isExistingPond: existingPondSet.has(pondLc),
        })
      }

      const grouped: GroupedFarm[] = [
        {
          farmName,
          isExisting: isFarmExisting,
          ponds,
        },
      ]
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
      const payload = {
        farms: parseResult.groupedFarms.map((g) => ({
          name: g.farmName,
          ponds: g.ponds.map<BulkImportPondItem>((p) => ({
            name: p.name,
            area: p.area,
          })),
        })),
      }
      const result = (await pondApi.bulkImportFarmPond(
        Number(selectedClientId),
        payload,
      )) as BulkImportFarmPondResponse | undefined
      // The shared apiClient does not throw on `{result: false, error: {...}}`
      // (it only checks `success === false`), so we defensively verify the
      // response shape here. If the backend rejected the request we surface
      // the error instead of showing an empty success screen.
      if (
        !result ||
        typeof result.farmsCreated !== 'number' ||
        typeof result.pondsCreated !== 'number'
      ) {
        throw new Error(L.bulkImportErrorImportFailed)
      }
      setImportResult(result)
      setPhase('success')
      // Await the parent's refetch + our own hierarchy reload before the
      // user can dismiss the modal, so the panel underneath is guaranteed
      // to be up-to-date the moment they hit ปิด.
      await Promise.all([
        Promise.resolve(onImported?.()),
        loadHierarchy(),
      ])
    } catch (e) {
      setError(getApiErrorMessage(e, L.bulkImportErrorImportFailed))
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

              {hierarchyLoading && (
                <div className='mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600'>
                  <Loader2 size={16} className='animate-spin' aria-hidden />
                  {L.bulkImportLoadingExisting}
                </div>
              )}
              {hierarchyError && !hierarchyLoading && (
                <div className='mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3'>
                  <AlertCircle
                    size={18}
                    className='mt-0.5 shrink-0 text-amber-600'
                  />
                  <div className='flex-1 text-sm text-amber-900'>
                    <p>{hierarchyError}</p>
                    <button
                      type='button'
                      onClick={() => void loadHierarchy()}
                      className='mt-1 text-xs font-medium text-amber-800 underline hover:text-amber-900'
                    >
                      {L.bulkImportRetry}
                    </button>
                  </div>
                </div>
              )}

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
                  label={L.bulkImportStatPondsToUpdate}
                  value={parseResult.totals.pondsToUpdate}
                  tone='blue'
                />
              </div>

              {parseResult.totals.pondsUnchanged > 0 && (
                <p className='mb-3 text-xs text-gray-500'>
                  {L.bulkImportUnchangedHint(parseResult.totals.pondsUnchanged)}
                </p>
              )}

              {/* New farm notice (1 farm per file) */}
              {parseResult.totals.farmsNew > 0 &&
                parseResult.groupedFarms[0] && (
                  <div className='mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3'>
                    <Info
                      size={18}
                      className='mt-0.5 shrink-0 text-green-700'
                      aria-hidden
                    />
                    <p className='text-sm text-green-900'>
                      {L.bulkImportNewFarmNotice(
                        formatFarmDisplayNameTH(
                          parseResult.groupedFarms[0].farmName,
                        ),
                      )}
                    </p>
                  </div>
                )}

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
              {parseResult.groupedFarms.length === 0 ||
              parseResult.groupedFarms.every((g) => g.ponds.length === 0) ? (
                <div className='rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500'>
                  {L.bulkImportEmptyHint}
                </div>
              ) : (
                <ul className='space-y-3'>
                  {parseResult.groupedFarms.map((g, i) => (
                    <li
                      key={`${g.farmName}-${i}`}
                      className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'
                    >
                      {/* Farm header */}
                      <div className='flex items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 py-2.5'>
                        <div className='flex min-w-0 items-center gap-2'>
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              g.isExisting ? 'bg-gray-400' : 'bg-green-500'
                            }`}
                            aria-hidden
                          />
                          <span className='truncate text-sm font-semibold text-gray-800'>
                            {formatFarmDisplayNameTH(g.farmName)}
                          </span>
                          <span className='shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-gray-600'>
                            {g.ponds.length}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
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

                      {/* Pond list */}
                      {g.ponds.length === 0 ? (
                        <p className='px-4 py-2 text-xs text-gray-400'>
                          {L.bulkImportEmptyHint}
                        </p>
                      ) : (
                        <ul className='divide-y divide-gray-100'>
                          {g.ponds.map((p, j) => {
                            const willUpdate = p.isExistingPond && p.area !== null
                            const isUnchanged = p.isExistingPond && p.area === null
                            const dot = !p.isExistingPond
                              ? 'bg-green-500'
                              : willUpdate
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                            const badgeLabel = !p.isExistingPond
                              ? L.bulkImportBadgeNew
                              : willUpdate
                                ? L.bulkImportBadgeUpdate
                                : L.bulkImportBadgeUnchanged
                            const badgeClass = !p.isExistingPond
                              ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200'
                              : willUpdate
                                ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                                : 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200'
                            return (
                              <li
                                key={`${p.name}-${j}`}
                                className={`flex items-center justify-between gap-3 px-4 py-1 transition-colors hover:bg-gray-50 ${
                                  isUnchanged ? 'opacity-75' : ''
                                }`}
                              >
                                <div className='flex min-w-0 items-center gap-2'>
                                  <span className='w-6 shrink-0 text-right text-[11px] font-medium tabular-nums text-gray-400'>
                                    {j + 1}.
                                  </span>
                                  <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`}
                                    aria-hidden
                                  />
                                  <span className='truncate text-sm text-gray-800'>
                                    {formatPondDisplayNameTH(p.name)}
                                  </span>
                                </div>
                                <div className='flex shrink-0 items-center gap-1.5'>
                                  {p.area !== null && (
                                    <span className='rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] tabular-nums text-gray-700'>
                                      {p.area} {L.bulkImportAreaUnit}
                                    </span>
                                  )}
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}
                                  >
                                    {badgeLabel}
                                  </span>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}
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

          {phase === 'success' && importResult && (
            <div className='flex flex-col items-center gap-6 py-6 text-center'>
              {/* Hero checkmark with concentric glow */}
              <div className='relative flex h-28 w-28 items-center justify-center'>
                <span
                  className='absolute inset-0 animate-ping rounded-full bg-green-200 opacity-60'
                  aria-hidden
                />
                <span
                  className='absolute inset-2 rounded-full bg-green-100'
                  aria-hidden
                />
                <span className='relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30'>
                  <CheckCircle size={44} className='text-white' />
                </span>
              </div>

              <div>
                <h3 className='text-xl font-semibold text-gray-900'>
                  {L.bulkImportSuccessTitle}
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  {L.bulkImportSuccessSubtitle}
                </p>
              </div>

              {/* Result stat tiles */}
              <div className='grid w-full max-w-lg grid-cols-3 gap-3'>
                <ResultStatTile
                  label={L.bulkImportStatNewFarms}
                  value={importResult.farmsCreated}
                  tone='green'
                />
                <ResultStatTile
                  label={L.bulkImportStatNewPonds}
                  value={importResult.pondsCreated}
                  tone='green'
                />
                <ResultStatTile
                  label={L.bulkImportStatPondsToUpdate}
                  value={importResult.pondsUpdated}
                  tone='blue'
                />
              </div>
              {importResult.pondsUnchanged > 0 && (
                <p className='-mt-3 text-xs text-gray-500'>
                  {L.bulkImportUnchangedHint(importResult.pondsUnchanged)}
                </p>
              )}

              {/* Per-farm breakdown */}
              {importResult.farms.length > 0 && (
                <ul className='w-full max-w-lg space-y-2 text-left'>
                  {importResult.farms.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className='flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm'
                    >
                      <div className='flex min-w-0 items-center gap-2'>
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            f.isNew ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                          aria-hidden
                        />
                        <span className='truncate text-sm font-medium text-gray-800'>
                          {formatFarmDisplayNameTH(f.name)}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            f.isNew
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {f.isNew
                            ? L.bulkImportBadgeNew
                            : L.bulkImportBadgeExisting}
                        </span>
                      </div>
                      <div className='flex shrink-0 items-center gap-1.5 text-[11px] tabular-nums'>
                        {f.pondsCreated > 0 && (
                          <span className='rounded-md bg-green-50 px-2 py-0.5 text-green-700 ring-1 ring-inset ring-green-200'>
                            +{f.pondsCreated} {L.bulkImportBadgeNew}
                          </span>
                        )}
                        {f.pondsUpdated > 0 && (
                          <span className='rounded-md bg-blue-50 px-2 py-0.5 text-blue-700 ring-1 ring-inset ring-blue-200'>
                            ↻{f.pondsUpdated} {L.bulkImportBadgeUpdate}
                          </span>
                        )}
                        {f.pondsUnchanged > 0 && (
                          <span className='rounded-md bg-gray-50 px-2 py-0.5 text-gray-600 ring-1 ring-inset ring-gray-200'>
                            {f.pondsUnchanged} {L.bulkImportBadgeUnchanged}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className='flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600'>
                <Info size={12} className='shrink-0' aria-hidden />
                {L.bulkImportSuccessDisclaimer}
              </div>
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
  tone: 'green' | 'gray' | 'amber' | 'blue'
}) {
  const toneClasses =
    tone === 'green'
      ? 'border-green-200 bg-green-50 text-green-800'
      : tone === 'amber'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : tone === 'blue'
          ? 'border-blue-200 bg-blue-50 text-blue-800'
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

function ResultStatTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'green' | 'blue'
}) {
  const toneClasses =
    tone === 'green'
      ? 'from-green-50 to-emerald-50 border-green-200 text-green-700'
      : 'from-blue-50 to-sky-50 border-blue-200 text-blue-700'
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-xl border bg-gradient-to-br px-3 py-3 shadow-sm ${toneClasses}`}
    >
      <p className='text-3xl font-bold tabular-nums leading-none'>{value}</p>
      <p className='text-[11px] font-medium opacity-90'>{label}</p>
    </div>
  )
}
