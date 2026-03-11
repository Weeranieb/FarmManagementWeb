import { apiClient } from '../lib/api-client'

export interface MerchantResponse {
  id: number
  name: string
  contactNumber: string
  location: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface CreateMerchantRequest {
  name: string
  contactNumber: string
  location: string
}

export interface UpdateMerchantRequest {
  id: number
  name: string
  contactNumber: string
  location: string
}

export const merchantApi = {
  getMerchantList: async (): Promise<MerchantResponse[]> => {
    return apiClient.get<MerchantResponse[]>('/merchant')
  },

  getMerchant: async (id: number): Promise<MerchantResponse> => {
    return apiClient.get<MerchantResponse>(`/merchant/${id}`)
  },

  createMerchant: async (
    body: CreateMerchantRequest,
  ): Promise<MerchantResponse> => {
    return apiClient.post<MerchantResponse>('/merchant', body)
  },

  updateMerchant: async (body: UpdateMerchantRequest): Promise<void> => {
    return apiClient.put<void>('/merchant', body)
  },

  deleteMerchant: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/merchant/${id}`)
  },
}
