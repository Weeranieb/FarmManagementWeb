import { BaseResponse } from '../models/api/baseResponse'
import { Merchant } from '../models/schema/merchant'
import api from './apiClient'
import handleResponseError from './handleError'

const getMerchantListApi = async (): Promise<BaseResponse<Merchant[]>> => {
  return api
    .get('merchant')
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export { getMerchantListApi }
