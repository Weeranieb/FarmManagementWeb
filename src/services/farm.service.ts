import { BaseResponse } from '../models/api/baseResponse'
import { Farm } from '../models/schema/farm'
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

export { getFarmListApi }
