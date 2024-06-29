import { Navigate, Outlet } from 'react-router-dom'
import { ACCESS_TOKEN_NAME } from '../constants/localStorageConstants'
import { checkIsTokenValid } from '../utils/token'

const PrivateRoute = () => {
  const isAuth = localStorage.getItem(ACCESS_TOKEN_NAME)

  return isAuth && checkIsTokenValid() ? <Outlet /> : <Navigate to='/login' />
}

export default PrivateRoute
