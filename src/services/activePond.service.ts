import { BaseResponse } from '../models/api/baseResponse'
import { FarmWithActive } from '../models/schema/activePond'
import api from './apiClient'
import handleResponseError from './handleError'

const getFarmWithActiveApi = async (
  farmId: number
): Promise<BaseResponse<FarmWithActive[]>> => {
  const url = 'activepond'
  return api
    .get(url, {
      params: {
        farmId: farmId,
      },
    })
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export { getFarmWithActiveApi }
