import { BaseResponse } from '../models/api/baseResponse'
import { Pond } from '../models/schema/pond'
import api from './apiClient'
import handleResponseError from './handleError'

const getPondListApi = async (
  farmId: number
): Promise<BaseResponse<Pond[]>> => {
  return api
    .get(`pond`, { params: { farmId: farmId } })
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export { getPondListApi }
