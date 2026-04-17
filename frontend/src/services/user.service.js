import users from '../data/users.json';

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
  return users.find(u => u.id === id) || null;
}

/**
 * Retourne tous les utilisateurs
 */
export async function getAllUsers() {
  return users;
}

/**
 * Retourne les utilisateurs d'une organisation
 */
export async function getUsersByOrganization(organizationId) {
  return users.filter(u => u.organizationId === organizationId);
}
