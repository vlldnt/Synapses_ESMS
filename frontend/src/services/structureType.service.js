const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let structureTypesCache = null;

/**
 * Fetch structure types from API
 */
async function fetchStructureTypes() {
  try {
    const response = await fetch(`${API_URL}/api/structure-types`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    structureTypesCache = await response.json();
    return structureTypesCache;
  } catch (err) {
    console.warn('Error fetching structure types:', err);
    return structureTypesCache || { categories: [] };
  }
}

/**
 * Get all structure types
 */
export async function getStructureTypes() {
  if (!structureTypesCache) {
    await fetchStructureTypes();
  }
  return structureTypesCache;
}

/**
 * Get structure type categories
 */
export async function getStructureTypeCategories() {
  const types = await getStructureTypes();
  return types.categories || [];
}
