import { authFetch } from './authServices';

const API_URL = './api';

const historyCacheByKey = new Map();

function cacheKeyForUser(userId) {
  return userId || '__all__';
}

function getEntryTimestamp(entry) {
  const raw = entry?.created_at || entry?.date;
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
  docxBase64,
  type,
  childName,
  creatorId,
}) {
  const resolvedCreatorId = creatorId || educator?.id || 'unknown';
  const educatorObj = educator || { name: educatorName || '—', id: resolvedCreatorId };
  const displayEducatorName = educatorObj.name || educatorName || '—';

  const entry = {
    status: 'archived',
    filename: filename || `CR_${date || 'intervention'}.docx`,
    display_name:
      displayName ||
      `CRI ${displayEducatorName} ${new Date(date).toLocaleDateString('fr-FR')}`,
    date: date || new Date().toISOString().slice(0, 10),
    intervention_type: interventionType || '—',
    type: type || 'CRI',
    reference_name: childName || '—',
    docx_base_64: docxBase64 || '',
    creator_id: resolvedCreatorId,
    created_at: new Date().toISOString(),
    structure_type: structureType || '—',
    company_name: companyName || '—',
    educator: educatorObj,
    reference: reference || '—',
  };

  try {
    const response = await authFetch(`${API_URL}/archives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const savedEntry = await response.json();

    const userKey = cacheKeyForUser(resolvedCreatorId);
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
