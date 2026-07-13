import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userData: null,
  isAuthLoading: true,
  authError: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
      state.isAuthLoading = false
      state.authError = null
    },
    authFailed: (state, action) => {
      state.userData = null
      state.isAuthLoading = false
      state.authError = action.payload
    },
    clearAuth: (state) => {
      state.userData = null
      state.isAuthLoading = false
      state.authError = null
    },
  },
})

export const { setUserData, authFailed, clearAuth } = userSlice.actions

export default userSlice.reducer