/**
 * Service pour sauvegarder et récupérer les archives depuis le backend
 */

const BACKEND_URL = 'http://localhost:3001/api/archive';

/**
 * Sauvegarde une archive dans le backend
 */
export async function saveArchiveToBackend(archiveData) {
  try {
    console.log('📤 Envoi vers backend:', BACKEND_URL, archiveData);

    const response = await fetch(`${BACKEND_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(archiveData),
    });

    console.log('📥 Réponse du backend:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Archive sauvegardée au backend:', result);
    return result;
  } catch (err) {
    console.error('❌ Erreur backend:', err.message);
    console.warn('⚠️ Backend non disponible, sauvegarde en localStorage:', err.message);
    // Fallback: sauvegarder en localStorage si le backend n'est pas disponible
    return { success: false, fallback: true, error: err.message };
  }
}

/**
 * Récupère toutes les archives du backend
 */
export async function getArchivesFromBackend() {
  try {
    const response = await fetch(`${BACKEND_URL}/list`);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn('⚠️ Backend non disponible, utilisation des données locales:', err.message);
    return [];
  }
}

/**
 * Supprime une archive du backend
 */
export async function deleteArchiveFromBackend(id) {
  try {
    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    console.log('✓ Archive supprimée du backend');
    return await response.json();
  } catch (err) {
    console.warn('⚠️ Erreur suppression:', err.message);
    return { success: false, error: err.message };
  }
}
