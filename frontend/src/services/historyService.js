const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// In-memory cache for instant UI updates
let historyCache = [];

/**
 * @typedef {object} HistoryEntry
 * @property {number}  id
 * @property {string}  filename
 * @property {string}  date             - ISO date de l'intervention
 * @property {string}  interventionType
 * @property {string}  structureType
 * @property {string}  companyName
 * @property {string}  educatorName
 * @property {string}  text             - Markdown complet du CR
 * @property {string}  createdAt        - ISO datetime de création
 */

/**
 * Save a new archive to the backend
 */
export async function saveToHistory({
  text,
  date,
  interventionType,
  structureType,
  companyName,
  educatorName,
  filename,
  reference,
  modelId,
  modelName,
  docxBase64,
}) {
  const entry = {
    status: 'archived',
    filename: filename || `CR_${date || 'intervention'}.docx`,
    date: date || new Date().toISOString().slice(0, 10),
    interventionType: interventionType || '—',
    structureType: structureType || '—',
    companyName: companyName || '—',
    educatorName: educatorName || '—',
    reference: reference || '—',
    modelId: modelId || 'mistralai/voxtral-small-24b-2507',
    modelName: modelName || 'Voxtral Small 24B',
    text: text || '',
    docxBase64: docxBase64 || '',
  };

  try {
    const response = await fetch(`${API_URL}/api/archives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const savedEntry = await response.json();

    // Update cache
    historyCache.unshift(savedEntry);

    return savedEntry;
  } catch (err) {
    console.error('Error saving archive:', err);
    throw err;
  }
}

/**
 * Fetch all archives from the backend
 */
export async function getHistory() {
  try {
    const response = await fetch(`${API_URL}/api/archives`);

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const archives = await response.json();

    // Update cache
    historyCache = archives;

    return archives.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (err) {
    console.warn('Error fetching archives, falling back to cache:', err);
    // Fallback to cache if backend is unavailable
    return historyCache.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}

/**
 * Delete an archive from the backend
 */
export async function deleteFromHistory(id) {
  try {
    const response = await fetch(`${API_URL}/api/archives/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    // Update cache
    historyCache = historyCache.filter((e) => e.id !== id);

    return true;
  } catch (err) {
    console.error('Error deleting archive:', err);
    throw err;
  }
}
