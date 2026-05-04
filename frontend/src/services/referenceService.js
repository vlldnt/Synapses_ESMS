import { authFetch } from './authServices';

const BASE = `${import.meta.env.VITE_BASENAME || '/synapses'}/api`;

let referencesCache = null;

async function fetchReferences() {
  const response = await authFetch(`${BASE}/references`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  referencesCache = await response.json();
  return referencesCache;
}

export async function getReferences() {
  if (!referencesCache) await fetchReferences();
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

export async function createReference({ firstName, lastName, educatorId }) {
  const response = await authFetch(`${BASE}/references`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, educatorId }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Erreur ${response.status}`);
  }
  const newRef = await response.json();
  referencesCache = referencesCache ? [...referencesCache, newRef] : [newRef];
  return newRef;
}

export async function deleteReference(id) {
  const response = await authFetch(`${BASE}/references/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Erreur ${response.status}`);
  }
  if (referencesCache) referencesCache = referencesCache.filter((r) => r.id !== id);
}

export function invalidateReferencesCache() {
  referencesCache = null;
}

export function formatReferenceName(reference) {
  if (!reference?.last_name || !reference?.first_name) return '';
  return `${reference.first_name} ${reference.last_name[0].toUpperCase()}.`;
}

export async function getReferencesFormatted() {
  const refList = await getReferences();
  return refList.map((ref) => ({ ...ref, display_name: formatReferenceName(ref) }));
}
