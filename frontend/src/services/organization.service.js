const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let organizationsCache = [];

/**
 * Fetch organizations from API
 */
async function fetchOrganizations() {
  try {
    const response = await fetch(`${API_URL}/api/organizations`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    organizationsCache = await response.json();
    return organizationsCache;
  } catch (err) {
    console.warn('Error fetching organizations:', err);
    return organizationsCache;
  }
}

/**
 * Retourne une organisation par ID
 */
export async function getOrganizationById(id) {
  if (organizationsCache.length === 0) {
    await fetchOrganizations();
  }
  return organizationsCache.find(o => o.id === id) || null;
}

/**
 * Retourne l'organisation associée à un utilisateur
 */
export async function getOrganizationByUser(user) {
  if (organizationsCache.length === 0) {
    await fetchOrganizations();
  }
  return organizationsCache.find(o => o.id === user.organizationId) || null;
}

/**
 * Retourne toutes les organisations
 */
export async function getAllOrganizations() {
  if (organizationsCache.length === 0) {
    await fetchOrganizations();
  }
  return organizationsCache;
}
