import { BaseResponse } from '../models/api/baseResponse'
import { FarmWithActive } from '../models/schema/activePond'
import api from './apiClient'

const getFarmWithActiveApi = async (
  farmId: number
): Promise<BaseResponse<FarmWithActive[]>> => {
  return api.get(`/activepond/list/${farmId}`).then((res) => {
    return res.data
  })
}

const getAnotherFarmWithActiveApi = async (
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
      return res.data
    })
}

export { getFarmWithActiveApi, getAnotherFarmWithActiveApi }
