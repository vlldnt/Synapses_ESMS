const API_URL = './api';

let usersCache = [];

/**
 * Map rôles → user IDs
 * Simule la sélection du rôle = connexion avec l'utilisateur correspondant
 */
const ROLE_TO_USER = {
  agent: 'usr_002',      // Thomas Martin
  direction: 'usr_003',  // Laure Lefebvre
  admin: 'usr_001',      // Marie Dupont
};

/**
 * Fetch users from API
 */
async function fetchUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    usersCache = await response.json();
    return usersCache;
  } catch (err) {
    console.warn('Error fetching users:', err);
    return usersCache;
  }
}

/**
 * Retourne l'utilisateur courant connecté selon le rôle
 * @param {string} role - Le rôle de l'utilisateur ('agent', 'direction', 'admin')
 * @returns {Object} L'utilisateur correspondant au rôle
 */
export async function getCurrentUser(role = 'agent') {
  const userId = ROLE_TO_USER[role] || ROLE_TO_USER.agent;
  return getUserById(userId);
}

/**
 * Retourne un utilisateur par ID
 */
export async function getUserById(id) {
  if (usersCache.length === 0) {
    await fetchUsers();
  }
  return usersCache.find(u => u.id === id) || null;
}

/**
 * Retourne tous les utilisateurs
 */
export async function getAllUsers() {
  if (usersCache.length === 0) {
    await fetchUsers();
  }
  return usersCache;
}

/**
 * Retourne les utilisateurs d'une organisation
 */
export async function getUsersByOrganization(organizationId) {
  if (usersCache.length === 0) {
    await fetchUsers();
  }
  return usersCache.filter(u => u.organizationId === organizationId);
}


export async function updateUser(id, updates) {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error(`Update failed: ${response.status}`);

    const updated = await response.json();

    // update local cache if present
    usersCache = usersCache.map(u => (u.id === updated.id ? updated : u));
    return updated;
  } catch (err) {
    console.warn('Error updating user:', err);
    throw err;
  }
}
