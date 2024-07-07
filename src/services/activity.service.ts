import { BaseResponse, ListPage } from '../models/api/baseResponse'
import { Activity } from '../models/schema/activity'
import api from './apiClient'

const getActivityListApi = async (pageOption: {
  page: number
  pageSize: number
  orderBy: string
  keyword?: string
}): Promise<BaseResponse<ListPage<Activity>>> => {
  const url = `activity`
  return api
    .get<BaseResponse<ListPage<Activity>>>(url, {
      params: {
        page: pageOption.page,
        pageSize: pageOption.pageSize,
        orderBy: pageOption.orderBy,
        keyword: pageOption.keyword,
      },
    })
    .then((res) => {
      if (res.data.result) return res.data
      else return {} as BaseResponse<ListPage<Activity>>
    })
}

export { getActivityListApi }
