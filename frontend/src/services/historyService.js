import mockArchive from '../data/historyArchive.json';

const mockDb = [...mockArchive];

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
  reference,
  modelId,
  modelName,
}) {
  /** @type {HistoryEntry & { status: string, reference?: string, modelId?: string, modelName?: string }} */
  const entry = {
    id: Date.now(),
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
    createdAt: new Date().toISOString(),
  };

  mockDb.unshift(entry);
}

/** @returns {HistoryEntry[]} */
export function getHistory() {
  return [...mockDb].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function deleteFromHistory(id) {
  const index = mockDb.findIndex((entry) => entry.id === id);
  if (index >= 0) mockDb.splice(index, 1);
}
