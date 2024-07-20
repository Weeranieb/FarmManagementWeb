import { BaseResponse } from '../models/api/baseResponse'
import { User } from '../models/schema/user'
import api from './apiClient'
import handleResponseError from './handleError'

const getUserApi = async (): Promise<BaseResponse<User>> => {
  return api
    .get('user')
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export { getUserApi }
