import { apiClient } from '../lib/api-client'

export interface Farm {
  id: number
  clientId: number
  code: string
  name: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export const farmApi = {
  /**
   * Get a single farm by ID
   */
  getFarm: async (id: number): Promise<Farm> => {
    return apiClient.get<Farm>(`/farm/${id}`)
  },

  /**
   * Get list of farms for the current client
   */
  getFarms: async (): Promise<Farm[]> => {
    return apiClient.get<Farm[]>('/farm?clientId=1')
  },
}
