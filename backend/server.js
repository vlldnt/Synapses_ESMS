import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import speech from '@google-cloud/speech';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;

// Data file paths
const DOCUMENTS_FILE = path.join(__dirname, 'data', 'documents.json');
const ARCHIVES_FILE = path.join(__dirname, 'data', 'archives.json');
const GOOGLE_KEY_FILE = path.join(__dirname, 'data', 'google-key.json');

// Initialize Google Cloud Speech client
let speechClient;
try {
  speechClient = new speech.SpeechClient({
    keyFilename: GOOGLE_KEY_FILE,
  });
  console.log(`✅ Google Cloud Speech client initialized with: ${GOOGLE_KEY_FILE}`);
} catch (err) {
  console.error(`❌ Failed to initialize Google Cloud Speech client:`, err.message);
}

// Multer setup for audio file handling
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    // Initialize files if they don't exist
    try {
      await fs.access(DOCUMENTS_FILE);
    } catch {
      await fs.writeFile(DOCUMENTS_FILE, '[]', 'utf8');
    }
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
    // Return array for array-based files, object for config files
    const arrayFiles = ['archives.json', 'documents.json', 'users.json', 'organizations.json', 'menus.json', 'dashboardCards.json', 'structureTypes.json', 'references.json'];
    return arrayFiles.includes(filename) ? [] : {};
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

// Load documents from file
async function loadDocuments() {
  return loadJsonFile('documents.json');
}

// Save documents to file
async function saveDocuments(documents) {
  return saveJsonFile('documents.json', documents);
}

// Load archive references from file
async function loadArchiveRefs() {
  return loadJsonFile('archives.json');
}

// Save archive references to file
async function saveArchiveRefs(archiveRefs) {
  return saveJsonFile('archives.json', archiveRefs);
}

// ─── Routes ──────────────────────────────────────────────────────────

// GET /api/archives — Fetch all documents (from documents.json)
app.get('/api/archives', async (req, res) => {
  try {
    const { userId } = req.query;
    const documents = await loadDocuments();
    const archiveRefs = await loadArchiveRefs();

    const docs = Array.isArray(documents) ? documents : [];
    const refs = Array.isArray(archiveRefs) ? archiveRefs : [];

    if (!userId) {
      res.json(docs);
      return;
    }

    // Primary source of truth: archive refs (creatorId -> documentId)
    const documentIds = new Set(
      refs
        .filter((ref) => ref?.creatorId === userId)
        .map((ref) => ref?.documentId),
    );

    const linkedDocs = docs.filter((doc) => documentIds.has(doc?.id));

    // Backward-compatibility for older documents that may not have ref entries yet
    const legacyDocs = docs.filter(
      (doc) => doc?.creatorId === userId && !documentIds.has(doc?.id),
    );

    res.json([...linkedDocs, ...legacyDocs]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load archives' });
  }
});

// POST /api/archives — Save a new document and create archive reference
app.post('/api/archives', async (req, res) => {
  try {
    const documents = await loadDocuments();
    const archiveRefs = await loadArchiveRefs();

    // Create document entry with timestamp-based ID
    const docId = Date.now();
    const {
      structureType,
      companyName,
      educator,
      reference,
      userId,
      creatorId,
      text,
      ...safeData
    } = req.body;

    const resolvedCreatorId = userId || creatorId || educator?.id || 'unknown';

    const nowIso = new Date().toISOString();

    const document = {
      id: docId,
      ...safeData,
      status: 'archived',
      creatorId: resolvedCreatorId,
      createdAt: nowIso,
      created_at: nowIso,
    };

    // Create archive reference (links creatorId to documentId)
    const archiveRef = {
      id: `arch_${docId}`,
      creatorId: resolvedCreatorId,
      documentId: docId,
      createdAt: nowIso,
      created_at: nowIso,
    };

    // Add to beginning of arrays (newest first)
    documents.unshift(document);
    archiveRefs.unshift(archiveRef);

    // Save both files
    await saveDocuments(documents);
    await saveArchiveRefs(archiveRefs);

    res.status(201).json(document);
  } catch (err) {
    console.error('Error saving archive:', err);
    res.status(500).json({ error: 'Failed to save archive' });
  }
});

// DELETE /api/archives/:id — Delete a document and its archive reference
app.delete('/api/archives/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    let documents = await loadDocuments();
    let archiveRefs = await loadArchiveRefs();

    documents = documents.filter((e) => e.id !== id);
    archiveRefs = archiveRefs.filter((e) => e.documentId !== id);

    await saveDocuments(documents);
    await saveArchiveRefs(archiveRefs);

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

// ─── Speech-to-Text ─────────────────────────────────────────────────

// POST /api/transcribe-stream — Transcribe and stream progressive chunks via SSE
app.post('/api/transcribe-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const audioChunks = [];

  req.on('data', (chunk) => {
    audioChunks.push(chunk);
  });

  req.on('end', async () => {
    try {
      const audioBuffer = Buffer.concat(audioChunks);
      if (audioBuffer.length === 0) {
        res.write(`data: ${JSON.stringify({ error: 'No audio' })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }

      const audioBase64 = audioBuffer.toString('base64');
      const request = {
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'fr-FR',
        },
        audio: { content: audioBase64 },
      };

      const [response] = await speechClient.recognize(request);

      if (response.results && response.results.length > 0) {
        for (const result of response.results) {
          const transcript = result.alternatives?.[0]?.transcript || '';
          if (!transcript) continue;

          res.write(
            `data: ${JSON.stringify({ text: transcript, isFinal: result.isFinal })}\n\n`,
          );
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      console.error('❌ Stream transcription error:', err.message || err);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  });

  req.on('error', (err) => {
    console.error('❌ Stream request error:', err);
    res.end();
  });
});

// POST /api/transcribe-audio — Audio transcription (raw binary)
app.post('/api/transcribe-audio', (req, res) => {
  let audioChunks = [];

  req.on('data', (chunk) => {
    audioChunks.push(chunk);
  });

  req.on('end', async () => {
    try {
      const audioBuffer = Buffer.concat(audioChunks);
      if (audioBuffer.length === 0) {
        return res.json({ transcript: '' });
      }

      const audioBase64 = audioBuffer.toString('base64');
      const request = {
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 16000,
          languageCode: 'fr-FR',
        },
        audio: { content: audioBase64 },
      };

      const [response] = await speechClient.recognize(request);

      const transcription = response.results
        ?.map((result) => result.alternatives?.[0]?.transcript)
        ?.filter(Boolean)
        ?.join(' ') || '';

      res.json({ transcript: transcription });
    } catch (err) {
      console.error('❌ Transcription error:', err.message);
      res.status(500).json({ error: 'Transcription failed', message: err.message });
    }
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err);
    res.status(500).json({ error: 'Request failed' });
  });
});

// POST /api/transcribe-audio-upload — Audio transcription (multipart/form-data)
app.post('/api/transcribe-audio-upload', upload.single('file'), async (req, res) => {
  try {
    // Support a mock mode for local emulation: ?mock=1
    if (req.query && (req.query.mock === '1' || req.query.mock === 'true')) {
      return res.json({ transcript: 'Transcription simulée : bonjour ceci est un test' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBuffer = req.file.buffer;

    if (audioBuffer.length === 0) {
      return res.json({ transcript: '' });
    }

    const audioBase64 = audioBuffer.toString('base64');
    const request = {
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 16000,
        languageCode: 'fr-FR',
      },
      audio: { content: audioBase64 },
    };

    const [response] = await speechClient.recognize(request);

    const transcription = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript)
      ?.filter(Boolean)
      ?.join(' ') || '';

    res.json({ transcript: transcription });
  } catch (err) {
    console.error('❌ Transcription (upload) error:', err.message || err);
    res.status(500).json({ error: 'Transcription failed', message: err.message });
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
