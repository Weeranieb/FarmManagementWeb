import { apiClient } from '../lib/api-client'

export interface DropdownItem {
  key: number
  value: string
}

export interface CreateClientRequest {
  name: string
  ownerName: string
  contactNumber: string
}

export interface ClientResponse {
  id: number
  name: string
  ownerName: string
  contactNumber: string
  isActive: boolean
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface UpdateClientRequest {
  id: number
  name: string
  ownerName: string
  contactNumber: string
  isActive: boolean
}

export const clientApi = {
  getClientList: async (): Promise<DropdownItem[]> => {
    return apiClient.get<DropdownItem[]>('/client/list')
  },

  getClient: async (id: number): Promise<ClientResponse> => {
    return apiClient.get<ClientResponse>(`/client/${id}`)
  },

  createClient: async (
    body: CreateClientRequest,
  ): Promise<ClientResponse> => {
    return apiClient.post<ClientResponse>('/client', body)
  },

  updateClient: async (
    body: UpdateClientRequest,
  ): Promise<void> => {
    return apiClient.put<void>('/client', body)
  },
}
