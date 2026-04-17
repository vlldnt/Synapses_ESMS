import organizations from '../data/organizations.json';

/**
 * Retourne une organisation par ID
 */
export async function getOrganizationById(id) {
  return organizations.find(o => o.id === id) || null;
}

/**
 * Retourne l'organisation associée à un utilisateur
 */
export async function getOrganizationByUser(user) {
  return organizations.find(o => o.id === user.organizationId) || null;
}

/**
 * Retourne toutes les organisations
 */
export async function getAllOrganizations() {
  return organizations;
}
