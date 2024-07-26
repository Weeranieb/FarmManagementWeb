import { DownloadExcelProps } from '../models/schema/dailyFeed'
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
      responseType: 'blob', // Set response type to 'blob' for binary data
    })
    return response.data
  } catch (error) {
    throw handleResponseError(error)
  }
}

export { downloadExcelForm }
