import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserProfile } from '../../types/UserProfile'

interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload
      state.loading = false
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const {
  setUser,
  setAuthLoading,
  setAuthError,
} = authSlice.actions

export default authSlice.reducer