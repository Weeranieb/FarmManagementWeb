import { BaseResponse } from '../models/api/baseResponse'
import { AddName } from '../models/schema/base'
import { FarmGroup } from '../models/schema/farmGroup'
import api from './apiClient'
import handleResponseError from './handleError'

const createFarmGroupApi = async (
  data: AddName
): Promise<BaseResponse<FarmGroup>> => {
  const url = 'farmGroup'
  return api
    .post<BaseResponse<FarmGroup>>(url, data)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const getAllFarmGroupApi = async (): Promise<BaseResponse<FarmGroup[]>> => {
  return api
    .get('farmGroup')
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export { createFarmGroupApi, getAllFarmGroupApi }
