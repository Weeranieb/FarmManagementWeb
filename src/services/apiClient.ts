import axios from 'axios'
import { API_BASE_URL } from '../constants/envConstants'

const axiosInsance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor
// baseService.interceptors.request.use(
//   (config) => {
//     const token = 'xxx'
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

export default axiosInsance
