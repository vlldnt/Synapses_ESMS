const STORAGE_KEY = 'synapses_history';

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

export function saveToHistory({
  text,
  date,
  interventionType,
  structureType,
  companyName,
  educatorName,
  filename,
}) {
  const existing = getHistory();
  /** @type {HistoryEntry} */
  const entry = {
    id: Date.now(),
    filename: filename || `CR_${date || 'intervention'}.docx`,
    date: date || new Date().toISOString().slice(0, 10),
    interventionType: interventionType || '—',
    structureType: structureType || '—',
    companyName: companyName || '—',
    educatorName: educatorName || '—',
    text,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
}

/** @returns {HistoryEntry[]} */
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
