import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLogged: false,
    isInitialized: false,
    isLoading: false,
    user: null,
    organization: null,
  },
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setInitialized(state) {
      state.isInitialized = true;
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

export const { setLoading, setInitialized, setLogged, setUser, setOrganization } = authSlice.actions;
export default authSlice.reducer;
