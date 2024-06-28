import { Navigate, Outlet } from 'react-router-dom'
import { ACCESS_TOKEN_NAME } from '../constants/localStorageConstants'

const PrivateRoute = () => {
  const isAuth = localStorage.getItem(ACCESS_TOKEN_NAME)
  // If authorized, return an outlet that will render child elements
  // If not, return element that will navigate to login page
  return isAuth ? <Outlet /> : <Navigate to='/login' />
}

export default PrivateRoute
