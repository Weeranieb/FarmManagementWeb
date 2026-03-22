import { th } from '../../locales/th'
import type { AdditionalCost, NormalizedPond, SellGradeRow } from './types'

type V = typeof th.stockActionModal.validation

export function validateAddForm(
  V: V,
  input: {
    selectedSpecies: string
    quantity: number
    avgWeight: string | null
    pricePerUnitNum: number | null
    activityDate: string
    additionalCosts: AdditionalCost[]
  },
): Record<string, string> {
  const err: Record<string, string> = {}
  const {
    selectedSpecies,
    quantity,
    avgWeight,
    pricePerUnitNum,
    activityDate,
    additionalCosts,
  } = input
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
}

export function validateTransferForm(
  V: V,
  input: {
    selectedSpecies: string
    quantity: number
    avgWeight: string | null
    pricePerUnitNum: number | null
    activityDate: string
    destinationPondId: string
    additionalCosts: AdditionalCost[]
    pond: NormalizedPond | null
  },
): Record<string, string> {
  const err: Record<string, string> = {}
  const {
    selectedSpecies,
    quantity,
    avgWeight,
    pricePerUnitNum,
    activityDate,
    destinationPondId,
    additionalCosts,
    pond,
  } = input
  if (!selectedSpecies?.trim()) err.species = V.selectSpecies
  const q = quantity
  if (typeof q !== 'number' || Number.isNaN(q)) err.quantity = V.mustBeNumber
  else if (!Number.isInteger(q) || q < 1) err.quantity = V.quantityMin
  else if (pond && q > pond.currentStock)
    err.quantity = V.quantityExceedsStock(pond.currentStock)
  if (avgWeight == null || avgWeight === '') err.avgWeight = V.mustBeZeroOrMore
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
}

export function validateSellForm(
  V: V,
  input: {
    sellGradeRows: SellGradeRow[]
    buyer: string
    additionalCosts: AdditionalCost[]
  },
): Record<string, string> {
  const err: Record<string, string> = {}
  const { sellGradeRows, buyer, additionalCosts } = input
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
}
