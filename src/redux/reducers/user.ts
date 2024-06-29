import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthorizeResult } from '../../models/schema/auth'
// import { ACCESS_TOKEN_NAME } from "../../constants/localStorageConstants"

const initialState: AuthorizeResult = {
  accessToken: '',
  expiredAt: '',
  user: {
    id: 0,
    clientId: 0,
    username: '',
    firstName: '',
    lastName: '',
    userLevel: 0,
    contactNumber: '',
  },
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthorizeResult>) => {
      state.accessToken = action.payload.accessToken
      state.expiredAt = action.payload.expiredAt
      state.user = action.payload.user
    },
    clearUser: (state) => {
      state.accessToken = ''
      state.expiredAt = ''
      state.user = {
        id: 0,
        clientId: 0,
        username: '',
        firstName: '',
        lastName: '',
        userLevel: 0,
        contactNumber: '',
        delflag: false,
        createdDate: '',
        createdBy: '',
        updatedDate: '',
        updatedBy: '',
      }

      // Clear all user data in localStorage
      // localStorage.removeItem(ACCESS_TOKEN_NAME)
    },
  },
})

export const { setUser, clearUser } = userSlice.actions

export default userSlice.reducer
