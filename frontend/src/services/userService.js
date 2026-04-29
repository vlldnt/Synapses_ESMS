import { authFetch } from './authServices';

const BASE = `${import.meta.env.VITE_BASENAME || '/synapses'}/api`;

export async function getOrgUsers() {
  const response = await authFetch(`${BASE}/users`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return await response.json();
}
