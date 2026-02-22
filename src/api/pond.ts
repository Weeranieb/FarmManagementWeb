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
}
