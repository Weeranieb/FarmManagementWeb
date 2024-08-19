import { BaseResponse } from '../models/api/baseResponse'
import { AddFarm, Farm } from '../models/schema/farm'
import api from './apiClient'
import handleResponseError from './handleError'

const getFarmListApi = async (): Promise<BaseResponse<Farm[]>> => {
  return api
    .get('farm')
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const getFarmApi = async (id: number): Promise<BaseResponse<Farm>> => {
  return api
    .get(`farm/${id}`)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const createFarmApi = async (data: AddFarm): Promise<BaseResponse<Farm>> => {
  const url = 'farm'
  return api
    .post<BaseResponse<Farm>>(url, data)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export { getFarmListApi, getFarmApi, createFarmApi }
