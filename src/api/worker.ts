import { apiClient } from '../lib/api-client'

export interface WorkerResponse {
  id: number
  clientId: number
  farmGroupId: number
  firstName: string
  lastName: string | null
  contactNumber: string | null
  nationality: string
  salary: number
  hireDate: string | null
  isActive: boolean
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface WorkerPageResponse {
  items: WorkerResponse[]
  total: number
}

export interface CreateWorkerRequest {
  farmGroupId: number
  firstName: string
  lastName?: string | null
  contactNumber?: string | null
  nationality: string
  salary: number
  hireDate?: string | null
}

export interface UpdateWorkerBody {
  id: number
  clientId: number
  farmGroupId: number
  firstName: string
  lastName?: string | null
  contactNumber?: string | null
  nationality: string
  salary: number
  hireDate?: string | null
  isActive: boolean
}

export const workerApi = {
  list: async (
    page: number,
    pageSize: number,
    clientId?: number,
    keyword?: string,
  ): Promise<WorkerPageResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })
    if (clientId != null) params.set('clientId', String(clientId))
    if (keyword) params.set('keyword', keyword)
    return apiClient.get<WorkerPageResponse>(`/worker?${params.toString()}`)
  },

  get: async (id: number): Promise<WorkerResponse> => {
    return apiClient.get<WorkerResponse>(`/worker/${id}`)
  },

  create: async (body: CreateWorkerRequest): Promise<WorkerResponse> => {
    return apiClient.post<WorkerResponse>('/worker', body)
  },

  update: async (body: UpdateWorkerBody): Promise<void> => {
    return apiClient.put<void>('/worker', body)
  },
}
