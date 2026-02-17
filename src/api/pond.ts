import { apiClient } from '../lib/api-client'

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
