import type {
  PondFillPreviewResponse,
  PondMovePreviewResponse,
  PondSellPreviewResponse,
} from '../../api/pond'

export type ActionType = 'add' | 'transfer' | 'sell'

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

export interface AdditionalCost {
  id: string
  category: string
  cost: number
}

export interface SellGradeRow {
  id: string
  gradeId: number
  weight: number
  pricePerKg: number
  fishCount?: number
}

export interface StockActionModalProps {
  pond: StockActionModalPond | null
  isOpen: boolean
  onClose: () => void
  availablePonds?: StockActionModalPond[]
  initialActionType?: ActionType
  onFillSuccess?: () => void
}

export type NormalizedPond = StockActionModalPond & {
  currentStock: number
  species: string[]
  code: string
}

export type PreviewResult =
  | PondFillPreviewResponse
  | PondMovePreviewResponse
  | PondSellPreviewResponse
