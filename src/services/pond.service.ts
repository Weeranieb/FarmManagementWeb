import { BaseResponse, BooleanResponse } from '../models/api/baseResponse'
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

const createPondApi = async (data: Pond): Promise<BaseResponse<Pond>> => {
  const url = 'pond'
  return api
    .post<BaseResponse<Pond>>(url, data)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const updatePondApi = async (data: Pond): Promise<BooleanResponse> => {
  const url = 'pond'
  return api
    .put<BooleanResponse>(url, data)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const deletePondApi = async (id: number): Promise<BooleanResponse> => {
  const url = `pond/${id}`
  return api
    .delete<BooleanResponse>(url)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export { getPondListApi, createPondApi, updatePondApi, deletePondApi }
