export interface BaseResponse<T> {
  data: T
  result: boolean
  error: ErrorResponse
}

export interface ErrorResponse {
  code: string
  message: string
}

export interface ListPage<T> {
  items: Array<T>
  total: number
}
