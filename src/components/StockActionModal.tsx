import {
  X,
  Fish,
  Package,
  Weight,
  ArrowRight,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Loader2,
  Check,
  ArrowLeft,
} from 'lucide-react'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mockPonds } from '../data/mockData'
import type { Pond } from '../data/mockData'
import { FISH_TYPE_VALUES } from '../constants/fishType'
import { th } from '../locales/th'
import { pondApi } from '../api/pond'
import type {
  PondFillPreviewResponse,
  PondMovePreviewResponse,
  PondSellPreviewResponse,
} from '../api/pond'
import { merchantApi } from '../api/merchant'
import { fishSizeGradeApi } from '../api/fishSizeGrade'
import type { DropdownItem } from '../api/fishSizeGrade'
import { pondKeys } from '../hooks/usePond'
import { formatPondDisplayNameTH } from '../utils/masterDataName'
import { DatePicker } from './DatePicker'

const L = th.stockActionModal
const fishTypeLabels = th.fishType

type ActionType = 'add' | 'transfer' | 'sell'

export interface StockActionModalPond {
  id: string | number
  name: string
  code?: string
  farmId?: number | string
  farmName?: string
  status?: string
  currentStock?: number
  species?: string[]
}

interface AdditionalCost {
  id: string
  category: string
  cost: number
}

interface SellGradeRow {
  id: string
  gradeId: number
  weight: number
  pricePerKg: number
  fishCount?: number
}

interface StockActionModalProps {
  pond: StockActionModalPond | null
  isOpen: boolean
  onClose: () => void
  availablePonds?: StockActionModalPond[]
  initialActionType?: ActionType
  onFillSuccess?: () => void
}

export function StockActionModal({
  pond: pondProp,
  isOpen,
  onClose,
  availablePonds,
  initialActionType = 'add',
  onFillSuccess,
}: StockActionModalProps) {
  // FIXME: Move (transfer) and sell mode should receive data from API (e.g. available ponds, sell options).
  const [actionType, setActionType] = useState<ActionType>(initialActionType)
  const [quantity, setQuantity] = useState<number>(0)
  const [avgWeight, setAvgWeight] = useState<string | null>(null)
  const [pricePerUnit, setPricePerUnit] = useState<string | null>(null)

  const avgWeightNum =
    avgWeight === null || avgWeight === '' ? null : parseFloat(avgWeight)
  const pricePerUnitNum =
    pricePerUnit === null || pricePerUnit === ''
      ? null
      : parseFloat(pricePerUnit)
  const [selectedSpecies, setSelectedSpecies] = useState<string>('')
  const [destinationPondId, setDestinationPondId] = useState<string>('')
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([])
  const [sellGradeRows, setSellGradeRows] = useState<SellGradeRow[]>([])
  const [buyer, setBuyer] = useState<string>('')
  const [closePond, setClosePond] = useState<boolean>(false)
  const [activityDate, setActivityDate] = useState<string>(
    () => new Date().toISOString().split('T')[0],
  )
  const [notes, setNotes] = useState<string>('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [previewResult, setPreviewResult] = useState<
    | PondFillPreviewResponse
    | PondMovePreviewResponse
    | PondSellPreviewResponse
    | null
  >(null)

  const V = L.validation

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null)
      setFieldErrors({})
    }
  }, [isOpen])

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const pond = useMemo(():
    | (StockActionModalPond & {
        currentStock: number
        species: string[]
        code: string
      })
    | null => {
    if (!pondProp) return null
    return {
      ...pondProp,
      currentStock: pondProp.currentStock ?? 0,
      species: pondProp.species ?? [],
      code: pondProp.code ?? '',
    }
  }, [pondProp])

  const validateAddForm = useCallback((): Record<string, string> => {
    const err: Record<string, string> = {}
    if (!selectedSpecies?.trim()) err.species = V.selectSpecies
    const q = quantity
    if (typeof q !== 'number' || Number.isNaN(q)) err.quantity = V.mustBeNumber
    else if (!Number.isInteger(q) || q < 1) err.quantity = V.quantityMin
    if (avgWeight != null && avgWeight !== '') {
      const aw = parseFloat(avgWeight)
      if (Number.isNaN(aw) || aw < 0) err.avgWeight = V.mustBeZeroOrMore
    }
    const p = pricePerUnitNum
    if (p == null || Number.isNaN(p)) err.pricePerUnit = V.mustBeNumber
    else if (p <= 0) err.pricePerUnit = V.invalidPrice
    if (!activityDate?.trim()) err.activityDate = V.invalidDate
    additionalCosts.forEach((c) => {
      if (
        c.category.trim() &&
        (typeof c.cost !== 'number' || Number.isNaN(c.cost) || c.cost < 0)
      )
        err[`cost_${c.id}`] = V.additionalCostInvalid
      if (c.cost > 0 && !c.category.trim())
        err[`category_${c.id}`] = V.additionalCostCategoryRequired
    })
    return err
  }, [
    V,
    selectedSpecies,
    quantity,
    avgWeight,
    pricePerUnitNum,
    activityDate,
    additionalCosts,
  ])

  const validateTransferForm = useCallback((): Record<string, string> => {
    const err: Record<string, string> = {}
    if (!selectedSpecies?.trim()) err.species = V.selectSpecies
    const q = quantity
    if (typeof q !== 'number' || Number.isNaN(q)) err.quantity = V.mustBeNumber
    else if (!Number.isInteger(q) || q < 1) err.quantity = V.quantityMin
    else if (pond && q > pond.currentStock)
      err.quantity = V.quantityExceedsStock(pond.currentStock)
    if (avgWeight == null || avgWeight === '')
      err.avgWeight = V.mustBeZeroOrMore
    else {
      const aw = parseFloat(avgWeight)
      if (Number.isNaN(aw) || aw <= 0) err.avgWeight = V.mustBeZeroOrMore
    }
    const p = pricePerUnitNum
    if (p == null || Number.isNaN(p)) err.pricePerUnit = V.mustBeNumber
    else if (p <= 0) err.pricePerUnit = V.invalidPrice
    if (!destinationPondId) err.destinationPondId = V.selectDestinationPond
    if (!activityDate?.trim()) err.activityDate = V.invalidDate
    additionalCosts.forEach((c) => {
      if (
        c.category.trim() &&
        (typeof c.cost !== 'number' || Number.isNaN(c.cost) || c.cost < 0)
      )
        err[`cost_${c.id}`] = V.additionalCostInvalid
    })
    return err
  }, [
    V,
    selectedSpecies,
    quantity,
    avgWeight,
    pricePerUnitNum,
    activityDate,
    destinationPondId,
    additionalCosts,
    pond,
  ])

  const validateSellForm = useCallback((): Record<string, string> => {
    const err: Record<string, string> = {}
    if (sellGradeRows.length === 0) err.sellGradeRows = V.requiredSelect
    if (!buyer || buyer.trim() === '') err.buyer = V.requiredSelect
    sellGradeRows.forEach((row) => {
      if (!row.gradeId) err[`sell_g_${row.id}`] = V.requiredSelect
      if (
        typeof row.weight !== 'number' ||
        Number.isNaN(row.weight) ||
        row.weight <= 0
      )
        err[`sell_w_${row.id}`] = V.sellWeightInvalid
      if (
        typeof row.pricePerKg !== 'number' ||
        Number.isNaN(row.pricePerKg) ||
        row.pricePerKg <= 0
      )
        err[`sell_p_${row.id}`] = V.sellPriceInvalid
    })
    additionalCosts.forEach((c) => {
      if (
        c.category.trim() &&
        (typeof c.cost !== 'number' || Number.isNaN(c.cost) || c.cost < 0)
      )
        err[`cost_${c.id}`] = V.additionalCostInvalid
      if (c.cost > 0 && !c.category.trim())
        err[`category_${c.id}`] = V.additionalCostCategoryRequired
    })
    return err
  }, [V, buyer, sellGradeRows, additionalCosts])

  const isMaintenanceBlocked =
    (actionType === 'transfer' || actionType === 'sell') &&
    pond?.status === 'maintenance'

  const sourcePondId = pond ? Number(pond.id) : 0
  const farmId = pond ? Number(pond.farmId ?? 0) : 0
  const { data: sourcePondFromApi } = useQuery({
    queryKey: pondKeys.detail(sourcePondId),
    queryFn: () => pondApi.getPond(sourcePondId),
    enabled: isOpen && actionType === 'transfer' && sourcePondId > 0,
    staleTime: 2 * 60 * 1000,
  })

  const { data: pondListByFarmId } = useQuery({
    queryKey: pondKeys.list(farmId),
    queryFn: () => pondApi.getPondList(farmId),
    enabled: isOpen && actionType === 'transfer' && farmId > 0,
    staleTime: 2 * 60 * 1000,
  })

  const speciesOptions = useMemo(() => {
    if (actionType === 'transfer') {
      return sourcePondFromApi?.fishTypes ?? []
    }
    return FISH_TYPE_VALUES
  }, [actionType, sourcePondFromApi?.fishTypes])

  const { data: merchants = [] } = useQuery({
    queryKey: ['merchants'],
    queryFn: () => merchantApi.getMerchantList(),
    enabled: isOpen && actionType === 'sell',
    staleTime: 2 * 60 * 1000,
  })

  const { data: fishSizeGrades = [] } = useQuery<DropdownItem[]>({
    queryKey: ['fishSizeGrades'],
    queryFn: () => fishSizeGradeApi.getDropdown(),
    enabled: isOpen && actionType === 'sell',
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (actionType === 'sell' && isOpen && merchants.length > 0 && !buyer) {
      setBuyer(String(merchants[0].id))
    }
  }, [actionType, isOpen, merchants, buyer])

  const mockPondsNormalized = useMemo(
    (): StockActionModalPond[] =>
      mockPonds.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        farmName: p.farmName,
        status: p.status,
        currentStock: p.currentStock,
        species: (p as Pond & { species?: string[] }).species ?? [],
      })),
    [],
  )

  const availablePondsForTransfer = useMemo(() => {
    if (actionType === 'transfer' && pondListByFarmId?.length != null && pond) {
      return pondListByFarmId
        .filter((p) => String(p.id) !== String(pond.id))
        .map((p) => ({
          id: p.id,
          name: p.name,
          code: p.name,
          farmName: pond.farmName,
          status: p.status,
          currentStock: p.totalFish ?? 0,
          species: p.fishTypes ?? [],
        }))
    }
    const list = availablePonds ?? mockPondsNormalized
    if (!pond) return list
    return list.filter(
      (p) =>
        String(p.id) !== String(pond.id) &&
        (p.status === 'active' || p.status === undefined),
    )
  }, [actionType, pond, pondListByFarmId, availablePonds, mockPondsNormalized])

  const destinationPond = useMemo(() => {
    if (!destinationPondId) return null
    return (
      availablePondsForTransfer.find(
        (p) => String(p.id) === destinationPondId,
      ) ?? null
    )
  }, [destinationPondId, availablePondsForTransfer])

  const totalCost = quantity * (pricePerUnitNum ?? 0) * (avgWeightNum ?? 0)
  const totalWeight = quantity * (avgWeightNum ?? 0)

  const remainingStock = useMemo(() => {
    if (!pond) return 0
    if (actionType === 'add') {
      return pond.currentStock + quantity
    }
    return pond.currentStock - quantity
  }, [actionType, pond, quantity])

  const stockPercentage = useMemo(() => {
    if (!pond || pond.currentStock === 0) return 0
    return (quantity / pond.currentStock) * 100
  }, [quantity, pond])

  const sellTotals = useMemo(() => {
    const totalWeight = sellGradeRows.reduce(
      (sum, row) => sum + (row.weight || 0),
      0,
    )
    const totalRevenue = sellGradeRows.reduce(
      (sum, row) => sum + (row.weight || 0) * (row.pricePerKg || 0),
      0,
    )
    return { totalWeight, totalRevenue }
  }, [sellGradeRows])

  const showWarning =
    (actionType === 'transfer' || actionType === 'sell') && stockPercentage > 50

  // Re-run when form fields change so submit button enables only when valid
  const isFormValid = useMemo(() => {
    if (actionType === 'add') return Object.keys(validateAddForm()).length === 0
    if (actionType === 'transfer')
      return Object.keys(validateTransferForm()).length === 0
    if (actionType === 'sell')
      return Object.keys(validateSellForm()).length === 0
    return false
  }, [actionType, validateAddForm, validateTransferForm, validateSellForm])

  if (!isOpen || !pond) return null

  const buildFillBody = () => ({
    fishType: selectedSpecies,
    amount: quantity,
    pricePerUnit: pricePerUnitNum!,
    activityDate,
    ...(avgWeightNum != null &&
      avgWeightNum > 0 && { fishWeight: avgWeightNum }),
    ...(additionalCosts.length > 0 && {
      additionalCosts: additionalCosts
        .filter((c) => c.category.trim() !== '' || c.cost > 0)
        .map((c) => ({ title: c.category, cost: c.cost })),
    }),
    ...(notes.trim() && { remark: notes.trim() }),
  })

  const buildMoveBody = () => ({
    toPondId: Number(destinationPondId),
    fishType: selectedSpecies,
    amount: quantity,
    pricePerUnit: pricePerUnitNum!,
    activityDate,
    isClose: closePond,
    ...(avgWeightNum != null &&
      avgWeightNum >= 0 && { fishWeight: avgWeightNum }),
    ...(additionalCosts.length > 0 && {
      additionalCosts: additionalCosts
        .filter((c) => c.category.trim() !== '' || c.cost > 0)
        .map((c) => ({ title: c.category, cost: c.cost })),
    }),
    ...(notes.trim() && { remark: notes.trim() }),
  })

  const buildSellBody = () => {
    const details = sellGradeRows
      .filter((row) => row.gradeId > 0 && row.weight > 0)
      .map((row) => ({
        fishSizeGradeId: row.gradeId,
        weight: row.weight,
        pricePerUnit: row.pricePerKg,
        ...(row.fishCount != null &&
          Number.isInteger(row.fishCount) &&
          row.fishCount > 0 && { fishCount: row.fishCount }),
      }))
    return {
      activityDate,
      details,
      markToClose: closePond,
      ...(buyer ? { merchantId: Number(buyer) } : {}),
      ...(additionalCosts.length > 0 && {
        additionalCosts: additionalCosts
          .filter((c) => c.category.trim() !== '' || c.cost > 0)
          .map((c) => ({ title: c.category, cost: c.cost })),
      }),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (actionType === 'add') {
      const addErrors = validateAddForm()
      if (Object.keys(addErrors).length > 0) {
        setFieldErrors(addErrors)
        return
      }
      setFieldErrors({})
      setIsSubmitting(true)
      try {
        const body = buildFillBody()
        const preview = await pondApi.fillPondPreview(Number(pond.id), body)
        setPreviewResult(preview)
        setShowConfirmation(true)
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : L.previewError)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (actionType === 'transfer') {
      const transferErrors = validateTransferForm()
      if (Object.keys(transferErrors).length > 0) {
        setFieldErrors(transferErrors)
        return
      }
      setFieldErrors({})
      setIsSubmitting(true)
      try {
        const body = buildMoveBody()
        const preview = await pondApi.movePondPreview(Number(pond.id), body)
        setPreviewResult(preview)
        setShowConfirmation(true)
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : L.previewError)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (actionType === 'sell') {
      const sellErrors = validateSellForm()
      if (Object.keys(sellErrors).length > 0) {
        setFieldErrors(sellErrors)
        return
      }
      setFieldErrors({})
      const sellBody = buildSellBody()
      if (sellBody.details.length === 0) {
        setFieldErrors({ sellGradeRows: V.sellWeightInvalid })
        return
      }
      setIsSubmitting(true)
      try {
        const preview = await pondApi.sellPondPreview(Number(pond.id), sellBody)
        setPreviewResult(preview)
        setShowConfirmation(true)
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : L.previewError)
      } finally {
        setIsSubmitting(false)
      }
      return
    }
  }

  const handleConfirmedSubmit = async () => {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      if (actionType === 'add') {
        await pondApi.fillPond(Number(pond.id), buildFillBody())
      } else if (actionType === 'transfer') {
        await pondApi.movePond(Number(pond.id), buildMoveBody())
      } else if (actionType === 'sell') {
        await pondApi.sellPond(Number(pond.id), buildSellBody())
      }
      resetForm()
      onClose()
      onFillSuccess?.()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setQuantity(0)
    setAvgWeight(null)
    setPricePerUnit(null)
    setSelectedSpecies('')
    setDestinationPondId('')
    setAdditionalCosts([])
    setSellGradeRows([])
    setBuyer('')
    setClosePond(false)
    setActivityDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setSubmitError(null)
    setFieldErrors({})
    setShowConfirmation(false)
    setPreviewResult(null)
  }

  const handleActionTypeChange = (type: ActionType) => {
    setActionType(type)
    resetForm()
  }

  const getReviewButtonLabel = () => {
    switch (actionType) {
      case 'add':
        return L.reviewAndAddStock
      case 'transfer':
        return L.reviewAndConfirmTransfer
      case 'sell':
        return L.reviewAndConfirmSale
    }
  }

  const getConfirmButtonLabel = () => {
    switch (actionType) {
      case 'add':
        return L.confirmSubmitAddStock
      case 'transfer':
        return L.confirmSubmitTransfer
      case 'sell':
        return L.confirmSubmitSale
    }
  }

  const getButtonColor = () => {
    switch (actionType) {
      case 'add':
        return 'from-green-700 to-green-600 hover:shadow-green-200'
      case 'transfer':
        return 'from-blue-800 to-blue-600 hover:shadow-blue-200'
      case 'sell':
        return 'from-purple-700 to-purple-600 hover:shadow-purple-200'
    }
  }

  const handleAddAdditionalCost = () => {
    const newCost: AdditionalCost = {
      id: `cost-${additionalCosts.length + 1}`,
      category: '',
      cost: 0,
    }
    setAdditionalCosts([...additionalCosts, newCost])
  }

  const handleRemoveAdditionalCost = (id: string) => {
    setAdditionalCosts(additionalCosts.filter((cost) => cost.id !== id))
  }

  const handleAdditionalCostChange = (
    id: string,
    field: 'category' | 'cost',
    value: string,
  ) => {
    setAdditionalCosts(
      additionalCosts.map((cost) =>
        cost.id === id
          ? {
              ...cost,
              [field]: field === 'cost' ? parseFloat(value) || 0 : value,
            }
          : cost,
      ),
    )
  }

  const handleAddSellGradeRow = () => {
    const usedGradeIds = new Set(sellGradeRows.map((r) => r.gradeId))
    const nextGrade = fishSizeGrades.find((g) => !usedGradeIds.has(g.key))
    if (!nextGrade && fishSizeGrades.length > 0) return
    const newRow: SellGradeRow = {
      id: `grade-${Date.now()}`,
      gradeId: nextGrade?.key ?? 0,
      weight: 0,
      pricePerKg: 0,
    }
    setSellGradeRows([...sellGradeRows, newRow])
  }

  const handleRemoveSellGradeRow = (rowId: string) => {
    setSellGradeRows(sellGradeRows.filter((r) => r.id !== rowId))
  }

  const handleSellGradeRowChange = (
    rowId: string,
    field: 'gradeId' | 'weight' | 'pricePerKg' | 'fishCount',
    value: string,
  ) => {
    setSellGradeRows(
      sellGradeRows.map((row) => {
        if (row.id !== rowId) return row
        if (field === 'fishCount') {
          const n = value === '' ? undefined : parseInt(value, 10)
          return {
            ...row,
            fishCount:
              n !== undefined && !Number.isNaN(n) && n >= 0 ? n : undefined,
          }
        }
        return {
          ...row,
          [field]:
            field === 'gradeId'
              ? parseInt(value, 10) || 0
              : parseFloat(value) || 0,
        }
      }),
    )
  }

  const destinationCurrentStock = (destinationPond?.currentStock ?? 0) as number

  return (
    <>
      <div
        className='fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity'
        onClick={onClose}
        aria-hidden
      />
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div
          className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all'
          role='dialog'
          aria-modal='true'
          aria-labelledby='stock-action-modal-title'
        >
          <div className='px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10'>
            <div className='flex items-center justify-between'>
              <div>
                <h2
                  id='stock-action-modal-title'
                  className='text-xl font-semibold text-gray-900'
                >
                  {L.title}
                </h2>
                <p className='text-sm text-gray-600 mt-1'>
                  <span className='font-medium text-blue-600'>{pond.name}</span>
                </p>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                aria-label={L.ariaClose}
              >
                <X size={20} className='text-gray-500' />
              </button>
            </div>
            <div className='mt-5 grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg'>
              <button
                type='button'
                disabled={showConfirmation}
                onClick={() => handleActionTypeChange('add')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === 'add'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp size={16} />
                {L.addStock}
              </button>
              <button
                type='button'
                disabled={showConfirmation}
                onClick={() => handleActionTypeChange('transfer')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === 'transfer'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowRight size={16} />
                {L.transfer}
              </button>
              <button
                type='button'
                disabled={showConfirmation}
                onClick={() => handleActionTypeChange('sell')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === 'sell'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShoppingCart size={16} />
                {L.sellStock}
              </button>
            </div>
          </div>
          {showConfirmation && previewResult ? (
            <ConfirmationView
              actionType={actionType}
              pond={pond}
              previewResult={previewResult}
              destinationPond={destinationPond}
              activityDate={activityDate}
              closePond={closePond}
              notes={notes}
              buyer={buyer}
              merchants={merchants}
              submitError={submitError}
              isSubmitting={isSubmitting}
              onBack={() => {
                setShowConfirmation(false)
                setSubmitError(null)
              }}
              onConfirm={handleConfirmedSubmit}
              getConfirmButtonLabel={getConfirmButtonLabel}
              getButtonColor={getButtonColor}
            />
          ) : (
            <form onSubmit={handleSubmit} className='p-6 space-y-5'>
              {isMaintenanceBlocked ? (
                <div className='flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800'>
                  <AlertTriangle size={24} className='shrink-0' />
                  <p className='font-medium'>{L.cannotMoveOrSellMaintenance}</p>
                </div>
              ) : (
                <>
                  {actionType !== 'transfer' && (
                    <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-blue-600 rounded-lg'>
                            <Fish size={20} className='text-white' />
                          </div>
                          <div>
                            <p className='text-xs text-blue-700 font-medium'>
                              {L.currentStock}
                            </p>
                            <p className='text-xl font-bold text-blue-900'>
                              {pond.currentStock.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-xs text-blue-700 font-medium'>
                            {L.speciesAvailable}
                          </p>
                          <div className='flex gap-1 mt-1 justify-end'>
                            {pond.species.length > 0 ? (
                              pond.species.map((species, index) => (
                                <span
                                  key={index}
                                  className='text-xs px-2 py-1 bg-white text-blue-700 rounded border border-blue-200 font-medium'
                                >
                                  {fishTypeLabels[
                                    species as keyof typeof fishTypeLabels
                                  ] ?? species}
                                </span>
                              ))
                            ) : (
                              <span className='text-xs text-gray-500'>—</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {actionType === 'transfer' && (
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200'>
                        <div className='flex items-center gap-3 mb-3'>
                          <div className='p-2 bg-blue-600 rounded-lg'>
                            <Fish size={20} className='text-white' />
                          </div>
                          <div>
                            <p className='text-xs text-blue-700 font-medium'>
                              Source Pond
                            </p>
                            <p className='text-sm font-semibold text-blue-900'>
                              {pond.name}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className='text-xs text-blue-700 font-medium mb-2'>
                            {L.currentStock}
                          </p>
                          {quantity > 0 ? (
                            <div className='flex items-center gap-2'>
                              <p className='text-2xl font-bold text-blue-900'>
                                {pond.currentStock.toLocaleString()}
                              </p>
                              <ArrowRight
                                size={20}
                                className='text-blue-600 flex-shrink-0'
                              />
                              <p className='text-2xl font-bold text-blue-600'>
                                {remainingStock.toLocaleString()}
                              </p>
                            </div>
                          ) : (
                            <p className='text-2xl font-bold text-blue-900'>
                              {pond.currentStock.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className={`rounded-lg p-4 border ${
                          destinationPond
                            ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200'
                            : 'bg-gray-50 border-gray-200 border-dashed'
                        }`}
                      >
                        {destinationPond ? (
                          <>
                            <div className='flex items-center gap-3 mb-3'>
                              <div className='p-2 bg-green-600 rounded-lg'>
                                <Fish size={20} className='text-white' />
                              </div>
                              <div>
                                <p className='text-xs text-green-700 font-medium'>
                                  {L.destinationPond}
                                </p>
                                <p className='text-sm font-semibold text-green-900'>
                                  {destinationPond.name}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className='text-xs text-green-700 font-medium mb-2'>
                                {L.currentStock}
                              </p>
                              {quantity > 0 ? (
                                <div className='flex items-center gap-2'>
                                  <p className='text-2xl font-bold text-green-900'>
                                    {destinationCurrentStock.toLocaleString()}
                                  </p>
                                  <ArrowRight
                                    size={20}
                                    className='text-green-600 flex-shrink-0'
                                  />
                                  <p className='text-2xl font-bold text-green-600'>
                                    {(
                                      destinationCurrentStock + quantity
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              ) : (
                                <p className='text-2xl font-bold text-green-900'>
                                  {destinationCurrentStock.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className='flex items-center justify-center h-full'>
                            <p className='text-sm text-gray-500'>
                              {L.selectDestinationPond}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {actionType !== 'sell' && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        {L.species} *
                      </label>
                      <select
                        value={selectedSpecies}
                        onChange={(e) => {
                          setSelectedSpecies(e.target.value)
                          clearFieldError('species')
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                          fieldErrors.species
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value=''>
                          {actionType === 'transfer' &&
                          speciesOptions.length === 0
                            ? L.noSpeciesInSource
                            : L.selectSpecies}
                        </option>
                        {speciesOptions.map((value) => (
                          <option key={value} value={value}>
                            {fishTypeLabels[
                              value as keyof typeof fishTypeLabels
                            ] ?? value}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.species && (
                        <p className='text-sm text-red-600 mt-1' role='alert'>
                          {fieldErrors.species}
                        </p>
                      )}
                    </div>
                  )}

                  {actionType !== 'sell' && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        {L.quantityAddUnit} *
                      </label>
                      <div className='relative'>
                        <Package
                          size={18}
                          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                        />
                        <input
                          type='number'
                          placeholder={L.enterQuantity}
                          min='1'
                          max={
                            actionType !== 'add' ? pond.currentStock : undefined
                          }
                          value={quantity || ''}
                          onChange={(e) => {
                            const v = e.target.value
                            const n = v === '' ? 0 : parseInt(v, 10)
                            if (v !== '' && Number.isNaN(n)) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                quantity: V.mustBeNumber,
                              }))
                              setQuantity(0)
                            } else {
                              setQuantity(Number.isNaN(n) ? 0 : n)
                              clearFieldError('quantity')
                            }
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                            fieldErrors.quantity
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          required
                        />
                      </div>
                      {fieldErrors.quantity && (
                        <p className='text-sm text-red-600 mt-1' role='alert'>
                          {fieldErrors.quantity}
                        </p>
                      )}
                      {!fieldErrors.quantity &&
                        actionType !== 'add' &&
                        quantity > pond.currentStock && (
                          <p className='text-sm text-red-600 mt-1'>
                            {L.quantityExceeds}
                            {pond.currentStock.toLocaleString()})
                          </p>
                        )}
                    </div>
                  )}

                  {actionType === 'transfer' && (
                    <>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            {L.fromPond}
                          </label>
                          <input
                            type='text'
                            value={pond.name}
                            readOnly
                            disabled
                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            {L.toPond} *
                          </label>
                          <select
                            value={destinationPondId}
                            onChange={(e) => {
                              setDestinationPondId(e.target.value)
                              clearFieldError('destinationPondId')
                            }}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                              fieldErrors.destinationPondId
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          >
                            <option value=''>
                              {L.selectDestinationPondOption}
                            </option>
                            {availablePondsForTransfer.map((p) => (
                              <option key={String(p.id)} value={String(p.id)}>
                                {formatPondDisplayNameTH(p.name)}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.destinationPondId && (
                            <p
                              className='text-sm text-red-600 mt-1'
                              role='alert'
                            >
                              {fieldErrors.destinationPondId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {L.avgWeightKg} *
                        </label>
                        <div className='relative'>
                          <Weight
                            size={18}
                            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                          />
                          <input
                            type='number'
                            placeholder='0.00'
                            step='0.01'
                            min='0'
                            value={avgWeight ?? ''}
                            onChange={(e) => {
                              setAvgWeight(
                                e.target.value === '' ? null : e.target.value,
                              )
                              clearFieldError('avgWeight')
                            }}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                              fieldErrors.avgWeight
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          />
                        </div>
                        {fieldErrors.avgWeight && (
                          <p className='text-sm text-red-600 mt-1' role='alert'>
                            {fieldErrors.avgWeight}
                          </p>
                        )}
                        {(avgWeightNum ?? 0) > 0 && quantity > 0 && (
                          <p className='text-sm text-gray-600 mt-1'>
                            {L.totalWeight}:{' '}
                            <span className='font-medium'>
                              {totalWeight.toFixed(2)} {L.unitKg}
                            </span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {L.costPerUnitThb} *
                        </label>
                        <div className='relative'>
                          <span
                            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium'
                            aria-hidden
                          >
                            {L.currencySymbol}
                          </span>
                          <input
                            type='number'
                            placeholder='0.00'
                            step='0.01'
                            min='0'
                            value={pricePerUnit ?? ''}
                            onChange={(e) => {
                              setPricePerUnit(
                                e.target.value === '' ? null : e.target.value,
                              )
                              clearFieldError('pricePerUnit')
                            }}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                              fieldErrors.pricePerUnit
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          />
                        </div>
                        {fieldErrors.pricePerUnit && (
                          <p className='text-sm text-red-600 mt-1' role='alert'>
                            {fieldErrors.pricePerUnit}
                          </p>
                        )}
                        {(pricePerUnitNum ?? 0) > 0 && quantity > 0 && (
                          <div className='mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600'>
                                {L.totalTransferCost}
                              </span>
                              <span className='text-lg font-semibold text-gray-900'>
                                {L.currencySymbol}
                                {totalCost.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className='border-t border-gray-200 pt-4'>
                        <div className='flex items-center justify-between mb-3'>
                          <label className='block text-sm font-medium text-gray-700'>
                            {L.additionalCosts}
                          </label>
                          <button
                            type='button'
                            onClick={handleAddAdditionalCost}
                            className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                          >
                            <Plus size={16} />
                            {L.addCost}
                          </button>
                        </div>
                        {additionalCosts.length > 0 && (
                          <div className='space-y-3'>
                            {additionalCosts.map((cost) => (
                              <div
                                key={cost.id}
                                className='flex gap-3 items-start'
                              >
                                <div className='flex-1'>
                                  <input
                                    type='text'
                                    placeholder={L.categoryPlaceholder}
                                    value={cost.category}
                                    onChange={(e) => {
                                      handleAdditionalCostChange(
                                        cost.id,
                                        'category',
                                        e.target.value,
                                      )
                                      clearFieldError(`category_${cost.id}`)
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                      fieldErrors[`category_${cost.id}`]
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                    }`}
                                  />
                                  {fieldErrors[`category_${cost.id}`] && (
                                    <p
                                      className='text-sm text-red-600 mt-1'
                                      role='alert'
                                    >
                                      {fieldErrors[`category_${cost.id}`]}
                                    </p>
                                  )}
                                </div>
                                <div className='w-32'>
                                  <div className='relative'>
                                    <span
                                      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium'
                                      aria-hidden
                                    >
                                      {L.currencySymbol}
                                    </span>
                                    <input
                                      type='number'
                                      placeholder='0.00'
                                      step='0.01'
                                      min='0'
                                      value={cost.cost || ''}
                                      onChange={(e) => {
                                        handleAdditionalCostChange(
                                          cost.id,
                                          'cost',
                                          e.target.value,
                                        )
                                        clearFieldError(`cost_${cost.id}`)
                                      }}
                                      className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                        fieldErrors[`cost_${cost.id}`]
                                          ? 'border-red-500'
                                          : 'border-gray-300'
                                      }`}
                                    />
                                  </div>
                                  {fieldErrors[`cost_${cost.id}`] && (
                                    <p
                                      className='text-sm text-red-600 mt-1'
                                      role='alert'
                                    >
                                      {fieldErrors[`cost_${cost.id}`]}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type='button'
                                  onClick={() =>
                                    handleRemoveAdditionalCost(cost.id)
                                  }
                                  className='p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                  title={L.removeCost}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {additionalCosts.length === 0 && (
                          <div className='text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                            <p className='text-sm text-gray-500'>
                              {L.noAdditionalCosts}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {actionType === 'add' && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        {L.avgWeightKg}
                      </label>
                      <div className='relative'>
                        <Weight
                          size={18}
                          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                        />
                        <input
                          type='number'
                          placeholder='0.00'
                          step='0.01'
                          min='0'
                          value={avgWeight ?? ''}
                          onChange={(e) => {
                            setAvgWeight(
                              e.target.value === '' ? null : e.target.value,
                            )
                            clearFieldError('avgWeight')
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                            fieldErrors.avgWeight
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {fieldErrors.avgWeight && (
                        <p className='text-sm text-red-600 mt-1' role='alert'>
                          {fieldErrors.avgWeight}
                        </p>
                      )}
                      {(avgWeightNum ?? 0) > 0 && quantity > 0 && (
                        <p className='text-sm text-gray-600 mt-1'>
                          {L.totalWeight}:{' '}
                          <span className='font-medium'>
                            {totalWeight.toFixed(2)} {L.unitKg}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {actionType === 'add' && (
                    <>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {L.costPerUnitThb} *
                        </label>
                        <div className='relative'>
                          <span
                            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium'
                            aria-hidden
                          >
                            {L.currencySymbol}
                          </span>
                          <input
                            type='number'
                            placeholder='0.00'
                            step='0.01'
                            min='0'
                            value={pricePerUnit ?? ''}
                            onChange={(e) => {
                              setPricePerUnit(
                                e.target.value === '' ? null : e.target.value,
                              )
                              clearFieldError('pricePerUnit')
                            }}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                              fieldErrors.pricePerUnit
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                            required
                          />
                        </div>
                        {fieldErrors.pricePerUnit && (
                          <p className='text-sm text-red-600 mt-1' role='alert'>
                            {fieldErrors.pricePerUnit}
                          </p>
                        )}
                        {(pricePerUnitNum ?? 0) > 0 && quantity > 0 && (
                          <div className='mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600'>
                                {L.totalCost}
                              </span>
                              <span className='text-lg font-semibold text-gray-900'>
                                {L.currencySymbol}
                                {totalCost.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className='border-t border-gray-200 pt-4'>
                        <div className='flex items-center justify-between mb-3'>
                          <label className='block text-sm font-medium text-gray-700'>
                            {L.additionalCosts}
                          </label>
                          <button
                            type='button'
                            onClick={handleAddAdditionalCost}
                            className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                          >
                            <Plus size={16} />
                            {L.addCost}
                          </button>
                        </div>
                        {additionalCosts.length > 0 && (
                          <div className='space-y-3'>
                            {additionalCosts.map((cost) => (
                              <div
                                key={cost.id}
                                className='flex gap-3 items-start'
                              >
                                <div className='flex-1'>
                                  <input
                                    type='text'
                                    placeholder={L.categoryPlaceholder}
                                    value={cost.category}
                                    onChange={(e) => {
                                      handleAdditionalCostChange(
                                        cost.id,
                                        'category',
                                        e.target.value,
                                      )
                                      clearFieldError(`category_${cost.id}`)
                                    }}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                      fieldErrors[`category_${cost.id}`]
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                    }`}
                                  />
                                  {fieldErrors[`category_${cost.id}`] && (
                                    <p
                                      className='text-sm text-red-600 mt-1'
                                      role='alert'
                                    >
                                      {fieldErrors[`category_${cost.id}`]}
                                    </p>
                                  )}
                                </div>
                                <div className='w-32'>
                                  <div className='relative'>
                                    <span
                                      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium'
                                      aria-hidden
                                    >
                                      {L.currencySymbol}
                                    </span>
                                    <input
                                      type='number'
                                      placeholder='0.00'
                                      step='0.01'
                                      min='0'
                                      value={cost.cost || ''}
                                      onChange={(e) => {
                                        handleAdditionalCostChange(
                                          cost.id,
                                          'cost',
                                          e.target.value,
                                        )
                                        clearFieldError(`cost_${cost.id}`)
                                      }}
                                      className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                        fieldErrors[`cost_${cost.id}`]
                                          ? 'border-red-500'
                                          : 'border-gray-300'
                                      }`}
                                    />
                                  </div>
                                  {fieldErrors[`cost_${cost.id}`] && (
                                    <p
                                      className='text-sm text-red-600 mt-1'
                                      role='alert'
                                    >
                                      {fieldErrors[`cost_${cost.id}`]}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type='button'
                                  onClick={() =>
                                    handleRemoveAdditionalCost(cost.id)
                                  }
                                  className='p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                  title={L.removeCost}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {additionalCosts.length === 0 && (
                          <div className='text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                            <p className='text-sm text-gray-500'>
                              {L.noAdditionalCosts}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {actionType === 'sell' && (
                    <>
                      {fieldErrors.sellGradeRows && (
                        <p className='text-sm text-red-600' role='alert'>
                          {fieldErrors.sellGradeRows}
                        </p>
                      )}
                      <div className='border-t border-gray-200 pt-4'>
                        <div className='flex items-center justify-between mb-4'>
                          <label className='block text-sm font-medium text-gray-700'>
                            {L.speciesToSell}
                          </label>
                          {sellGradeRows.length > 0 && (
                            <button
                              type='button'
                              onClick={handleAddSellGradeRow}
                              disabled={
                                fishSizeGrades.length > 0 &&
                                sellGradeRows.length >= fishSizeGrades.length
                              }
                              className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                              <Plus size={16} />
                              {L.addSizeRow}
                            </button>
                          )}
                        </div>
                        {sellGradeRows.length > 0 && (
                          <div className='border border-gray-200 rounded-xl overflow-hidden'>
                            <div className='grid grid-cols-[5.5rem_1fr_1fr_1fr_5.5rem_2rem] gap-x-2 pl-4 pr-3 py-2 bg-gray-100 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>
                              <div className='pl-3'>
                                ไซส์ <span className='text-red-400'>*</span>
                              </div>
                              <div className='pl-3'>
                                กก. <span className='text-red-400'>*</span>
                              </div>
                              <div className='pl-3'>
                                บาท/กก. <span className='text-red-400'>*</span>
                              </div>
                              <div className='pl-3'>ตัว</div>
                              <div className='text-right pr-3'>รวม</div>
                              <div />
                            </div>
                            <div className='divide-y divide-gray-100'>
                              {sellGradeRows.map((row) => {
                                const usedGradeIds = new Set(
                                  sellGradeRows
                                    .filter((r) => r.id !== row.id)
                                    .map((r) => r.gradeId),
                                )
                                const availableGrades = fishSizeGrades.filter(
                                  (g) =>
                                    g.key === row.gradeId ||
                                    !usedGradeIds.has(g.key),
                                )
                                const subtotal =
                                  (row.weight || 0) * (row.pricePerKg || 0)
                                return (
                                  <div
                                    key={row.id}
                                    className='grid grid-cols-[5.5rem_1fr_1fr_1fr_5.5rem_2rem] gap-x-2 px-3 py-2 items-center bg-white hover:bg-gray-50 transition-colors'
                                  >
                                    <div className='min-w-0'>
                                      <select
                                        value={row.gradeId || ''}
                                        onChange={(e) => {
                                          handleSellGradeRowChange(
                                            row.id,
                                            'gradeId',
                                            e.target.value,
                                          )
                                          clearFieldError(`sell_g_${row.id}`)
                                        }}
                                        className={`w-full h-9 px-2 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white ${
                                          fieldErrors[`sell_g_${row.id}`]
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                        }`}
                                      >
                                        <option value='' disabled>
                                          —
                                        </option>
                                        {availableGrades.map((g) => (
                                          <option key={g.key} value={g.key}>
                                            {g.value}
                                          </option>
                                        ))}
                                      </select>
                                      {fieldErrors[`sell_g_${row.id}`] && (
                                        <p className='text-[10px] text-red-600 mt-0.5'>
                                          {fieldErrors[`sell_g_${row.id}`]}
                                        </p>
                                      )}
                                    </div>
                                    <div className='min-w-0'>
                                      <div className='relative'>
                                        <input
                                          type='number'
                                          placeholder='0.0'
                                          step='0.1'
                                          min='0'
                                          value={row.weight || ''}
                                          onChange={(e) => {
                                            handleSellGradeRowChange(
                                              row.id,
                                              'weight',
                                              e.target.value,
                                            )
                                            clearFieldError(`sell_w_${row.id}`)
                                          }}
                                          className={`w-full h-9 pl-3 pr-8 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white ${
                                            fieldErrors[`sell_w_${row.id}`]
                                              ? 'border-red-500'
                                              : 'border-gray-300'
                                          }`}
                                        />
                                        <span className='absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400'>
                                          {L.unitKg}
                                        </span>
                                      </div>
                                      {fieldErrors[`sell_w_${row.id}`] && (
                                        <p className='text-[10px] text-red-600 mt-0.5'>
                                          {fieldErrors[`sell_w_${row.id}`]}
                                        </p>
                                      )}
                                    </div>
                                    <div className='min-w-0'>
                                      <div className='relative'>
                                        <span className='absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400'>
                                          บาท
                                        </span>
                                        <input
                                          type='number'
                                          placeholder='0'
                                          step='1'
                                          min='0'
                                          value={row.pricePerKg || ''}
                                          onChange={(e) => {
                                            handleSellGradeRowChange(
                                              row.id,
                                              'pricePerKg',
                                              e.target.value,
                                            )
                                            clearFieldError(`sell_p_${row.id}`)
                                          }}
                                          className={`w-full h-9 pl-3 pr-9 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white ${
                                            fieldErrors[`sell_p_${row.id}`]
                                              ? 'border-red-500'
                                              : 'border-gray-300'
                                          }`}
                                        />
                                      </div>
                                      {fieldErrors[`sell_p_${row.id}`] && (
                                        <p className='text-[10px] text-red-600 mt-0.5'>
                                          {fieldErrors[`sell_p_${row.id}`]}
                                        </p>
                                      )}
                                    </div>
                                    <div className='min-w-0'>
                                      <input
                                        type='number'
                                        placeholder=''
                                        step='1'
                                        min='0'
                                        value={row.fishCount ?? ''}
                                        onChange={(e) =>
                                          handleSellGradeRowChange(
                                            row.id,
                                            'fishCount',
                                            e.target.value,
                                          )
                                        }
                                        className='w-full h-9 px-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white text-center'
                                        title={L.fishCountOptional}
                                      />
                                    </div>
                                    <div className='text-right text-sm font-semibold text-gray-900 tabular-nums'>
                                      {subtotal > 0
                                        ? `${L.currencySymbol}${subtotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}`
                                        : `${L.currencySymbol}0`}
                                    </div>
                                    <button
                                      type='button'
                                      onClick={() =>
                                        handleRemoveSellGradeRow(row.id)
                                      }
                                      className='w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
                                      title={L.removeRow}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {sellGradeRows.length === 0 && (
                          <div className='text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                            <Fish
                              size={40}
                              className='mx-auto text-gray-400 mb-2'
                            />
                            <p className='text-sm text-gray-500 mb-3'>
                              {L.noSpeciesAddedForSale}
                            </p>
                            <button
                              type='button'
                              onClick={handleAddSellGradeRow}
                              className='px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-300'
                            >
                              <Plus size={16} className='inline mr-1' />
                              {L.addSizeRow}
                            </button>
                          </div>
                        )}
                      </div>
                      {sellGradeRows.length > 0 &&
                        sellTotals.totalWeight > 0 && (
                          <div className='bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 border border-purple-200'>
                            <p className='text-xs text-purple-700 font-medium mb-3'>
                              {L.saleSummary}
                            </p>
                            <div className='grid grid-cols-2 gap-4'>
                              <div>
                                <p className='text-xs text-purple-700 font-medium mb-1'>
                                  {L.totalWeightLabel}
                                </p>
                                <p className='text-xl font-bold text-purple-900'>
                                  {sellTotals.totalWeight.toLocaleString(
                                    undefined,
                                    { minimumFractionDigits: 1 },
                                  )}{' '}
                                  {L.unitKg}
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-purple-700 font-medium mb-1'>
                                  {L.totalRevenueLabel}
                                </p>
                                <p className='text-xl font-bold text-purple-900'>
                                  {L.currencySymbol}
                                  {sellTotals.totalRevenue.toLocaleString(
                                    undefined,
                                    { minimumFractionDigits: 1 },
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {L.buyerMarket}
                          <span className='text-red-500 ml-0.5' aria-hidden>
                            *
                          </span>
                        </label>
                        <select
                          value={buyer}
                          onChange={(e) => {
                            setBuyer(e.target.value)
                            clearFieldError('buyer')
                          }}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                            fieldErrors.buyer
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          required
                          aria-invalid={!!fieldErrors.buyer}
                          aria-describedby={
                            fieldErrors.buyer ? 'buyer-error' : undefined
                          }
                        >
                          <option value='' disabled>
                            {L.selectBuyerMarket}
                          </option>
                          {merchants.map((m) => (
                            <option key={m.id} value={String(m.id)}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.buyer && (
                          <p
                            id='buyer-error'
                            className='text-sm text-red-600 mt-1'
                            role='alert'
                          >
                            {fieldErrors.buyer}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {actionType === 'sell' && (
                    <div className='border-t border-gray-200 pt-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <label className='block text-sm font-medium text-gray-700'>
                          {L.additionalCosts}
                        </label>
                        <button
                          type='button'
                          onClick={handleAddAdditionalCost}
                          className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors'
                        >
                          <Plus size={16} />
                          {L.addCost}
                        </button>
                      </div>
                      {additionalCosts.length > 0 ? (
                        <div className='space-y-3'>
                          {additionalCosts.map((cost) => (
                            <div
                              key={cost.id}
                              className='flex gap-3 items-start'
                            >
                              <div className='flex-1'>
                                <input
                                  type='text'
                                  placeholder={L.categoryPlaceholder}
                                  value={cost.category}
                                  onChange={(e) => {
                                    handleAdditionalCostChange(
                                      cost.id,
                                      'category',
                                      e.target.value,
                                    )
                                    clearFieldError(`category_${cost.id}`)
                                  }}
                                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                                    fieldErrors[`category_${cost.id}`]
                                      ? 'border-red-500'
                                      : 'border-gray-300'
                                  }`}
                                />
                                {fieldErrors[`category_${cost.id}`] && (
                                  <p
                                    className='text-sm text-red-600 mt-1'
                                    role='alert'
                                  >
                                    {fieldErrors[`category_${cost.id}`]}
                                  </p>
                                )}
                              </div>
                              <div className='w-32'>
                                <div className='relative'>
                                  <span
                                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium'
                                    aria-hidden
                                  >
                                    {L.currencySymbol}
                                  </span>
                                  <input
                                    type='number'
                                    placeholder='0.00'
                                    step='0.01'
                                    min='0'
                                    value={cost.cost || ''}
                                    onChange={(e) => {
                                      handleAdditionalCostChange(
                                        cost.id,
                                        'cost',
                                        e.target.value,
                                      )
                                      clearFieldError(`cost_${cost.id}`)
                                    }}
                                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                                      fieldErrors[`cost_${cost.id}`]
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                    }`}
                                  />
                                </div>
                                {fieldErrors[`cost_${cost.id}`] && (
                                  <p
                                    className='text-sm text-red-600 mt-1'
                                    role='alert'
                                  >
                                    {fieldErrors[`cost_${cost.id}`]}
                                  </p>
                                )}
                              </div>
                              <button
                                type='button'
                                onClick={() =>
                                  handleRemoveAdditionalCost(cost.id)
                                }
                                className='p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                title={L.removeCost}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                          <p className='text-sm text-gray-500'>
                            {L.noAdditionalCosts}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      {actionType === 'add'
                        ? L.stockDate
                        : actionType === 'transfer'
                          ? L.transferDate
                          : L.saleDate}{' '}
                      *
                    </label>
                    <DatePicker
                      value={activityDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(date) => {
                        setActivityDate(date)
                        clearFieldError('activityDate')
                      }}
                      className={
                        fieldErrors.activityDate
                          ? 'border-red-500 ring-2 ring-red-200'
                          : ''
                      }
                      aria-invalid={!!fieldErrors.activityDate}
                      aria-describedby={
                        fieldErrors.activityDate
                          ? 'activityDate-error'
                          : undefined
                      }
                    />
                    {fieldErrors.activityDate && (
                      <p
                        id='activityDate-error'
                        className='text-sm text-red-600 mt-1'
                        role='alert'
                      >
                        {fieldErrors.activityDate}
                      </p>
                    )}
                  </div>

                  {quantity > 0 &&
                    (actionType === 'transfer' ||
                      actionType === 'sell' ||
                      actionType === 'add') && (
                      <div className='border-t border-gray-200 pt-5'>
                        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm font-medium text-gray-700'>
                              {L.stockPreview}
                            </span>
                            {showWarning && (
                              <span className='flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200'>
                                <AlertTriangle size={12} />
                                {actionType === 'transfer'
                                  ? L.largeTransfer
                                  : L.largeSale}
                                {L.largeActionPercent(
                                  Number(stockPercentage.toFixed(0)),
                                )}
                              </span>
                            )}
                          </div>
                          <div className='grid grid-cols-3 gap-4'>
                            <div>
                              <p className='text-xs text-gray-600'>
                                {L.current}
                              </p>
                              <p className='text-lg font-semibold text-gray-900'>
                                {pond.currentStock.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className='text-xs text-gray-600'>
                                {actionType === 'add' ? L.adding : L.removing}
                              </p>
                              <p
                                className={`text-lg font-semibold ${actionType === 'add' ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {actionType === 'add' ? '+' : '-'}
                                {quantity.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className='text-xs text-gray-600'>
                                {L.afterAction}
                              </p>
                              <p className='text-lg font-semibold text-blue-600'>
                                {remainingStock.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {(actionType === 'sell' || actionType === 'transfer') && (
                    <div className='border-t border-gray-200 pt-5'>
                      <div className='bg-amber-50 rounded-lg p-4 border border-amber-200'>
                        <label className='flex items-start gap-3 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={closePond}
                            onChange={(e) => setClosePond(e.target.checked)}
                            className='mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                          />
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-semibold text-gray-900'>
                                {actionType === 'sell'
                                  ? L.closePondAfterSale
                                  : L.closePondAfterTransfer}
                              </span>
                              <span className='px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded'>
                                {L.maintenance}
                              </span>
                            </div>
                            <p className='text-xs text-gray-600 mt-1'>
                              {L.closePondDescription}
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      {L.notes}
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={L.notesPlaceholder}
                      className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none'
                    />
                  </div>

                  {submitError && (
                    <div className='rounded-lg p-3 bg-red-50 border border-red-200 text-sm text-red-700'>
                      {submitError}
                    </div>
                  )}

                  <div className='flex items-center justify-end gap-3 pt-4 border-t border-gray-200'>
                    <button
                      type='button'
                      onClick={onClose}
                      className='px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors'
                    >
                      {L.cancel}
                    </button>
                    <button
                      type='submit'
                      disabled={
                        isSubmitting ||
                        !isFormValid ||
                        (actionType !== 'add' &&
                          quantity > pond.currentStock) ||
                        (actionType === 'sell' && sellGradeRows.length === 0)
                      }
                      className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${getButtonColor()} text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting && (
                        <Loader2
                          size={18}
                          className='animate-spin'
                          aria-hidden
                        />
                      )}
                      {getReviewButtonLabel()}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  )
}

const fmtCurrency = (v: number) =>
  `฿${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

function ConfirmationView({
  actionType,
  pond,
  previewResult,
  destinationPond,
  activityDate,
  closePond,
  notes,
  buyer,
  merchants,
  submitError,
  isSubmitting,
  onBack,
  onConfirm,
  getConfirmButtonLabel,
  getButtonColor,
}: {
  actionType: ActionType
  pond: StockActionModalPond & {
    currentStock: number
    species: string[]
    code: string
  }
  previewResult:
    | PondFillPreviewResponse
    | PondMovePreviewResponse
    | PondSellPreviewResponse
  destinationPond: StockActionModalPond | null
  activityDate: string
  closePond: boolean
  notes: string
  buyer: string
  merchants: { id: number; name: string }[]
  submitError: string | null
  isSubmitting: boolean
  onBack: () => void
  onConfirm: () => void
  getConfirmButtonLabel: () => string
  getButtonColor: () => string
}) {
  const L = th.stockActionModal

  const accentMap = {
    add: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800',
      icon: <TrendingUp size={16} />,
    },
    transfer: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800',
      icon: <ArrowRight size={16} />,
    },
    sell: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-800',
      icon: <ShoppingCart size={16} />,
    },
  }
  const accent = accentMap[actionType]

  const merchantName = buyer
    ? (merchants.find((m) => String(m.id) === buyer)?.name ?? buyer)
    : '—'

  const formatDate = (d: string) => {
    try {
      const [y, m, day] = d.split('-').map(Number)
      return `${day}/${m}/${y + 543}`
    } catch {
      return d
    }
  }

  const stockBefore =
    'stockBefore' in previewResult
      ? (previewResult as PondFillPreviewResponse | PondMovePreviewResponse)
          .stockBefore
      : null
  const stockAfter =
    'stockAfter' in previewResult
      ? (previewResult as PondFillPreviewResponse | PondMovePreviewResponse)
          .stockAfter
      : null
  const stockDelta =
    'stockDelta' in previewResult
      ? (previewResult as PondFillPreviewResponse | PondMovePreviewResponse)
          .stockDelta
      : null

  return (
    <div className='p-6 space-y-5'>
      {/* Step indicator */}
      <div className='flex items-center gap-3 text-sm'>
        <div className='flex items-center gap-1.5 text-green-600'>
          <div className='w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold'>
            <Check size={14} />
          </div>
          <span className='font-medium'>{L.stepFillDetails}</span>
        </div>
        <div className='h-px flex-1 bg-gray-300' />
        <div className={`flex items-center gap-1.5 ${accent.text}`}>
          <div
            className={`w-6 h-6 rounded-full ${accent.badge} flex items-center justify-center text-xs font-bold`}
          >
            2
          </div>
          <span className='font-medium'>{L.stepReviewConfirm}</span>
        </div>
      </div>

      {/* Warning banner */}
      <div
        className={`flex items-center gap-3 rounded-lg p-3 ${actionType === 'add' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}
      >
        <AlertTriangle size={18} className='shrink-0' />
        <p className='text-sm font-medium'>{L.cannotUndo}</p>
      </div>

      {!previewResult.valid && previewResult.validationError && (
        <div className='rounded-lg p-3 bg-red-50 border border-red-200 text-sm text-red-700'>
          {previewResult.validationError}
        </div>
      )}

      {/* Transaction badge */}
      <div className='flex items-center gap-2'>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${accent.badge}`}
        >
          {accent.icon}
          {actionType === 'add'
            ? L.addStock
            : actionType === 'transfer'
              ? L.transfer
              : L.sellStock}
        </span>
      </div>

      {/* General info card */}
      <div className='bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2 text-sm'>
        <div className='flex justify-between'>
          <span className='text-gray-500'>
            {actionType === 'transfer' ? L.sourcePond : L.sourcePond}
          </span>
          <span className='font-medium text-gray-900'>{pond.name}</span>
        </div>
        {actionType === 'transfer' && destinationPond && (
          <div className='flex justify-between'>
            <span className='text-gray-500'>{L.destinationPondLabel}</span>
            <span className='font-medium text-gray-900'>
              {destinationPond.name}
            </span>
          </div>
        )}
        {actionType === 'sell' && (
          <div className='flex justify-between'>
            <span className='text-gray-500'>{L.buyerMarket}</span>
            <span className='font-medium text-gray-900'>{merchantName}</span>
          </div>
        )}
        <div className='flex justify-between'>
          <span className='text-gray-500'>{L.dateLabel}</span>
          <span className='font-medium text-gray-900'>
            {formatDate(activityDate)}
          </span>
        </div>
        {(actionType === 'sell' || actionType === 'transfer') && (
          <div className='flex justify-between'>
            <span className='text-gray-500'>{L.closePondAfter}</span>
            <span className='font-medium text-gray-900'>
              {closePond ? L.yes : L.no}
            </span>
          </div>
        )}
        {notes.trim() && (
          <div className='flex justify-between'>
            <span className='text-gray-500'>{L.notes}</span>
            <span className='font-medium text-gray-900 text-right max-w-[60%]'>
              {notes}
            </span>
          </div>
        )}
      </div>

      {/* Action-specific details */}
      {actionType === 'add' && 'baseStockCost' in previewResult && (
        <AddPreviewDetails
          preview={previewResult as PondFillPreviewResponse}
          accent={accent}
        />
      )}
      {actionType === 'transfer' && 'baseTransferCost' in previewResult && (
        <TransferPreviewDetails
          preview={previewResult as PondMovePreviewResponse}
          accent={accent}
        />
      )}
      {actionType === 'sell' && 'items' in previewResult && (
        <SellPreviewDetails
          preview={previewResult as PondSellPreviewResponse}
          accent={accent}
        />
      )}

      {stockBefore != null && stockAfter != null && stockDelta != null && (
        <div className={`rounded-lg p-4 ${accent.bg} border ${accent.border}`}>
          <p className={`text-sm font-semibold ${accent.text} mb-3`}>
            {L.stockImpact}
          </p>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <p className='text-xs text-gray-500'>{L.before}</p>
              <p className='text-xl font-bold text-gray-900'>
                {stockBefore.toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500'>{L.after}</p>
              <p className='text-xl font-bold text-gray-900'>
                {stockAfter.toLocaleString()}
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500'>
                {actionType === 'add'
                  ? L.added
                  : actionType === 'transfer'
                    ? L.transferred
                    : L.sold}
              </p>
              <p
                className={`text-xl font-bold ${stockDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {stockDelta >= 0 ? '+' : ''}
                {stockDelta.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className='rounded-lg p-3 bg-red-50 border border-red-200 text-sm text-red-700'>
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center justify-between gap-3 pt-4 border-t border-gray-200'>
        <button
          type='button'
          onClick={onBack}
          className='flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors'
        >
          <ArrowLeft size={16} />
          {L.backToEdit}
        </button>
        <button
          type='button'
          onClick={onConfirm}
          disabled={isSubmitting || !previewResult.valid}
          className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${getButtonColor()} text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting && (
            <Loader2 size={18} className='animate-spin' aria-hidden />
          )}
          {getConfirmButtonLabel()}
        </button>
      </div>
    </div>
  )
}

function AddPreviewDetails({
  preview,
  accent,
}: {
  preview: PondFillPreviewResponse
  accent: { bg: string; border: string; text: string }
}) {
  const L = th.stockActionModal
  const fishTypeLabels = th.fishType
  return (
    <div
      className={`rounded-lg p-4 ${accent.bg} border ${accent.border} space-y-2 text-sm`}
    >
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.species}</span>
        <span className='font-medium text-gray-900'>
          {fishTypeLabels[preview.species as keyof typeof fishTypeLabels] ??
            preview.species}
        </span>
      </div>
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.quantity}</span>
        <span className='font-medium text-gray-900'>
          {preview.quantity.toLocaleString()}
        </span>
      </div>
      {preview.avgWeightKg > 0 && (
        <>
          <div className='flex justify-between'>
            <span className='text-gray-600'>{L.avgWeightKg}</span>
            <span className='font-medium text-gray-900'>
              {preview.avgWeightKg.toFixed(2)} {L.unitKg}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-600'>{L.totalWeight}</span>
            <span className='font-medium text-gray-900'>
              {preview.totalWeight.toFixed(2)} {L.unitKg}
            </span>
          </div>
        </>
      )}
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.costPerUnitThb}</span>
        <span className='font-medium text-gray-900'>
          {fmtCurrency(preview.costPerUnit)}
        </span>
      </div>
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.baseStockCost}</span>
        <span className='font-medium text-gray-900'>
          {fmtCurrency(preview.baseStockCost)}
        </span>
      </div>
      {preview.additionalCosts?.length > 0 && (
        <>
          <div className='border-t border-gray-200 pt-2 mt-2'>
            <p className='text-xs text-gray-500 mb-1'>{L.additionalCosts}</p>
          </div>
          {preview.additionalCosts.map((c, i) => (
            <div key={i} className='flex justify-between pl-3'>
              <span className='text-gray-600'>{c.title}</span>
              <span className='font-medium text-gray-900'>
                {fmtCurrency(c.cost)}
              </span>
            </div>
          ))}
        </>
      )}
      <div className='border-t border-gray-300 pt-2 mt-2 flex justify-between font-semibold'>
        <span className={accent.text}>{L.grandTotal}</span>
        <span className={accent.text}>{fmtCurrency(preview.totalCost)}</span>
      </div>
    </div>
  )
}

function TransferPreviewDetails({
  preview,
  accent,
}: {
  preview: PondMovePreviewResponse
  accent: { bg: string; border: string; text: string }
}) {
  const L = th.stockActionModal
  const fishTypeLabels = th.fishType
  return (
    <div
      className={`rounded-lg p-4 ${accent.bg} border ${accent.border} space-y-2 text-sm`}
    >
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.species}</span>
        <span className='font-medium text-gray-900'>
          {fishTypeLabels[preview.species as keyof typeof fishTypeLabels] ??
            preview.species}
        </span>
      </div>
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.quantity}</span>
        <span className='font-medium text-gray-900'>
          {preview.quantity.toLocaleString()}
        </span>
      </div>
      {preview.avgWeightKg > 0 && (
        <>
          <div className='flex justify-between'>
            <span className='text-gray-600'>{L.avgWeightKg}</span>
            <span className='font-medium text-gray-900'>
              {preview.avgWeightKg.toFixed(2)} {L.unitKg}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-600'>{L.totalWeight}</span>
            <span className='font-medium text-gray-900'>
              {preview.totalWeight.toFixed(2)} {L.unitKg}
            </span>
          </div>
        </>
      )}
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.costPerUnitThb}</span>
        <span className='font-medium text-gray-900'>
          {fmtCurrency(preview.costPerUnit)}
        </span>
      </div>
      <div className='flex justify-between'>
        <span className='text-gray-600'>{L.baseTransferCost}</span>
        <span className='font-medium text-gray-900'>
          {fmtCurrency(preview.baseTransferCost)}
        </span>
      </div>
      {preview.additionalCosts?.length > 0 && (
        <>
          <div className='border-t border-gray-200 pt-2 mt-2'>
            <p className='text-xs text-gray-500 mb-1'>{L.additionalCosts}</p>
          </div>
          {preview.additionalCosts.map((c, i) => (
            <div key={i} className='flex justify-between pl-3'>
              <span className='text-gray-600'>{c.title}</span>
              <span className='font-medium text-gray-900'>
                {fmtCurrency(c.cost)}
              </span>
            </div>
          ))}
        </>
      )}
      <div className='border-t border-gray-300 pt-2 mt-2 flex justify-between font-semibold'>
        <span className={accent.text}>{L.grandTotal}</span>
        <span className={accent.text}>{fmtCurrency(preview.totalCost)}</span>
      </div>
    </div>
  )
}

function SellPreviewDetails({
  preview,
  accent,
}: {
  preview: PondSellPreviewResponse
  accent: { bg: string; border: string; text: string }
}) {
  const L = th.stockActionModal
  return (
    <div
      className={`rounded-lg p-4 ${accent.bg} border ${accent.border} space-y-3 text-sm`}
    >
      <p className={`text-sm font-semibold ${accent.text}`}>{L.saleDetails}</p>
      <div className='rounded-md overflow-hidden border border-gray-200 bg-white/50'>
        <div className='grid grid-cols-[1.2fr_1fr_1fr_1.1fr] gap-2 px-3 py-2 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>
          <div className='pl-1'>ไซส์</div>
          <div className='text-right pr-1'>{L.totalWeightLabel}</div>
          <div className='text-right pr-1'>{L.pricePerKgThb}</div>
          <div className='text-right pr-1'>{L.totalRevenueLabel}</div>
        </div>
        <div className='divide-y divide-gray-100'>
          {preview.items.map((item, i) => (
            <div
              key={i}
              className='grid grid-cols-[1.2fr_1fr_1fr_1.1fr] gap-2 px-3 py-2 items-center'
            >
              <div className='font-medium text-gray-900'>
                {item.fishSizeGradeName}
              </div>
              <div className='text-right tabular-nums font-semibold text-gray-900'>
                {item.weight.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                })}{' '}
                {L.unitKg}
              </div>
              <div className='text-right tabular-nums font-semibold text-gray-900'>
                {fmtCurrency(item.pricePerKg)}
              </div>
              <div className='text-right tabular-nums font-semibold text-gray-900'>
                {fmtCurrency(item.subtotal)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='mt-3 rounded-lg border border-gray-200/90 bg-white/80 px-3 py-2.5 shadow-sm'>
        <div className='grid grid-cols-[1.2fr_1fr_1fr_1.1fr] gap-2 items-center'>
          <div className='pl-1 text-sm font-semibold text-gray-700'>สรุป</div>
          <div className='text-right text-sm font-bold tabular-nums text-gray-900'>
            {preview.totalWeight.toLocaleString(undefined, {
              minimumFractionDigits: 1,
            })}{' '}
            {L.unitKg}
          </div>
          <div className='min-w-0' aria-hidden />
          <div
            className={`text-right text-sm font-bold tabular-nums ${accent.text}`}
          >
            {fmtCurrency(preview.totalRevenue)}
          </div>
        </div>
      </div>
    </div>
  )
}
