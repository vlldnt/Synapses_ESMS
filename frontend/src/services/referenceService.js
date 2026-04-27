import { authFetch } from './authServices';

const API_URL = './api';

let referencesCache = [];

async function fetchReferences() {
  try {
    const response = await authFetch(`${API_URL}/references`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    referencesCache = await response.json();
    return referencesCache;
  } catch (err) {
    console.warn('Error fetching references:', err);
    return referencesCache;
  }
}

export async function getReferences() {
  if (referencesCache.length === 0) await fetchReferences();
  return referencesCache;
}

export async function getReferenceById(id) {
  const refs = await getReferences();
  return refs.find((r) => r.id === id) || null;
}

export async function getReferencesByEducator(educatorId) {
  const refs = await getReferences();
  return refs.filter((r) => r.educator === educatorId);
}

export async function getReferencesByOrganization(organizationId) {
  const refs = await getReferences();
  return refs.filter((r) => r.organizationId === organizationId);
}

// "Hugo Olivier" → "Hugo O."
export function formatReferenceName(reference) {
  if (!reference?.lastName || !reference?.firstName) return '';
  return `${reference.firstName} ${reference.lastName[0].toUpperCase()}.`;
}

export async function getReferencesFormatted() {
  const refList = await getReferences();
  return refList.map((ref) => ({
    ...ref,
    displayName: formatReferenceName(ref),
  }));
}
