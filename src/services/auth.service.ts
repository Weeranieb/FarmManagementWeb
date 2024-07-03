import { BaseResponse } from '../models/api/baseResponse'
import { AuthorizeResult } from '../models/schema/auth'
import api from './apiClient'

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
      return res.data
    })
}

export { loginApi }
