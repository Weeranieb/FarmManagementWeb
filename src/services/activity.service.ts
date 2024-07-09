import { BaseResponse, ListPage } from '../models/api/baseResponse'
import { ActivityList } from '../models/schema/activity'
import api from './apiClient'

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
      else return {} as BaseResponse<ListPage<ActivityList>>
    })
}

export { getActivityListApi }
