import store from '../store/store';
import { setUser, setLogged } from '../store/authSlice';
import { setRole } from '../store/roleSlice';

const API_URL = './api';

// Read a specific cookie by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// CSRF token for access-token-protected requests
const getCsrfToken = () => getCookie('csrf_access_token');
// CSRF token for the refresh endpoint (uses a separate cookie)
const getCsrfRefreshToken = () => getCookie('csrf_refresh_token');

// ----- internal refresh (not exported — callers use authFetch which retries) -----
let _refreshPromise = null; // deduplicate concurrent refresh calls

async function _refresh() {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = fetch(`${API_URL}/token/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRF-TOKEN': getCsrfRefreshToken() ?? '' },
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => { _refreshPromise = null; });
  return _refreshPromise;
}

// ----- public API -----

export async function login({ email, password }) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Erreur ${response.status}`);
    }

    const data = await response.json();

    if (data.user) {
      const { is_admin, ...safeUser } = data.user;
      store.dispatch(setUser(safeUser));
      store.dispatch(setRole(safeUser.role || 'agent'));
      store.dispatch(setLogged(true));
    }

    return data;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
}

export async function logout() {
  try {
    await authFetch(`${API_URL}/logout`, { method: 'POST' });
  } catch { /* ignore network errors */ }
  store.dispatch(setLogged(false));
  store.dispatch(setUser(null));
}

// Called on every page load — rehydrates Redux from the HTTP-only cookie.
// If the access token is expired but the refresh token is still valid, refreshes first.
export async function checkAuthStatus() {
  try {
    let response = await fetch(`${API_URL}/me`, { credentials: 'include' });

    if (response.status === 401) {
      const refreshed = await _refresh();
      if (!refreshed) return false;
      response = await fetch(`${API_URL}/me`, { credentials: 'include' });
    }

    if (!response.ok) return false;

    const user = await response.json();
    const { is_admin, ...safeUser } = user;
    store.dispatch(setUser(safeUser));
    store.dispatch(setRole(safeUser.role || 'agent'));
    store.dispatch(setLogged(true));
    return true;
  } catch {
    return false;
  }
}

// Authenticated fetch — sends cookies, adds CSRF header, auto-refreshes on 401.
export async function authFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const needsCsrf = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  const buildHeaders = () => ({
    ...options.headers,
    ...(needsCsrf ? { 'X-CSRF-TOKEN': getCsrfToken() ?? '' } : {}),
  });

  let resp = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: buildHeaders(),
  });

  if (resp.status === 401) {
    const refreshed = await _refresh();
    if (refreshed) {
      // Retry with the new CSRF token minted after refresh
      resp = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: buildHeaders(),
      });
    } else {
      store.dispatch(setLogged(false));
      store.dispatch(setUser(null));
    }
  }

  return resp;
}

export default { login, logout, checkAuthStatus, authFetch };
