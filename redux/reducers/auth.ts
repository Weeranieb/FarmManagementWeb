import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthorizeResult {
  accessToken: string
  accessTokenExpirationDate: string
  refreshToken: string
  idToken: string
}

interface Profile {
  firstname: string
  lastname: string
  contactId: string
  imgUrl: string
}

interface AuthenSvResult {
  profile: Profile
  authorize: AuthorizeResult
}

const initAuthenResult: AuthorizeResult = {
  accessToken: '',
  accessTokenExpirationDate: '',
  refreshToken: '',
  idToken: '',
}

const initialState: AuthenSvResult = {
  profile: {
    firstname: '',
    lastname: '',
    contactId: '',
    imgUrl: '',
  },
  authorize: initAuthenResult,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthenSvResult>) => {
      state.profile = action.payload.profile
      state.authorize = action.payload.authorize
      // Consider if you need to perform side effects within reducers
    },
    clearUser: (state) => {
      state.profile = initialState.profile
      state.authorize = initialState.authorize
      // Consider if you need to perform side effects within reducers
    },
  },
})

export const { setUser, clearUser } = authSlice.actions

export default authSlice.reducer
