import { createSlice } from '@reduxjs/toolkit';

function getTheme(theme) {
  const themeCookie = document.cookie.match(new RegExp(`(?:^|; )${theme}=([^;]*)`));

  if (themeCookie) {
    return decodeURIComponent(themeCookie[1]);
  } else {
    const isDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    return isDarkMode ? 'dark' : 'light';
  }
}

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: getTheme('theme'),
  },
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
      setCookie('theme', action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
