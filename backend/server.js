import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Data file path
const ARCHIVES_FILE = path.join(__dirname, 'data', 'historyArchive.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    // Initialize file if it doesn't exist
    try {
      await fs.access(ARCHIVES_FILE);
    } catch {
      await fs.writeFile(ARCHIVES_FILE, '[]', 'utf8');
    }
  } catch (err) {
    console.error('Error ensuring data directory:', err);
  }
}

// Generic file loaders
async function loadJsonFile(filename) {
  try {
    const filepath = path.join(__dirname, 'data', filename);
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.warn(`Could not load ${filename}:`, err.message);
    return filename.includes('archive') ? [] : {};
  }
}

async function saveJsonFile(filename, data) {
  try {
    const filepath = path.join(__dirname, 'data', filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error saving ${filename}:`, err);
    throw err;
  }
}

// Load archives from file
async function loadArchives() {
  return loadJsonFile('historyArchive.json');
}

// Save archives to file
async function saveArchives(archives) {
  return saveJsonFile('historyArchive.json', archives);
}

// ─── Routes ──────────────────────────────────────────────────────────

// GET /api/archives — Fetch all archives
app.get('/api/archives', async (req, res) => {
  try {
    const archives = await loadArchives();
    res.json(archives);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load archives' });
  }
});

// POST /api/archives — Save a new archive
app.post('/api/archives', async (req, res) => {
  try {
    const archives = await loadArchives();

    // Create entry with timestamp-based ID
    const entry = {
      id: Date.now(),
      status: 'archived',
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    // Add to beginning of array (newest first)
    archives.unshift(entry);

    // Save updated archives
    await saveArchives(archives);

    res.status(201).json(entry);
  } catch (err) {
    console.error('Error saving archive:', err);
    res.status(500).json({ error: 'Failed to save archive' });
  }
});

// DELETE /api/archives/:id — Delete an archive
app.delete('/api/archives/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    let archives = await loadArchives();

    archives = archives.filter((e) => e.id !== id);
    await saveArchives(archives);

    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting archive:', err);
    res.status(500).json({ error: 'Failed to delete archive' });
  }
});

// ─── Data Routes ────────────────────────────────────────────────────────

// GET /api/users — Load all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await loadJsonFile('users.json');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// GET /api/organizations — Load all organizations
app.get('/api/organizations', async (req, res) => {
  try {
    const orgs = await loadJsonFile('organizations.json');
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load organizations' });
  }
});

// GET /api/menus — Load navigation menus
app.get('/api/menus', async (req, res) => {
  try {
    const menus = await loadJsonFile('menus.json');
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load menus' });
  }
});

// GET /api/prompts — Load AI prompts
app.get('/api/prompts', async (req, res) => {
  try {
    const prompts = await loadJsonFile('prompts.json');
    res.json(prompts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load prompts' });
  }
});

// GET /api/dashboard-cards — Load dashboard card config
app.get('/api/dashboard-cards', async (req, res) => {
  try {
    const cards = await loadJsonFile('dashboardCards.json');
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard cards' });
  }
});

// GET /api/structure-types — Load structure types
app.get('/api/structure-types', async (req, res) => {
  try {
    const types = await loadJsonFile('structureTypes.json');
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load structure types' });
  }
});

// GET /api/references — Load references data
app.get('/api/references', async (req, res) => {
  try {
    const refs = await loadJsonFile('references.json');
    res.json(refs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load references' });
  }
});

// GET /api/reference — Load reference data (singular)
app.get('/api/reference', async (req, res) => {
  try {
    const ref = await loadJsonFile('reference.json');
    res.json(ref);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load reference' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Server startup ──────────────────────────────────────────────────

async function start() {
  await ensureDataDir();

  app.listen(PORT, () => {
    console.log(`\n🚀 Synapses ESMS Backend running on http://localhost:${PORT}`);
    console.log(`📁 Archives stored in: ${ARCHIVES_FILE}\n`);
  });
}

start();
