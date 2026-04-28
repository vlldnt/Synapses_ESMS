import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

const ARRAY_FILES = new Set([
  'archives.json',
  'documents.json',
  'users.json',
  'organizations.json',
  'references.json',
  'organizationRequests.json',
  'userRequests.json',
]);

export async function loadJsonFile(filename) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.warn(`Could not load ${filename}:`, err.message);
    return ARRAY_FILES.has(filename) ? [] : {};
  }
}

export async function saveJsonFile(filename, data) {
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
}

export async function loadDocuments() { return loadJsonFile('documents.json'); }
export async function saveDocuments(d) { return saveJsonFile('documents.json', d); }
export async function loadArchiveRefs() { return loadJsonFile('archives.json'); }
export async function saveArchiveRefs(d) { return saveJsonFile('archives.json', d); }

export async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    for (const file of ['documents.json', 'archives.json']) {
      try {
        await fs.access(path.join(DATA_DIR, file));
      } catch {
        await fs.writeFile(path.join(DATA_DIR, file), '[]', 'utf8');
      }
    }
  } catch (err) {
    console.error('Error ensuring data directory:', err);
  }
}
