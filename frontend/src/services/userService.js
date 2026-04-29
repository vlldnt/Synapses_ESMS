import { authFetch } from './authServices';

const API_URL = './api';

let usersCache = [];

async function fetchUsers() {
  try {
    const response = await authFetch(`${API_URL}/users`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    usersCache = await response.json();
    return usersCache;
  } catch (err) {
    console.warn('Error fetching users:', err);
    return usersCache;
  }
}

export async function getUserById(id) {
  if (usersCache.length === 0) await fetchUsers();
  return usersCache.find((u) => u.id === id) || null;
}

export async function getAllUsers() {
  if (usersCache.length === 0) await fetchUsers();
  return usersCache;
}

export async function getUsersByOrganization(organizationId) {
  if (usersCache.length === 0) await fetchUsers();
  return usersCache.filter((u) => u.organization_id === organizationId);
}

export async function updateUser(id, updates) {
  try {
    const response = await authFetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error(`Update failed: ${response.status}`);

    const updated = await response.json();
    usersCache = usersCache.map((u) => (u.id === updated.id ? updated : u));
    return updated;
  } catch (err) {
    console.warn('Error updating user:', err);
    throw err;
  }
}
