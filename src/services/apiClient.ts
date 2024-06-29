import axios from 'axios'
import { API_BASE_URL } from '../constants/envConstants'
import { store } from '../redux/store'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = store.getState().user.accessToken
    if (accessToken) {
      config.headers['Authorization'] = 'Bearer ' + accessToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosInstance
