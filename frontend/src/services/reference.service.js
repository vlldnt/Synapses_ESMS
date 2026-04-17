const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let referencesCache = [];

/**
 * Fetch references from API
 */
async function fetchReferences() {
  try {
    const response = await fetch(`${API_URL}/api/references`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    referencesCache = await response.json();
    return referencesCache;
  } catch (err) {
    console.warn('Error fetching references:', err);
    return referencesCache;
  }
}

/**
 * Retourne toutes les références (enfants suivis)
 */
export async function getReferences() {
  if (referencesCache.length === 0) {
    await fetchReferences();
  }
  return referencesCache;
}

/**
 * Retourne une référence par ID
 */
export async function getReferenceById(id) {
  const refs = await getReferences();
  return refs.find(r => r.id === id) || null;
}

/**
 * Retourne les références assignées à un éducateur
 */
export async function getReferencesByEducator(educatorId) {
  const refs = await getReferences();
  return refs.filter(r => r.educator === educatorId);
}

/**
 * Retourne les références d'une organisation
 */
export async function getReferencesByOrganization(organizationId) {
  const refs = await getReferences();
  return refs.filter(r => r.organizationId === organizationId);
}

/**
 * Formate le nom d'une référence au format "Prénom I."
 * Ex: Hugo Olivier → "Hugo O."
 */
export function formatReferenceName(reference) {
  if (!reference || !reference.lastName || !reference.firstName) return '';
  const initial = reference.lastName[0].toUpperCase();
  return `${reference.firstName} ${initial}.`;
}

/**
 * Retourne une liste formatée des références
 */
export async function getReferencesFormatted() {
  const refList = await getReferences();
  return refList.map(ref => ({
    ...ref,
    displayName: formatReferenceName(ref)
  }));
}
