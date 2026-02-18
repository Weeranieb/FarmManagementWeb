import { apiClient } from '../lib/api-client'

export interface PondResponse {
  id: number
  farmId: number
  name: string
  status: string
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

export const pondApi = {
  getPondList: async (farmId: number): Promise<PondResponse[]> => {
    return apiClient.get<PondResponse[]>(`/pond?farmId=${farmId}`)
  },

  createPonds: async (body: CreatePondsRequest): Promise<void> => {
    return apiClient.post<void>('/pond', body)
  },

  updatePond: async (id: number, body: UpdatePondBody): Promise<void> => {
    return apiClient.put<void>(`/pond/${id}`, body)
  },
}
