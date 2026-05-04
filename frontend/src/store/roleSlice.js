import { createSlice } from '@reduxjs/toolkit';

// Roles: 'admin' | 'direction' | 'agent'
const roleSlice = createSlice({
  name: 'role',
  initialState: { role: 'agent' },
  reducers: {
    setRole: (state, action) => {
      state.role = action.payload;
    },
  },
});

export const { setRole } = roleSlice.actions;
export default roleSlice.reducer;
