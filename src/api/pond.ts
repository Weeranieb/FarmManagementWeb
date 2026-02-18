import { apiClient } from '../lib/api-client'

/** Pond item from GET /pond?farmId=X */
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

/** Request body for POST /pond (create multiple ponds for a farm). */
export interface CreatePondsRequest {
  farmId: number
  names: string[]
}

/** Request body for PUT /pond/:id (id in path). Optional fields for partial update. */
export interface UpdatePondBody {
  farmId?: number
  name?: string
  status?: string
}

export const pondApi = {
  /**
   * Get list of ponds for a farm. Call when farm is selected/expanded.
   */
  getPondList: async (farmId: number): Promise<PondResponse[]> => {
    return apiClient.get<PondResponse[]>(`/pond?farmId=${farmId}`)
  },

  /**
   * Create multiple ponds for a farm. New ponds have status maintenance. Super admin only.
   */
  createPonds: async (body: CreatePondsRequest): Promise<void> => {
    return apiClient.post<void>('/pond', body)
  },

  /**
   * Update a pond. Id in path; body fields optional for partial update.
   */
  updatePond: async (id: number, body: UpdatePondBody): Promise<void> => {
    return apiClient.put<void>(`/pond/${id}`, body)
  },
}
