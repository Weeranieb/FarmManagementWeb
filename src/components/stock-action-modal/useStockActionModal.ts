import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  type FormEvent,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { FISH_TYPE_VALUES } from '../../constants/fishType'
import { th } from '../../locales/th'
import { pondApi } from '../../api/pond'
import type {
  PondFillPreviewResponse,
  PondMovePreviewResponse,
  PondSellPreviewResponse,
} from '../../api/pond'
import { merchantApi } from '../../api/merchant'
import { fishSizeGradeApi } from '../../api/fishSizeGrade'
import type { DropdownItem } from '../../api/fishSizeGrade'
import { pondKeys } from '../../hooks/usePond'
import type {
  ActionType,
  AdditionalCost,
  SellGradeRow,
  StockActionModalPond,
  StockActionModalProps,
} from './types'
import {
  validateAddForm as runValidateAddForm,
  validateTransferForm as runValidateTransferForm,
  validateSellForm as runValidateSellForm,
} from './validation'

const L = th.stockActionModal

export function useStockActionModal({
  pond: pondProp,
  isOpen,
  onClose,
  availablePonds,
  initialActionType = 'add',
  onFillSuccess,
}: StockActionModalProps) {
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

  const validateAddForm = useCallback(
    (): Record<string, string> =>
      runValidateAddForm(V, {
        selectedSpecies,
        quantity,
        avgWeight,
        pricePerUnitNum,
        activityDate,
        additionalCosts,
      }),
    [
      V,
      selectedSpecies,
      quantity,
      avgWeight,
      pricePerUnitNum,
      activityDate,
      additionalCosts,
    ],
  )

  const validateTransferForm = useCallback(
    (): Record<string, string> =>
      runValidateTransferForm(V, {
        selectedSpecies,
        quantity,
        avgWeight,
        pricePerUnitNum,
        activityDate,
        destinationPondId,
        additionalCosts,
        pond,
      }),
    [
      V,
      selectedSpecies,
      quantity,
      avgWeight,
      pricePerUnitNum,
      activityDate,
      destinationPondId,
      additionalCosts,
      pond,
    ],
  )

  const validateSellForm = useCallback(
    (): Record<string, string> =>
      runValidateSellForm(V, {
        sellGradeRows,
        buyer,
        additionalCosts,
      }),
    [V, buyer, sellGradeRows, additionalCosts],
  )

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
    const list = availablePonds ?? []
    if (!pond) return list
    return list.filter(
      (p) =>
        String(p.id) !== String(pond.id) &&
        (p.status === 'active' || p.status === undefined),
    )
  }, [actionType, pond, pondListByFarmId, availablePonds])

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!pond) return

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
    if (!pond) return
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

  return {
    actionType,
    quantity,
    setQuantity,
    avgWeight,
    setAvgWeight,
    pricePerUnit,
    setPricePerUnit,
    avgWeightNum,
    pricePerUnitNum,
    selectedSpecies,
    setSelectedSpecies,
    destinationPondId,
    setDestinationPondId,
    additionalCosts,
    sellGradeRows,
    buyer,
    setBuyer,
    closePond,
    setClosePond,
    activityDate,
    setActivityDate,
    notes,
    setNotes,
    submitError,
    setSubmitError,
    isSubmitting,
    fieldErrors,
    setFieldErrors,
    showConfirmation,
    setShowConfirmation,
    previewResult,
    V,
    clearFieldError,
    pond,
    isMaintenanceBlocked,
    speciesOptions,
    merchants,
    fishSizeGrades,
    availablePondsForTransfer,
    destinationPond,
    totalCost,
    totalWeight,
    remainingStock,
    stockPercentage,
    sellTotals,
    showWarning,
    isFormValid,
    handleSubmit,
    handleConfirmedSubmit,
    handleActionTypeChange,
    getReviewButtonLabel,
    getConfirmButtonLabel,
    getButtonColor,
    handleAddAdditionalCost,
    handleRemoveAdditionalCost,
    handleAdditionalCostChange,
    handleAddSellGradeRow,
    handleRemoveSellGradeRow,
    handleSellGradeRowChange,
    destinationCurrentStock,
  }
}
