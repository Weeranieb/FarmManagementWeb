// Example adding authentication token to headers
import axios from 'axios'
// import { getToken } from './authService' // Example function to get authentication token

const baseService = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor
baseService.interceptors.request.use(
  (config) => {
    const token = 'xxx'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default baseService
