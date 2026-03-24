import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLogged: false,
    isLoading: false,
  },
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setLogged(state, action) {
      state.isLogged = action.payload;
    },
  },
});

export const { setLoading, setLogged } = authSlice.actions;
export default authSlice.reducer;
