import { BaseResponse, ListPage } from '../models/api/baseResponse'
import { ActivityList } from '../models/schema/activity'
import api from './apiClient'
import handleResponseError from './handleError'

const getActivityListApi = async (
  pageOption: {
    page: number
    pageSize: number
    orderBy: string
    keyword?: string
  },
  mode?: string,
  farmId?: number
): Promise<BaseResponse<ListPage<ActivityList>>> => {
  const url = `activity`
  return api
    .get<BaseResponse<ListPage<ActivityList>>>(url, {
      params: {
        page: pageOption.page,
        pageSize: pageOption.pageSize,
        orderBy: pageOption.orderBy,
        keyword: pageOption.keyword,
        mode: mode,
        farmId: farmId,
      },
    })
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

export { getActivityListApi }
