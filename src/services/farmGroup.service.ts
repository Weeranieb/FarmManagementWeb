import { BaseResponse } from '../models/api/baseResponse'
import { AddName } from '../models/schema/base'
import { Farm } from '../models/schema/farm'
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

const getFarmByFarmGroupIdApi = async (
  id: number
): Promise<BaseResponse<Farm[]>> => {
  return api
    .get(`farmGroup/${id}/farmList`)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const getFarmGroupApi = async (
  id: number
): Promise<BaseResponse<FarmGroup>> => {
  return api
    .get(`farmGroup/${id}`)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const deleteFarmGroupApi = async (
  id: number
): Promise<BaseResponse<boolean>> => {
  return api
    .delete(`farmGroup/${id}`)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export {
  createFarmGroupApi,
  getAllFarmGroupApi,
  getFarmByFarmGroupIdApi,
  getFarmGroupApi,
  deleteFarmGroupApi,
}
