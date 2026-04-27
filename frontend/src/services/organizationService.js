const API_URL = './api';

let organizationsCache = [];

async function fetchOrganizations() {
  try {
    const response = await fetch(`${API_URL}/organizations`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    organizationsCache = await response.json();
    return organizationsCache;
  } catch (err) {
    console.warn('Error fetching organizations:', err);
    return organizationsCache;
  }
}

export async function getOrganizationById(id) {
  if (organizationsCache.length === 0) await fetchOrganizations();
  return organizationsCache.find((o) => o.id === id) || null;
}

export async function getOrganizationByUser(user) {
  if (organizationsCache.length === 0) await fetchOrganizations();
  return organizationsCache.find((o) => o.id === user.organizationId) || null;
}

export async function getAllOrganizations() {
  if (organizationsCache.length === 0) await fetchOrganizations();
  return organizationsCache;
}
