const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let menusCache = [];

/**
 * Fetch menus from API
 */
async function fetchMenus() {
  try {
    const response = await fetch(`${API_URL}/api/menus`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    menusCache = await response.json();
    return menusCache;
  } catch (err) {
    console.warn('Error fetching menus:', err);
    return menusCache;
  }
}

/**
 * Retourne tous les menus
 */
export async function getMenus() {
  if (menusCache.length === 0) {
    await fetchMenus();
  }
  return menusCache;
}

/**
 * Retourne les menus filtrés par rôle
 * @param {string} role - Le rôle de l'utilisateur ('agent', 'direction', 'admin', etc.)
 * @returns {Array} Les menus accessibles pour ce rôle
 */
export async function getMenusByRole(role) {
  const menus = await getMenus();
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
export async function getMenusBySection(role) {
  const filtered = role ? await getMenusByRole(role) : await getMenus();

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
export async function getMenuById(id) {
  const menus = await getMenus();
  return menus.find(m => m.id === id) || null;
}

/**
 * Retourne la route d'un menu
 */
export async function getMenuRoute(menuId) {
  const menu = await getMenuById(menuId);
  return menu ? menu.route : null;
}
