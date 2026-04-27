import store from '../store/store';
import { setUser, setLogged } from '../store/authSlice';
import { setRole } from '../store/roleSlice';

const API_URL = './api';

export async function login({ email, password }) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Erreur ${response.status}`);
    }

    const data = await response.json();

    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        store.dispatch(setRole(payload.is_admin ? 'admin' : 'agent'));
      } catch { /* ignore */ }
    }
    if (data.user) {
      const { is_admin, ...safeUser } = data.user;
      localStorage.setItem('auth_user', JSON.stringify(safeUser));
      store.dispatch(setUser(safeUser));
      store.dispatch(setLogged(true));
    }

    return data;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
}

export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  store.dispatch(setLogged(false));
  store.dispatch(setUser(null));
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export function getStoredUser() {
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
}

// fetch avec Authorization header automatique
export function authFetch(url, options = {}) {
  const token = getAuthToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export default { login, logout, getAuthToken, getStoredUser, authFetch };
