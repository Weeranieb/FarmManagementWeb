import { configureStore } from '@reduxjs/toolkit'
import authReducer from './reducers/auth' // Assuming authSlice is the default export in auth.ts

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here if needed
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
