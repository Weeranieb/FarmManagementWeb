import { BaseResponse } from '../models/api/baseResponse'
import { Pond } from '../models/schema/pond'
import api from './apiClient'

const getPondListApi = async (
  farmId: number
): Promise<BaseResponse<Pond[]>> => {
  return api.get(`pond`, { params: { farmId: farmId } }).then((res) => {
    return res.data
  })
}

export { getPondListApi }
