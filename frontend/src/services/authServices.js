import store from '../store/store';
import { setUser, setLogged } from '../store/authSlice';

const API_URL = './api';

export async function login({ email, password }) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Login failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    if (data.user) {
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      // update redux store
      try {
        store.dispatch(setUser(data.user));
        store.dispatch(setLogged(true));
      } catch (e) {
        // ignore if store not available
      }
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
  try {
    store.dispatch(setLogged(false));
    store.dispatch(setUser(null));
  } catch (e) {}
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export function getStoredUser() {
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
}

export default { login, register, logout, getAuthToken, getStoredUser };
