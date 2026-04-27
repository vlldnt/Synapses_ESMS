const API_URL = './api';

let structureTypesCache = null;

async function fetchStructureTypes() {
  try {
    const response = await fetch(`${API_URL}/structure-types`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    structureTypesCache = await response.json();
    return structureTypesCache;
  } catch (err) {
    console.warn('Error fetching structure types:', err);
    return structureTypesCache || { categories: [] };
  }
}

export async function getStructureTypes() {
  if (!structureTypesCache) await fetchStructureTypes();
  return structureTypesCache;
}

export async function getStructureTypeCategories() {
  const types = await getStructureTypes();
  return types.categories || [];
}
