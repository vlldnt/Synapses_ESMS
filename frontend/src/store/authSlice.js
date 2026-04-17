import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentUser } from '../services/user.service';
import { getOrganizationByUser } from '../services/organization.service';

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

/**
 * Charge l'utilisateur courant selon le rôle sélectionné
 * @param {string} role - Le rôle ('agent', 'direction', 'admin')
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (role = 'agent') => {
    const user = await getCurrentUser(role);
    const organization = await getOrganizationByUser(user);
    return { user, organization };
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
    /** @type {import('../types').Organization | null} */
    organization: null,
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
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.organization = action.payload.organization;
    });
  },
});

export const { setLoading, setLogged, setUser, setOrganization } = authSlice.actions;
export default authSlice.reducer;
