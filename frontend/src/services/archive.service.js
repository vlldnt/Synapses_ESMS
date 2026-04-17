/**
 * Service pour sauvegarder et récupérer les archives
 * Utilise localStorage uniquement (pas de backend)
 */

const STORAGE_KEY = 'synapses_archives';

/**
 * Simule un délai réseau aléatoire (200-400ms)
 */
const simulateDelay = () => new Promise((resolve) =>
  setTimeout(resolve, 200 + Math.random() * 200)
);

/**
 * Charge les archives depuis localStorage
 */
function loadArchives() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Erreur parsing localStorage archives:', e);
      return [];
    }
  }
  return [];
}

/**
 * Sauvegarde les archives dans localStorage
 */
function saveArchives(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Sauvegarde une archive
 */
export async function saveArchive(archiveData) {
  await simulateDelay();

  const archives = loadArchives();
  const existingIndex = archives.findIndex(a => a.id === archiveData.id);

  if (existingIndex >= 0) {
    // Mise à jour
    archives[existingIndex] = { ...archives[existingIndex], ...archiveData };
  } else {
    // Nouvelle archive
    archives.push(archiveData);
  }

  saveArchives(archives);
  return { success: true, id: archiveData.id };
}

/**
 * Récupère toutes les archives
 */
export async function getArchives() {
  await simulateDelay();
  return loadArchives();
}

/**
 * Récupère une archive par ID
 */
export async function getArchiveById(id) {
  await simulateDelay();
  const archives = loadArchives();
  return archives.find(a => a.id === id) || null;
}

/**
 * Supprime une archive
 */
export async function deleteArchive(id) {
  await simulateDelay();
  const archives = loadArchives();
  const filtered = archives.filter(a => a.id !== id);
  saveArchives(filtered);
  return { success: true };
}

/**
 * Vide toutes les archives
 */
export async function clearArchives() {
  await simulateDelay();
  localStorage.removeItem(STORAGE_KEY);
  return { success: true };
}
