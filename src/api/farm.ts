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

/** Pond entry in farm hierarchy (Existing Data view) */
export interface FarmDetailPondItem {
  id: number
  name: string
  status: string
}

/** Farm with nested ponds for GET /farm/hierarchy */
export interface FarmHierarchyItem {
  id: number
  clientId: number
  name: string
  status: string
  ponds: FarmDetailPondItem[]
}

/** Request body for POST /farm (create farm). Super admin only. */
export interface CreateFarmRequest {
  clientId: number
  name: string
}

/** Request body for PUT /farm/:id (id in path). Super admin only. */
export interface UpdateFarmBody {
  name: string
}

/** Response from POST /farm */
export interface FarmResponse {
  id: number
  clientId: number
  name: string
  status: string
  pondCount: number
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

  /**
   * Get farms with nested ponds for the current client (Existing Data view).
   * Super admin may pass clientId to get hierarchy for a specific client.
   */
  getFarmHierarchy: async (clientId?: number): Promise<FarmHierarchyItem[]> => {
    const query = clientId != null ? `?clientId=${clientId}` : ''
    return apiClient.get<FarmHierarchyItem[]>(`/farm/hierarchy${query}`)
  },

  /**
   * Create a new farm. Super admin only.
   */
  createFarm: async (body: CreateFarmRequest): Promise<FarmResponse> => {
    return apiClient.post<FarmResponse>('/farm', body)
  },

  /**
   * Update an existing farm. Super admin only. Id in path.
   */
  updateFarm: async (id: number, body: UpdateFarmBody): Promise<void> => {
    return apiClient.put<void>(`/farm/${id}`, body)
  },
}
