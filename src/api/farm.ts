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

export interface FarmDetailPondItem {
  id: number
  name: string
  status: string
}

export interface FarmHierarchyItem {
  id: number
  clientId: number
  name: string
  status: string
  ponds: FarmDetailPondItem[]
}

export interface CreateFarmRequest {
  clientId: number
  name: string
}

export interface UpdateFarmBody {
  name: string
}

export interface FarmResponse {
  id: number
  clientId: number
  name: string
  status: string
  pondCount: number
}

export interface FarmListResponse {
  farms: FarmResponse[]
  total: number
  totalActive: number
}

export const farmApi = {
  getFarm: async (id: number): Promise<Farm> => {
    return apiClient.get<Farm>(`/farm/${id}`)
  },

  getFarmList: async (clientId?: number): Promise<FarmListResponse> => {
    const query = clientId != null ? `?clientId=${clientId}` : ''
    return apiClient.get<FarmListResponse>(`/farm${query}`)
  },

  getFarms: async (): Promise<Farm[]> => {
    return apiClient.get<Farm[]>('/farm?clientId=1')
  },

  getFarmHierarchy: async (clientId?: number): Promise<FarmHierarchyItem[]> => {
    const query = clientId != null ? `?clientId=${clientId}` : ''
    return apiClient.get<FarmHierarchyItem[]>(`/farm/hierarchy${query}`)
  },

  createFarm: async (body: CreateFarmRequest): Promise<FarmResponse> => {
    return apiClient.post<FarmResponse>('/farm', body)
  },

  updateFarm: async (id: number, body: UpdateFarmBody): Promise<void> => {
    return apiClient.put<void>(`/farm/${id}`, body)
  },
}
