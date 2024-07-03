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

// axiosInstance.interceptors.response.use(
//   (res) => {
//     return res
//   },
//   async (err) => {
//     const originalConfig = err?.config
//     if (
//       originalConfig?.url !== '/login' &&
//       err?.response &&
//       err?.message !== 'Network Error'
//     ) {
//       // Access Token was expired
//       const errorTokenExpired =
//         err?.response?.data?.Message.indexOf('Token is expired') >= 0 || false
//       const errorCertificateOrSignature =
//         err?.response?.data?.Message.indexOf('Invalid Signing Method') >= 0 ||
//         false
//       const errorUnauthorize =
//         err?.response?.data?.Message.indexOf(
//           'token contains an invalid number of segments'
//         ) >= 0 || false
//       const errorSignature =
//         err?.response?.data?.Message.indexOf(
//           'signature-jwt not even a token'
//         ) >= 0 || false

//       if (
//         err?.response.status === 401 &&
//         errorTokenExpired &&
//         !originalConfig._retry
//       ) {
//         console.log(`Error TokenExpired: ${err?.response?.data?.Message}`)
//         try {
//           const resp = await globalService.getNewToken()
//           console.log(resp)
//           if (resp) {
//             const accessToken = resp
//             originalConfig.headers['Authorization'] = 'Bearer ' + accessToken
//             if (!originalConfig._retry) originalConfig._retry = true

//             return axiosInstance(originalConfig)
//           }
//         } catch (_error) {
//           return Promise.reject(_error)
//         }
//       } else if (
//         (err?.response.status === 401 && errorCertificateOrSignature) ||
//         (err?.response.status === 401 && errorUnauthorize)
//       ) {
//         // if (errorSignature) {
//         //   return Promise.reject(errorSignature)
//         // }
//         console.log(`Error: ${err?.response?.data?.Message}`)
//         await store.dispatch(setErrorMessageAuth(err?.response?.data?.Message))
//       }
//     }

//     return Promise.reject(err)
//   }
// )

export default axiosInstance
