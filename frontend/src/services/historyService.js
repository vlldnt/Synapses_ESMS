import mockArchive from '../data/historyArchive.json';

const HISTORY_STORAGE_KEY = 'synapses_archived_reports';

// Initialiser mockDb avec les données de historyArchive.json + localStorage
function initializeDb() {
  const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
  const localArchive = stored ? JSON.parse(stored) : [];
  return [...mockArchive, ...localArchive];
}

const mockDb = initializeDb();

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
  docxBase64,
}) {
  /** @type {HistoryEntry & { status: string, reference?: string, modelId?: string, modelName?: string, docxBase64?: string }} */
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
    docxBase64: docxBase64 || '',
    createdAt: new Date().toISOString(),
  };

  mockDb.unshift(entry);

  // Persister dans localStorage
  try {
    // Garder uniquement les archives (pas historyArchive.json initial)
    const localArchives = mockDb.filter((e) => !mockArchive.find((m) => m.id === e.id));
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(localArchives));
  } catch (err) {
    console.warn('Impossible de sauvegarder en localStorage:', err);
  }
}

/** @returns {HistoryEntry[]} */
export function getHistory() {
  return [...mockDb].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function deleteFromHistory(id) {
  const index = mockDb.findIndex((entry) => entry.id === id);
  if (index >= 0) {
    mockDb.splice(index, 1);

    // Mettre à jour localStorage
    try {
      const localArchives = mockDb.filter((e) => !mockArchive.find((m) => m.id === e.id));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(localArchives));
    } catch (err) {
      console.warn('Impossible de mettre à jour localStorage:', err);
    }
  }
}
