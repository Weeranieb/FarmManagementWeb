const API_BASE_URL = import.meta.env.DEV
  ? '/api/v1'
  : import.meta.env.VITE_API_BASE_URL

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }
const HTTP_ERROR_PREFIX = 'HTTP_'

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

type ApiPayload = Record<string, unknown>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export class HttpError extends Error {
  code: string
  status?: number

  constructor(message: string, code = 'UNKNOWN', status?: number) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.status = status
  }
}

class ApiClient {
  private readonly baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private buildConfig(options: RequestInit): RequestInit {
    const isFormData = options.body instanceof FormData
    return {
      credentials: 'include',
      ...options,
      headers: isFormData
        ? { ...(options.headers as Record<string, string> | undefined) }
        : {
            ...DEFAULT_HEADERS,
            ...options.headers,
          },
    }
  }

  private buildHttpErrorCode(status: number): string {
    return `${HTTP_ERROR_PREFIX}${status}`
  }

  private async parseJsonPayload(
    response: Response,
  ): Promise<ApiPayload | null> {
    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('application/json')) {
      return null
    }

    const json = await response.json()
    return isRecord(json) ? json : {}
  }

  private handleUnauthorized(response: Response): void {
    if (response.status !== 401) {
      return
    }

    window.location.href = '/login'
    throw new HttpError('Unauthorized', 'UNAUTHORIZED', 401)
  }

  private throwIfBackendLogicalError(
    payload: ApiPayload,
    status: number,
  ): void {
    if (payload.success === false) {
      const err = isRecord(payload.error)
        ? (payload.error as Partial<ApiError>)
        : undefined
      throw new HttpError(
        err?.message ?? 'Request failed',
        err?.code ?? 'BACKEND_ERROR',
        status,
      )
    }

    const hasCode = typeof payload.code !== 'undefined'
    const hasMessage = typeof payload.message === 'string'
    const isExplicitSuccess = payload.result === true

    if (hasCode && hasMessage && !isExplicitSuccess) {
      throw new HttpError(
        payload.message as string,
        String(payload.code),
        status,
      )
    }
  }

  private throwIfHttpError(
    response: Response,
    payload: ApiPayload | null,
  ): void {
    if (response.ok) {
      return
    }

    const err = isRecord(payload?.error)
      ? (payload?.error as Partial<ApiError>)
      : undefined
    const message =
      (typeof payload?.message === 'string' ? payload.message : undefined) ??
      err?.message ??
      response.statusText
    const code =
      err?.code ??
      (payload?.code != null
        ? String(payload.code)
        : this.buildHttpErrorCode(response.status))

    throw new HttpError(message, code, response.status)
  }

  private serializeBody(body: unknown): string | undefined {
    return body === undefined ? undefined : JSON.stringify(body)
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(
      `${this.baseURL}${endpoint}`,
      this.buildConfig(options),
    )

    this.handleUnauthorized(response)

    const payload = await this.parseJsonPayload(response)

    if (!payload) {
      this.throwIfHttpError(response, null)
      return {} as T
    }

    this.throwIfBackendLogicalError(payload, response.status)
    this.throwIfHttpError(response, payload)

    return payload.data as T
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: this.serializeBody(body),
    })
  }

  postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    })
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: this.serializeBody(body),
    })
  }

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: this.serializeBody(body),
    })
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * GET a binary response (e.g. file export). Triggers browser download on success.
   * Uses the same base URL and credentials as JSON requests.
   */
  async downloadBlob(
    endpoint: string,
    fallbackFilename: string,
  ): Promise<void> {
    const response = await fetch(
      `${this.baseURL}${endpoint}`,
      this.buildConfig({ method: 'GET' }),
    )

    this.handleUnauthorized(response)

    if (!response.ok) {
      const payload = await this.parseJsonPayload(response)
      this.throwIfHttpError(response, payload)
    }

    const blob = await response.blob()
    const cd = response.headers.get('Content-Disposition')
    let filename = fallbackFilename
    const m = cd?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
    if (m) {
      const raw = m[1] ?? m[2]
      try {
        filename = decodeURIComponent(raw)
      } catch {
        filename = raw
      }
    }

    const objectUrl = URL.createObjectURL(blob)
    try {
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
