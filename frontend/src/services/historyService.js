import { authFetch } from './authServices';

const API_URL = `${import.meta.env.VITE_BASENAME || '/synapses'}/api`;

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
  educatorName,
  educatorRole,
  filename,
  displayName,
  content,
  type,
  childName,
  creatorId,
}) {
  const entry = {
    filename: filename || `document_${date || 'archive'}.docx`,
    display_name: displayName || filename || 'Document archivé',
    date: date || new Date().toISOString().slice(0, 10),
    intervention_type: interventionType || '-',
    type: type || 'CRI',
    reference_name: childName || '-',
    content: content || '',
    educator_name: educatorName || '',
    educator_role: educatorRole || '',
    creator_id: creatorId || '',
  };

  const response = await authFetch(`${API_URL}/archives`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const savedEntry = await response.json();

  const userKey = cacheKeyForUser(creatorId);
  historyCacheByKey.set(userKey, [savedEntry, ...(historyCacheByKey.get(userKey) || [])]);
  historyCacheByKey.set('__all__', [savedEntry, ...(historyCacheByKey.get('__all__') || [])]);

  return savedEntry;
}

export async function getHistory(userId) {
  const key = cacheKeyForUser(userId);
  try {
    const params = userId ? `?userId=${userId}` : '';
    const response = await authFetch(`${API_URL}/archives${params}`);
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
  const response = await authFetch(`${API_URL}/archives/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  for (const [key, entries] of historyCacheByKey.entries()) {
    historyCacheByKey.set(key, entries.filter((e) => e.id !== id));
  }
  return true;
}
