import { BaseResponse } from '../models/api/baseResponse'
import { Client } from '../models/schema/client'
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

export { getClientApi }
