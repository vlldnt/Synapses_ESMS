import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import roleReducer from './roleSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    role: roleReducer,
  },
});

export default store;
