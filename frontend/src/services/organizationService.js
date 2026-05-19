import { authFetch } from './authServices';

const API_URL = './api';

let organizationsCache = [];
let organizationsPromise = null;

async function fetchOrganizations() {
  if (organizationsCache.length > 0) return organizationsCache;
  if (!organizationsPromise) {
    organizationsPromise = authFetch(`${API_URL}/organizations`)
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        organizationsCache = data;
        return data;
      })
      .catch((err) => {
        organizationsPromise = null;
        console.warn('Error fetching organizations:', err);
        return organizationsCache;
      });
  }
  return organizationsPromise;
}

export async function getOrganizationById(id) {
  if (organizationsCache.length === 0) await fetchOrganizations();
  return organizationsCache.find((o) => o.id === id) || null;
}

export async function getOrganizationByUser(user) {
  if (organizationsCache.length === 0) await fetchOrganizations();
  return organizationsCache.find((o) => o.id === user.organization_id) || null;
}

export async function getAllOrganizations() {
  if (organizationsCache.length === 0) await fetchOrganizations();
  return organizationsCache;
}
