import { configureStore } from '@reduxjs/toolkit'
import user from './reducers/user'

export const store = configureStore({
  reducer: {
    user: user,
    // Add other reducers here if needed
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
