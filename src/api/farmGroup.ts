import { apiClient } from '../lib/api-client'

export interface FarmGroupFarmItem {
  id: number
  name: string
}

export interface FarmGroupResponse {
  id: number
  clientId: number
  name: string
  farms: FarmGroupFarmItem[]
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface CreateFarmGroupRequest {
  clientId: number
  name: string
  farmIds: number[]
}

export interface UpdateFarmGroupRequest {
  id: number
  name: string
  farmIds: number[]
}

export interface DropdownItem {
  key: number
  value: string
}

export const farmGroupApi = {
  list: async (clientId?: number): Promise<FarmGroupResponse[]> => {
    const query = clientId != null ? `?clientId=${clientId}` : ''
    return apiClient.get<FarmGroupResponse[]>(`/farm-group${query}`)
  },

  get: async (id: number): Promise<FarmGroupResponse> => {
    return apiClient.get<FarmGroupResponse>(`/farm-group/${id}`)
  },

  create: async (body: CreateFarmGroupRequest): Promise<FarmGroupResponse> => {
    return apiClient.post<FarmGroupResponse>('/farm-group', body)
  },

  update: async (body: UpdateFarmGroupRequest): Promise<void> => {
    return apiClient.put<void>('/farm-group', body)
  },

  dropdown: async (clientId?: number): Promise<DropdownItem[]> => {
    const query = clientId != null ? `?clientId=${clientId}` : ''
    return apiClient.get<DropdownItem[]>(`/farm-group/dropdown${query}`)
  },
}
