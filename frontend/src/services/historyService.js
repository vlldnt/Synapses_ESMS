const STORAGE_KEY = 'synapses_history';

export function saveToHistory({ text, reference, date, structureType, interventionType, filename }) {
  const existing = getHistory();
  const entry = {
    id: Date.now(),
    filename,
    reference: reference || '—',
    date: date || new Date().toISOString().slice(0, 10),
    structureType: structureType || '—',
    interventionType: interventionType || '—',
    text,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function deleteFromHistory(id) {
  const updated = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
