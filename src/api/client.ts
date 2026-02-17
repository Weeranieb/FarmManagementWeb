import { apiClient } from '../lib/api-client'

export interface DropdownItem {
  key: number
  value: string
}

export const clientApi = {
  /**
   * Get list of clients for dropdown (id + name). Super admin only.
   */
  getClientList: async (): Promise<DropdownItem[]> => {
    return apiClient.get<DropdownItem[]>('/client/list')
  },
}
