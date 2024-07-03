import { BaseResponse } from '../models/api/baseResponse'
import { Client } from '../models/schema/client'
import api from './apiClient'

const getClientApi = async (): Promise<BaseResponse<Client>> => {
  return api.get('client').then((res) => {
    return res.data
  })
}

export { getClientApi }
