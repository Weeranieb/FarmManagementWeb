import { BaseResponse, ListPage } from '../models/api/baseResponse'
import { FeedCollection } from '../models/schema/feed'
import api from './apiClient'
import handleResponseError from './handleError'

const getFeedListApi = async (pageOption: {
  page: number
  pageSize: number
  orderBy: string
  keyword?: string
}): Promise<BaseResponse<ListPage<FeedCollection>>> => {
  const url = `feedcollection`
  return api
    .get<BaseResponse<ListPage<FeedCollection>>>(url, {
      params: {
        page: pageOption.page,
        pageSize: pageOption.pageSize,
        orderBy: pageOption.orderBy,
        keyword: pageOption.keyword,
      },
    })
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res)
    })
    .catch((err) => handleResponseError(err))
}

export { getFeedListApi }
