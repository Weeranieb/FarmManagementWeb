import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthorizeResult } from '../../models/schema/auth'
import { User } from '../../models/schema/user'

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
    setToken: (state, action: PayloadAction<Partial<AuthorizeResult>>) => {
      if (action.payload.accessToken !== undefined) {
        state.accessToken = action.payload.accessToken
      }
      if (action.payload.expiredAt !== undefined) {
        state.expiredAt = action.payload.expiredAt
      }
    },
    setUserData: (state, action: PayloadAction<User>) => {
      state.user = action.payload
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
      }
    },
  },
})

export const { setUser, setToken, setUserData, clearUser } = userSlice.actions

export default userSlice.reducer
