import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentUser, getCompanyByUser } from '../services/userService';

// ─── Cookie helpers ────────────────────────────────────────────────────────

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

// ─── Thunk : récupère user + company depuis userService ───────────────────

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async () => {
    const user = await getCurrentUser();
    const company = await getCompanyByUser(user);
    return { user, company };
  },
);

// ─── Slice ─────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLogged: getCookie('isLogged') === 'true',
    isLoading: false,
    /** @type {import('../types').User | null} */
    user: null,
    /** @type {import('../types').Company | null} */
    company: null,
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
        state.user = null;
        state.company = null;
      }
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setCompany(state, action) {
      state.company = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.company = action.payload.company;
    });
  },
});

export const { setLoading, setLogged, setUser, setCompany } = authSlice.actions;
export default authSlice.reducer;
