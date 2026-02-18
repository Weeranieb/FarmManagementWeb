import { apiClient } from '../lib/api-client'

export interface DropdownItem {
  key: number
  value: string
}

/** Request body for POST /client (create client). Super admin only. */
export interface CreateClientRequest {
  name: string
  ownerName: string
  contactNumber: string
}

/** Client detail from GET /client/:id */
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

/** Body for PUT /client (update client). Send full client. */
export interface UpdateClientRequest {
  id: number
  name: string
  ownerName: string
  contactNumber: string
  isActive: boolean
}

export const clientApi = {
  /**
   * Get list of clients for dropdown (id + name). Super admin only.
   */
  getClientList: async (): Promise<DropdownItem[]> => {
    return apiClient.get<DropdownItem[]>('/client/list')
  },

  /**
   * Get a single client by ID.
   */
  getClient: async (id: number): Promise<ClientResponse> => {
    return apiClient.get<ClientResponse>(`/client/${id}`)
  },

  /**
   * Create a new client. Super admin only.
   */
  createClient: async (
    body: CreateClientRequest,
  ): Promise<ClientResponse> => {
    return apiClient.post<ClientResponse>('/client', body)
  },

  /**
   * Update a client. Send full client object (fetch first then merge).
   */
  updateClient: async (
    body: UpdateClientRequest,
  ): Promise<void> => {
    return apiClient.put<void>('/client', body)
  },
}
