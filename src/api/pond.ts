import { apiClient } from '../lib/api-client'

export interface PondResponse {
  id: number
  farmId: number
  name: string
  totalFish: number | null
  status: string
  fishTypes: string[]
  ageDays: number | null
  latestActivityDate: string | null
  latestActivityType: string | null
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

export interface CreatePondsRequest {
  farmId: number
  names: string[]
}

export interface UpdatePondBody {
  farmId?: number
  name?: string
  status?: string
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
  fishType: string
  size: string
  amount: number
  fishUnit: string
  pricePerUnit: number
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
}
