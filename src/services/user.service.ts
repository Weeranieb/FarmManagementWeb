import { BaseResponse } from '../models/api/baseResponse'
import { User } from '../models/schema/user'
import api from './apiClient'

const getUserApi = async (): Promise<BaseResponse<User>> => {
  return api.get('user').then((res) => {
    return res.data
  })
}

export { getUserApi }
