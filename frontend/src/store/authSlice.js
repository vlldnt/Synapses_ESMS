import { createSlice } from '@reduxjs/toolkit';

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLogged: getCookie('isLogged') === 'true',
    isLoading: false,
  },
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setLogged(state, action) {
      state.isLogged = action.payload;
      if (action.payload) {
        setCookie('isLogged', 'true');
      } else {
        deleteCookie('isLogged');
      }
    },
  },
});

export const { setLoading, setLogged } = authSlice.actions;
export default authSlice.reducer;
