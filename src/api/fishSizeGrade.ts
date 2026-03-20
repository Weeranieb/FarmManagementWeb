import { apiClient } from '../lib/api-client'

export interface DropdownItem {
  key: number
  value: string
}

export const fishSizeGradeApi = {
  getDropdown: async (): Promise<DropdownItem[]> => {
    return apiClient.get<DropdownItem[]>('/fish-size-grade/dropdown')
  },
}
