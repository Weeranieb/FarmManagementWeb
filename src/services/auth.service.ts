import { BaseResponse } from '../models/api/baseResponse'
import { AuthorizeResult } from '../models/schema/auth'
import api from './apiClient'
import handleResponseError from './handleError'

const loginApi = async (
  username: string,
  password: string
): Promise<BaseResponse<AuthorizeResult>> => {
  return api
    .post('auth/login', {
      username,
      password,
    })
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export { loginApi }
