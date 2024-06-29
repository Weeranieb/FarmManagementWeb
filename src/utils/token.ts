import { EXPIRED_DATE } from '../constants/localStorageConstants'

export const checkIsTokenValid = () => {
  const expiredAt = localStorage.getItem(EXPIRED_DATE)
  if (!expiredAt) {
    return false
  }
  const expirationDate = new Date(expiredAt)
  const currentDate = new Date()
  return currentDate < expirationDate
}
