import references from '../data/references.json';

/**
 * Retourne toutes les références (enfants suivis)
 */
export async function getReferences() {
  return references;
}

/**
 * Retourne une référence par ID
 */
export async function getReferenceById(id) {
  return references.find(r => r.id === id) || null;
}

/**
 * Retourne les références assignées à un éducateur
 */
export async function getReferencesByEducator(educatorId) {
  return references.filter(r => r.educator === educatorId);
}

/**
 * Retourne les références d'une organisation
 */
export async function getReferencesByOrganization(organizationId) {
  return references.filter(r => r.organizationId === organizationId);
}

/**
 * Formate le nom d'une référence au format "Prénom I."
 * Ex: Hugo Olivier → "Hugo O."
 */
export function formatReferenceName(reference) {
  if (!reference) return '';
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
