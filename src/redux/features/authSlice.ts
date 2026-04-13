import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user } }: PayloadAction<{ user: any }>
    ) => {
      state.user = user;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    setAuthInitialized: (state) => {
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, logout, setAuthInitialized } = authSlice.actions;
export default authSlice.reducer;
