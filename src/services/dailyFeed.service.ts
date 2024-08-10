import { BaseResponse, BooleanResponse } from '../models/api/baseResponse'
import { DailyFeed, DownloadExcelProps } from '../models/schema/dailyFeed'
import api from './apiClient'
import handleResponseError from './handleError'

const downloadExcelForm = async (
  downloadOption: DownloadExcelProps
): Promise<Blob> => {
  const url = `dailyfeed/download`
  try {
    const response = await api.get<Blob>(url, {
      params: {
        type: downloadOption.type,
        date: downloadOption.date,
        farmId: downloadOption.farmId,
        feedId: downloadOption.feedId,
      },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw handleResponseError(error)
  }
}

const uploadExcelForm = async (
  formData: FormData
): Promise<BooleanResponse> => {
  const url = `dailyfeed/upload`
  try {
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log('uploadExcelForm -> response', response)
    const { result, error } = response.data as BooleanResponse

    return {
      result,
      error,
    }
  } catch (error) {
    throw handleResponseError(error)
  }
}

const getDailyFeedByMonth = async (
  feedId: number,
  farmId: number,
  date: string
): Promise<BaseResponse<DailyFeed[]>> => {
  const url = 'dailyfeed'
  try {
    const response = await api.get(url, {
      params: {
        feedId,
        farmId,
        date,
      },
    })
    return response.data
  } catch (error) {
    throw handleResponseError(error)
  }
}

const bulkUploadDailyFeed = async (
  dailyFeeds: DailyFeed[]
): Promise<BooleanResponse> => {
  const url = 'dailyfeed/bulk'
  try {
    const payload = { dailyFeeds }
    const response = await api.put(url, payload)
    const { result, error } = response.data as BooleanResponse

    return {
      result,
      error,
    }
  } catch (error) {
    throw handleResponseError(error)
  }
}

export {
  downloadExcelForm,
  uploadExcelForm,
  getDailyFeedByMonth,
  bulkUploadDailyFeed,
}
