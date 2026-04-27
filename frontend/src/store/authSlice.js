import { createSlice } from '@reduxjs/toolkit';
import { getStoredUser } from '../services/authServices';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLogged: !!localStorage.getItem('auth_token'),
    isLoading: false,
    user: getStoredUser(),
    organization: null,
  },
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setLogged(state, action) {
      state.isLogged = action.payload;
      if (!action.payload) {
        state.user = null;
        state.organization = null;
      }
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setOrganization(state, action) {
      state.organization = action.payload;
    },
  },
});

export const { setLoading, setLogged, setUser, setOrganization } = authSlice.actions;
export default authSlice.reducer;
