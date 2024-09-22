import { BaseResponse } from '../models/api/baseResponse'
import { AddFarmOnFarmGroup } from '../models/schema/farmGroup'
import { FarmOnFarmGroup } from '../models/schema/farmOnFarmGroup'
import api from './apiClient'
import handleResponseError from './handleError'

const createFarmOnFarmGroupApi = async (
  data: AddFarmOnFarmGroup
): Promise<BaseResponse<FarmOnFarmGroup>> => {
  const url = 'farmOnFarmGroup'
  return api
    .post<BaseResponse<FarmOnFarmGroup>>(url, data)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export { createFarmOnFarmGroupApi }
