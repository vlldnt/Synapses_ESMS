import menus from '../data/menus.json';

/**
 * Retourne tous les menus
 */
export function getMenus() {
  return menus;
}

/**
 * Retourne les menus filtrés par rôle
 * @param {string} role - Le rôle de l'utilisateur ('agent', 'direction', 'admin', etc.)
 * @returns {Array} Les menus accessibles pour ce rôle
 */
export function getMenusByRole(role) {
  if (!role) return menus;
  return menus.filter(menu =>
    menu.roleAccess && menu.roleAccess.includes(role)
  );
}

/**
 * Retourne les menus groupés par section
 * @param {string} role - Le rôle de l'utilisateur
 * @returns {Object} Objet avec sections comme clés
 */
export function getMenusBySection(role) {
  const filtered = role ? getMenusByRole(role) : menus;

  const grouped = {};
  filtered.forEach(menu => {
    const section = menu.section || 'Menu';
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(menu);
  });

  return grouped;
}

/**
 * Retourne un menu par son ID
 */
export function getMenuById(id) {
  return menus.find(m => m.id === id) || null;
}

/**
 * Retourne la route d'un menu
 */
export function getMenuRoute(menuId) {
  const menu = getMenuById(menuId);
  return menu ? menu.route : null;
}
