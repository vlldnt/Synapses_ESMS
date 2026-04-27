import { authFetch } from './authServices';

const API_URL = './api';

const historyCacheByKey = new Map();

function cacheKeyForUser(userId) {
  return userId || '__all__';
}

function getEntryTimestamp(entry) {
  const raw = entry?.createdAt || entry?.created_at || entry?.date;
  return new Date(raw).getTime();
}

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
  const educatorObj = educator || {
    name: educatorName || '—',
    id: resolvedUserId,
  };
  const displayEducatorName = educatorObj.name || educatorName || '—';

  const entry = {
    status: 'archived',
    filename: filename || `CR_${date || 'intervention'}.docx`,
    displayName:
      displayName ||
      `CRI ${displayEducatorName} ${new Date(date).toLocaleDateString('fr-FR')}`,
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
    const response = await authFetch(`${API_URL}/archives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const savedEntry = await response.json();

    const userKey = cacheKeyForUser(resolvedUserId);
    historyCacheByKey.set(userKey, [
      savedEntry,
      ...(historyCacheByKey.get(userKey) || []),
    ]);

    const allKey = cacheKeyForUser();
    historyCacheByKey.set(allKey, [
      savedEntry,
      ...(historyCacheByKey.get(allKey) || []),
    ]);

    return savedEntry;
  } catch (err) {
    console.error('Error saving archive:', err);
    throw err;
  }
}

export async function getHistory(userId) {
  const key = cacheKeyForUser(userId);

  try {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    const query = params.toString();

    const response = await authFetch(
      `${API_URL}/archives${query ? `?${query}` : ''}`,
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const archives = await response.json();
    historyCacheByKey.set(key, archives);

    return archives.sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a));
  } catch (err) {
    console.warn('Error fetching archives, falling back to cache:', err);
    const fallback = historyCacheByKey.get(key) || [];
    return fallback.sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a));
  }
}

export async function deleteFromHistory(id) {
  try {
    const response = await authFetch(`${API_URL}/archives/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    for (const [key, entries] of historyCacheByKey.entries()) {
      historyCacheByKey.set(
        key,
        entries.filter((e) => e.id !== id),
      );
    }

    return true;
  } catch (err) {
    console.error('Error deleting archive:', err);
    throw err;
  }
}
