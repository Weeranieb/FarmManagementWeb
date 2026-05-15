import { apiClient } from '../lib/api-client'

export interface PondResponse {
  id: number
  farmId: number
  name: string
  totalFish: number | null
  status: string
  area?: number | null
  fishTypes: string[]
  ageDays: number | null
  startDate: string | null
  latestActivityDate: string | null
  latestActivityType: string | null
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

export interface CreatePondItem {
  name: string
  area?: number
}

export interface CreatePondsRequest {
  farmId: number
  ponds: CreatePondItem[]
}

export interface UpdatePondBody {
  farmId?: number
  name?: string
  status?: string
  area?: number
}

export interface PondFillRequest {
  fishType: string
  amount: number
  fishWeight?: number
  pricePerUnit: number
  additionalCosts?: { title: string; cost: number }[]
  activityDate: string
  remark?: string
}

export interface PondFillResponse {
  activityId: number
  activePondId: number
}

export interface PondMoveRequest {
  toPondId: number
  fishType: string
  amount: number
  fishWeight?: number
  pricePerUnit: number
  additionalCosts?: { title: string; cost: number }[]
  activityDate: string
  remark?: string
  isClose: boolean
}

export interface PondMoveResponse {
  activityId: number
  activePondId: number
  toActivePondId: number
}

export interface PondSellDetailItem {
  fishSizeGradeId: number
  weight: number
  pricePerUnit: number
  fishCount?: number
}

export interface PondSellRequest {
  activityDate: string
  details: PondSellDetailItem[]
  merchantId?: number
  markToClose: boolean
  additionalCosts?: { title: string; cost: number }[]
}

export interface PondSellResponse {
  activityId: number
  activePondId: number
}

// --- Preview (Review & Confirm) response types ---

export interface AdditionalCostLine {
  title: string
  cost: number
}

export interface PondFillPreviewResponse {
  valid: boolean
  species: string
  quantity: number
  avgWeightKg: number
  totalWeight: number
  costPerUnit: number
  baseStockCost: number
  additionalCosts: AdditionalCostLine[]
  totalCost: number
  stockBefore: number
  stockAfter: number
  stockDelta: number
  validationError?: string
}

export interface PondMovePreviewResponse {
  valid: boolean
  species: string
  quantity: number
  avgWeightKg: number
  totalWeight: number
  costPerUnit: number
  baseTransferCost: number
  additionalCosts: AdditionalCostLine[]
  totalCost: number
  stockBefore: number
  stockAfter: number
  stockDelta: number
  validationError?: string
}

export interface PondSellPreviewItem {
  fishSizeGradeId: number
  fishSizeGradeName: string
  weight: number
  pricePerKg: number
  subtotal: number
  fishCount?: number
}

export interface PondSellPreviewResponse {
  valid: boolean
  items: PondSellPreviewItem[]
  totalRevenue: number
  totalWeight: number
  validationError?: string
}

// --- Bulk import (farm + pond) ---

export interface BulkImportPondItem {
  name: string
  area?: number | null
}

export interface BulkImportFarmItem {
  name: string
  ponds: BulkImportPondItem[]
}

export interface BulkImportFarmPondRequest {
  farms: BulkImportFarmItem[]
}

export interface BulkImportFarmResult {
  name: string
  isNew: boolean
  pondsCreated: number
  pondsUpdated: number
  pondsUnchanged: number
}

export interface BulkImportFarmPondResponse {
  farmsCreated: number
  farmsExisting: number
  pondsCreated: number
  pondsUpdated: number
  pondsUnchanged: number
  farms: BulkImportFarmResult[]
}

export const pondApi = {
  getPond: async (id: number): Promise<PondResponse> => {
    return apiClient.get<PondResponse>(`/pond/${id}`)
  },

  getPondList: async (farmId: number): Promise<PondResponse[]> => {
    return apiClient.get<PondResponse[]>(`/pond?farmId=${farmId}`)
  },

  createPonds: async (body: CreatePondsRequest): Promise<void> => {
    return apiClient.post<void>('/pond', body)
  },

  updatePond: async (id: number, body: UpdatePondBody): Promise<void> => {
    return apiClient.put<void>(`/pond/${id}`, body)
  },

  fillPond: async (
    pondId: number,
    body: PondFillRequest,
  ): Promise<PondFillResponse> => {
    return apiClient.post<PondFillResponse>(`/pond/${pondId}/fill`, body)
  },

  /**
   * Move (transfer) fish from source pond to destination pond.
   */
  movePond: async (
    sourcePondId: number,
    body: PondMoveRequest,
  ): Promise<PondMoveResponse> => {
    return apiClient.post<PondMoveResponse>(`/pond/${sourcePondId}/move`, body)
  },

  /**
   * Record a sell transaction from a pond. Optionally close the active cycle.
   */
  sellPond: async (
    pondId: number,
    body: PondSellRequest,
  ): Promise<PondSellResponse> => {
    return apiClient.post<PondSellResponse>(`/pond/${pondId}/sell`, body)
  },

  fillPondPreview: async (
    pondId: number,
    body: PondFillRequest,
  ): Promise<PondFillPreviewResponse> => {
    return apiClient.post<PondFillPreviewResponse>(
      `/pond/${pondId}/fill/preview`,
      body,
    )
  },

  movePondPreview: async (
    sourcePondId: number,
    body: PondMoveRequest,
  ): Promise<PondMovePreviewResponse> => {
    return apiClient.post<PondMovePreviewResponse>(
      `/pond/${sourcePondId}/move/preview`,
      body,
    )
  },

  sellPondPreview: async (
    pondId: number,
    body: PondSellRequest,
  ): Promise<PondSellPreviewResponse> => {
    return apiClient.post<PondSellPreviewResponse>(
      `/pond/${pondId}/sell/preview`,
      body,
    )
  },

  downloadTemplate: async (): Promise<void> => {
    return apiClient.downloadBlob('/pond/template', 'pond_template.xlsx')
  },

  bulkImportFarmPond: async (
    clientId: number,
    body: BulkImportFarmPondRequest,
  ): Promise<BulkImportFarmPondResponse> => {
    return apiClient.post<BulkImportFarmPondResponse>(
      `/pond/bulk-import/${clientId}`,
      body,
    )
  },
}
