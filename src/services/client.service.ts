import { BaseResponse } from '../models/api/baseResponse'
import { Client } from '../models/schema/client'
import { ClientWithFarms } from '../models/schema/farm'
import api from './apiClient'
import handleResponseError from './handleError'

const getClientApi = async (): Promise<BaseResponse<Client>> => {
  return api
    .get('client')
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const getAllClientsApi = async (): Promise<BaseResponse<Client[]>> => {
  return api
    .get('client/list')
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const getAllClientWithFarmApi = async (): Promise<
  BaseResponse<ClientWithFarms[]>
> => {
  return api
    .get('client/farms')
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const getSingleClientWithFarmApi = async (
  clientId: number
): Promise<BaseResponse<ClientWithFarms[]>> => {
  return api
    .get(`client/${clientId}/farms`)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export {
  getClientApi,
  getAllClientsApi,
  getAllClientWithFarmApi,
  getSingleClientWithFarmApi,
}
