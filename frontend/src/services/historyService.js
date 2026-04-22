const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// In-memory cache for instant UI updates
const historyCacheByKey = new Map();

function cacheKeyForUser(userId) {
  return userId || '__all__';
}

function getEntryTimestamp(entry) {
  const raw = entry?.createdAt || entry?.created_at || entry?.date;
  return new Date(raw).getTime();
}

/**
 * @typedef {object} HistoryEntry
 * @property {number}  id
 * @property {string}  filename
 * @property {string}  date             - ISO date de l'intervention
 * @property {string}  interventionType
 * @property {string}  structureType
 * @property {string}  companyName
 * @property {object}  educator         - {name, id}
 * @property {string}  educatorName     - Legacy field (fallback)
 * @property {string}  docxBase64       - Source principale de contenu
 * @property {string}  createdAt        - ISO datetime de création
 */

/**
 * Save a new archive to the backend
 */
export async function saveToHistory({
  date,
  interventionType,
  structureType,
  companyName,
  educatorName,
  educator,
  filename,
  displayName,
  reference,
  modelId,
  modelName,
  docxBase64,
  type,
  childName,
  userId,
  creatorId,
}) {
  const resolvedUserId = userId || creatorId || educator?.id || 'unknown';

  // Use educator object if provided, otherwise create from educatorName
  const educatorObj = educator || { name: educatorName || '—', id: resolvedUserId };
  const displayEducatorName = educatorObj.name || educatorName || '—';

  const entry = {
    status: 'archived',
    filename: filename || `CR_${date || 'intervention'}.docx`,
    displayName: displayName || `CRI ${displayEducatorName} ${new Date(date).toLocaleDateString('fr-FR')}`,
    date: date || new Date().toISOString().slice(0, 10),
    interventionType: interventionType || '—',
    type: type || 'CRI',
    structureType: structureType || '—',
    companyName: companyName || '—',
    educator: educatorObj,
    childName: childName || '—',
    reference: reference || '—',
    modelId: modelId || 'mistralai/voxtral-small-24b-2507',
    modelName: modelName || 'Voxtral Small 24B',
    docxBase64: docxBase64 || '',
    userId: resolvedUserId,
    creatorId: resolvedUserId,
    created_at: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_URL}/api/archives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const savedEntry = await response.json();

    // Update cache for this user and global cache
    const userKey = cacheKeyForUser(resolvedUserId);
    const userCache = historyCacheByKey.get(userKey) || [];
    historyCacheByKey.set(userKey, [savedEntry, ...userCache]);

    const allKey = cacheKeyForUser();
    const allCache = historyCacheByKey.get(allKey) || [];
    historyCacheByKey.set(allKey, [savedEntry, ...allCache]);

    return savedEntry;
  } catch (err) {
    console.error('Error saving archive:', err);
    throw err;
  }
}

/**
 * Fetch user archives from the backend
 */
export async function getHistory(userId) {
  const key = cacheKeyForUser(userId);

  try {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    const query = params.toString();

    const response = await fetch(`${API_URL}/api/archives${query ? `?${query}` : ''}`);

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const archives = await response.json();

    // Update cache
    historyCacheByKey.set(key, archives);

    return archives.sort(
      (a, b) => getEntryTimestamp(b) - getEntryTimestamp(a),
    );
  } catch (err) {
    console.warn('Error fetching archives, falling back to cache:', err);
    // Fallback to cache if backend is unavailable
    const fallback = historyCacheByKey.get(key) || [];
    return fallback.sort(
      (a, b) => getEntryTimestamp(b) - getEntryTimestamp(a),
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

    // Update all caches
    for (const [key, entries] of historyCacheByKey.entries()) {
      historyCacheByKey.set(key, entries.filter((e) => e.id !== id));
    }

    return true;
  } catch (err) {
    console.error('Error deleting archive:', err);
    throw err;
  }
}
