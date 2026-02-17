// Use proxy in dev, env var in prod
const API_BASE_URL = import.meta.env.DEV
  ? '/api/v1'
  : import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined')
}

export interface ApiError {
  code: string
  message: string
  status?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export class HttpError extends Error {
  code: string
  status?: number

  constructor(message: string, code = 'UNKNOWN', status?: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    const response = await fetch(url, config)

    // Redirect on auth failure
    if (response.status === 401) {
      window.location.href = '/login'
      throw new HttpError('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const contentType = response.headers.get('content-type')

    // Non-JSON response
    if (!contentType?.startsWith('application/json')) {
      if (!response.ok) {
        throw new HttpError(
          response.statusText,
          `HTTP_${response.status}`,
          response.status,
        )
      }
      return {} as T
    }

    const payload = (await response.json()) as ApiResponse<T>

    // Backend logical error (200 but success=false)
    if (payload && payload.success === false) {
      throw new HttpError(
        payload.error?.message || 'Request failed',
        payload.error?.code || 'BACKEND_ERROR',
        response.status,
      )
    }

    // HTTP error
    if (!response.ok) {
      throw new HttpError(
        payload.error?.message || response.statusText,
        payload.error?.code || `HTTP_${response.status}`,
        response.status,
      )
    }

    return payload.data as T
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
