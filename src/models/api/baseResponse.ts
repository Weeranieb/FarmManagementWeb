export interface BaseResponse<T> {
  data: T
  result: boolean
  error: {
    code: string
    message: string
  }
}

// export interface ListPage<T> {
//   items: Array<T>
//   total: number
// }
