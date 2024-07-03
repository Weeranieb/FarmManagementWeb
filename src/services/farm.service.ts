import { BaseResponse } from '../models/api/baseResponse'
import { Farm } from '../models/schema/farm'
import api from './apiClient'

const getFarmListApi = async (): Promise<BaseResponse<Farm[]>> => {
  return api.get('farm').then((res) => {
    return res.data
  })
}

export { getFarmListApi }
