import { BaseResponse, ListPage } from '../models/api/baseResponse'
import {
  CreateFeedCollectionRequest,
  CreateFeedCollectionResponse,
  FeedCollection,
} from '../models/schema/feed'
import api from './apiClient'
import handleResponseError from './handleError'

const getFeedPageApi = async (pageOption: {
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

const createFeedCollectionApi = async (
  data: CreateFeedCollectionRequest
): Promise<BaseResponse<CreateFeedCollectionResponse>> => {
  const url = 'feedcollection'
  return api
    .post<BaseResponse<CreateFeedCollectionResponse>>(url, data)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res.data)
    })
    .catch((err) => handleResponseError(err))
}

const getFeedApi = async (
  id: number
): Promise<BaseResponse<FeedCollection>> => {
  const url = `feedcollection/${id}`
  return api
    .get<BaseResponse<FeedCollection>>(url)
    .then((res) => {
      if (res.data.result) return res.data
      else return handleResponseError(res)
    })
    .catch((err) => handleResponseError(err))
}

export { getFeedPageApi as getFeedListApi, createFeedCollectionApi, getFeedApi }
