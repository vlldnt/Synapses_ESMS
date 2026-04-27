import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from 'ws';
import speech from '@google-cloud/speech';
import multer from 'multer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { Resend } from 'resend';

// load .env manually (no dotenv dependency)
try {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '.env');
  readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (key?.trim()) process.env[key.trim()] = rest.join('=').trim();
  });
} catch { /* .env optional */ }

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL || 'http://localhost:5173/synapses';

function verifyPage(type, message) {
  const colors = { success: '#16a34a', error: '#dc2626', already: '#1294C3' };
  const color = colors[type] || '#1294C3';
  const redirect = type === 'success'
    ? `<p id="redir" style="color:#9ca3af;font-size:13px;margin-top:16px">Redirection dans <span id="count">2</span>s…</p>
       <div class="spinner"></div>
       <script>
         let n=2;
         const c=document.getElementById('count');
         const t=setInterval(()=>{n--;c.textContent=n;if(n<=0){clearInterval(t);window.location.href='/synapses/';}},1000);
       </script>`
    : '';
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Synapses ESMS</title>
  <style>
    body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f3f4f6;}
    .card{background:#fff;border-radius:16px;padding:40px;max-width:420px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08);}
    h2{color:${color};margin-bottom:12px;}p{color:#6b7280;}
    .spinner{width:28px;height:28px;border:3px solid #e5e7eb;border-top-color:${color};border-radius:50%;animation:spin .8s linear infinite;margin:12px auto 0;}
    @keyframes spin{to{transform:rotate(360deg);}}
  </style></head>
  <body><div class="card"><h2>Synapses ESMS</h2><p>${message}</p>${redirect}</div></body></html>`;
}

async function sendVerificationEmail({ firstName, contactEmail, orgName, verifyUrl }) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('xxx')) {
    console.warn('Resend not configured — email skipped.');
    return;
  }
  await resend.emails.send({
    from: 'Synapses ESMS <onboarding@resend.dev>',
    to: contactEmail,
    subject: '📬 Validez votre email — Synapses ESMS',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 0">
        <h2 style="color:#111827">Bonjour ${firstName},</h2>
        <p style="color:#374151">Votre demande d'adhésion pour <strong>${orgName}</strong> a bien été reçue.</p>
        <p style="color:#374151">Pour finaliser la création de votre compte, <strong>validez votre adresse email</strong> en cliquant sur le bouton ci-dessous :</p>
        <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#1294C3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
          ✅ Valider mon email
        </a>
        <p style="color:#6b7280;font-size:13px">Ce lien est valable 24h. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Synapses ESMS · Solution IA pour le secteur social & médico-social</p>
      </div>
    `,
  });
}

async function sendWelcomeEmail({ firstName, contactEmail, orgName }) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('xxx')) return;
  const loginUrl = `${APP_URL}/login`;
  await resend.emails.send({
    from: 'Synapses ESMS <onboarding@resend.dev>',
    to: contactEmail,
    subject: '🎉 Votre compte Synapses ESMS est activé',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 0">
        <h2 style="color:#111827">Bienvenue ${firstName} !</h2>
        <p style="color:#374151">Votre compte pour <strong>${orgName}</strong> a été créé avec succès.</p>
        <p style="color:#374151">Vous pouvez dès maintenant vous connecter :</p>
        <a href="${loginUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#1294C3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
          Se connecter à Synapses
        </a>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Synapses ESMS · Solution IA pour le secteur social & médico-social</p>
      </div>
    `,
  });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3002;

// Data file paths
const DOCUMENTS_FILE = path.join(__dirname, 'data', 'documents.json');
const ARCHIVES_FILE = path.join(__dirname, 'data', 'archives.json');
const GOOGLE_KEY_FILE = path.join(__dirname, 'google-key.json');

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
    const arrayFiles = ['archives.json', 'documents.json', 'users.json', 'organizations.json', 'structureTypes.json', 'references.json', 'organizationRequests.json'];
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

// ─── Auth middleware ─────────────────────────────────────────────────

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token manquant.' });
  try {
    req.auth = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

// ─── Global auth guard — toutes les routes /api/* sauf login et join request ──

// paths relatifs à /api (app.use('/api') strip le préfixe dans req.path)
app.use('/api', (req, res, next) => {
  const path = req.path;
  const method = req.method;
  const isPublic =
    (method === 'POST' && path === '/login') ||
    (method === 'POST' && path === '/organization-requests') ||
    (method === 'GET' && path === '/structure-types') ||
    (method === 'GET' && path.startsWith('/organization-requests/verify/'));
  if (isPublic) return next();
  requireAuth(req, res, next);
});

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

// PUT /api/users/:id — Update a user
app.put('/api/users/:id', async (req, res) => {
  try {
    const users = await loadJsonFile('users.json');
    const idx = users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    users[idx] = { ...users[idx], ...req.body, id: users[idx].id };
    await saveJsonFile('users.json', users);
    res.json(users[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// POST /api/login — Authenticate with email + password (bcrypt + JWT)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

  try {
    const users = await loadJsonFile('users.json');
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) return res.status(401).json({ error: 'Identifiants incorrects.' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Compte inactif.' });

    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects.' });

    const { hashedPassword, ...safeUser } = user;
    const token = jwt.sign({ userId: user.id, organizationId: user.organizationId, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
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


// GET /api/prompts — Load AI prompts
app.get('/api/prompts', async (req, res) => {
  try {
    const prompts = await loadJsonFile('prompts.json');
    res.json(prompts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load prompts' });
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

// ─── Organization join requests ─────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;

app.post('/api/organization-requests', async (req, res) => {
  const { orgName, structureType, firstName, lastName, contactEmail, password, _hp, _t } = req.body;

  if (_hp) return res.status(400).json({ error: 'Requête invalide.' });

  if (!_t || Date.now() - _t < 3000) {
    return res.status(400).json({ error: 'Soumission trop rapide.' });
  }

  if (!orgName?.trim() || !structureType?.trim() || !firstName?.trim() || !lastName?.trim() || !contactEmail?.trim() || !password) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }

  if (!EMAIL_REGEX.test(contactEmail)) {
    return res.status(400).json({ error: 'Adresse email invalide.' });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({ error: 'Mot de passe invalide.' });
  }

  if (orgName.length > 100 || structureType.length > 80 || firstName.length > 50 || lastName.length > 50 || contactEmail.length > 150) {
    return res.status(400).json({ error: 'Un champ dépasse la longueur maximale autorisée.' });
  }

  try {
    const [requests, existingUsers] = await Promise.all([
      loadJsonFile('organizationRequests.json'),
      loadJsonFile('users.json'),
    ]);

    if (existingUsers.find((u) => u.email.toLowerCase() === contactEmail.toLowerCase())) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const entry = {
      id: crypto.randomUUID(),
      orgName: orgName.trim(),
      structureType: structureType.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      contactEmail: contactEmail.toLowerCase().trim(),
      hashedPassword,
      status: 'pending_verification',
      verificationToken,
      verificationExpiry,
      createdAt: new Date().toISOString(),
    };

    requests.push(entry);
    await saveJsonFile('organizationRequests.json', requests);

    const verifyUrl = `${APP_URL}/api/organization-requests/verify/${verificationToken}`;

    sendVerificationEmail({ firstName, lastName, contactEmail, orgName, verifyUrl }).catch((err) =>
      console.error('Email send error:', err.message),
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error saving organization request:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/organization-requests/verify/:token — Verify email and notify admin
app.get('/api/organization-requests/verify/:token', async (req, res) => {
  try {
    const requests = await loadJsonFile('organizationRequests.json');
    const idx = requests.findIndex((r) => r.verificationToken === req.params.token);

    if (idx === -1) {
      return res.status(400).send(verifyPage('error', 'Lien invalide ou déjà utilisé.'));
    }

    const request = requests[idx];

    if (request.status !== 'pending_verification') {
      return res.send(verifyPage('already', 'Votre email a déjà été vérifié.'));
    }

    if (new Date(request.verificationExpiry) < new Date()) {
      return res.status(400).send(verifyPage('error', 'Ce lien a expiré. Veuillez soumettre une nouvelle demande.'));
    }

    const [users, orgs] = await Promise.all([
      loadJsonFile('users.json'),
      loadJsonFile('organizations.json'),
    ]);

    const orgId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const newOrg = {
      id: orgId,
      name: request.orgName,
      structureType: request.structureType,
      description: '',
      ownerId: userId,
      createdAt: new Date().toISOString(),
    };

    const newUser = {
      id: userId,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.contactEmail,
      hashedPassword: request.hashedPassword,
      job: 'Administrateur',
      organizationId: orgId,
      is_admin: true,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    orgs.push(newOrg);
    users.push(newUser);

    requests[idx] = { ...request, status: 'approved', verificationToken: null, approvedAt: new Date().toISOString() };

    await Promise.all([
      saveJsonFile('organizations.json', orgs),
      saveJsonFile('users.json', users),
      saveJsonFile('organizationRequests.json', requests),
    ]);

    sendWelcomeEmail({ firstName: request.firstName, contactEmail: request.contactEmail, orgName: request.orgName }).catch((err) =>
      console.error('Welcome email error:', err.message),
    );

    res.send(verifyPage('success', 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.'));
  } catch (err) {
    res.status(500).send(verifyPage('error', 'Erreur serveur.'));
  }
});

// POST /api/organization-requests/:id/approve — Validate request → create Org + admin User
app.post('/api/organization-requests/:id/approve', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const requests = await loadJsonFile('organizationRequests.json');
    const request = requests.find((r) => r.id === requestId);

    if (!request) return res.status(404).json({ error: 'Demande introuvable.' });
    if (request.status !== 'pending') return res.status(409).json({ error: 'Demande déjà traitée.' });

    const users = await loadJsonFile('users.json');
    const orgs = await loadJsonFile('organizations.json');

    // ensure contact email is not already a user
    if (users.find((u) => u.email.toLowerCase() === request.contactEmail)) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà.' });
    }

    const { firstName, lastName } = request;

    const tempPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const orgId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const newOrg = {
      id: orgId,
      name: request.orgName,
      structureType: request.structureType,
      description: request.description || '',
      ownerId: userId,
      createdAt: new Date().toISOString(),
    };

    const newUser = {
      id: userId,
      firstName,
      lastName,
      email: request.contactEmail,
      hashedPassword,
      job: 'Administrateur',
      organizationId: orgId,
      is_admin: true,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    orgs.push(newOrg);
    users.push(newUser);

    // mark request as approved
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status: 'approved', approvedAt: new Date().toISOString() } : r,
    );

    await Promise.all([
      saveJsonFile('organizations.json', orgs),
      saveJsonFile('users.json', users),
      saveJsonFile('organizationRequests.json', updatedRequests),
    ]);

    res.status(201).json({
      organization: newOrg,
      user: { ...newUser, hashedPassword: undefined },
      tempPassword, // à transmettre par email en production
    });
  } catch (err) {
    console.error('Error approving organization request:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ─── Speech-to-Text ─────────────────────────────────────────────────

// POST /api/transcribe-chunk — Transcribe a single short audio chunk (fast, synchronous)
app.post('/api/transcribe-chunk', (req, res) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', async () => {
    try {
      const buffer = Buffer.concat(chunks);
      if (buffer.length === 0) return res.json({ text: '' });

      const [response] = await speechClient.recognize({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'fr-FR',
          enableAutomaticPunctuation: true,
        },
        audio: { content: buffer.toString('base64') },
      });

      const text =
        response.results
          ?.map((r) => r.alternatives?.[0]?.transcript)
          ?.filter(Boolean)
          ?.join(' ') || '';

      res.json({ text });
    } catch (err) {
      console.error('❌ Chunk transcription error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
  req.on('error', () => res.status(500).json({ error: 'Request error' }));
});

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

// ─── WebSocket streaming transcription ───────────────────────────────
// Each WS connection gets its own Google streamingRecognize stream.
// Protocol:
//   client → text  { type: 'start', lang: 'fr-FR' }   begin session
//   client → binary  <Int16 PCM at 16kHz>              audio frames
//   client → text  { type: 'stop' }                    end session
//   server → text  { type: 'interim', text }           partial result
//   server → text  { type: 'final',   text }           stable result
//   server → text  { type: 'error',   message }        error

const STREAM_RESTART_MS = 270_000; // restart before Google 5-min hard limit

const wss = new WebSocketServer({ server, path: '/api/transcribe-ws' });

wss.on('connection', (ws) => {
  let recognizeStream = null;
  let restartTimer = null;
  let isActive = false;
  let lang = 'fr-FR';

  function send(obj) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
  }

  function closeGoogleStream() {
    clearTimeout(restartTimer);
    if (recognizeStream) {
      try { recognizeStream.end(); } catch { /* ignore */ }
      recognizeStream = null;
    }
  }

  function openGoogleStream() {
    if (!speechClient) {
      send({ type: 'error', message: 'Speech client unavailable — check google-key.json' });
      return;
    }
    try {
      recognizeStream = speechClient.streamingRecognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: lang,
          enableAutomaticPunctuation: true,
          model: 'latest_long',
        },
        interimResults: true, // top-level, outside config
      });

      recognizeStream.on('data', (data) => {
        const result = data.results?.[0];
        if (!result) return;
        const text = result.alternatives?.[0]?.transcript?.trim();
        if (!text) return;
        send({ type: result.isFinal ? 'final' : 'interim', text });
      });

      recognizeStream.on('error', (err) => {
        console.error('❌ streamingRecognize error:', err.message);
        recognizeStream = null;
        if (isActive) {
          send({ type: 'error', message: err.message });
          setTimeout(openGoogleStream, 500);
        }
      });

      recognizeStream.on('end', () => {
        recognizeStream = null;
        if (isActive) openGoogleStream();
      });

      // Proactive restart before the 5-min Google limit
      restartTimer = setTimeout(() => {
        if (isActive) {
          closeGoogleStream();
          openGoogleStream();
        }
      }, STREAM_RESTART_MS);

    } catch (err) {
      console.error('❌ Failed to open streamingRecognize:', err.message);
      send({ type: 'error', message: err.message });
    }
  }

  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      if (recognizeStream && isActive) {
        try { recognizeStream.write(data); } catch { /* stream may be restarting */ }
      }
    } else {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'start') {
          lang = msg.lang || 'fr-FR';
          isActive = true;
          openGoogleStream();
        } else if (msg.type === 'stop') {
          isActive = false;
          closeGoogleStream();
        }
      } catch { /* ignore malformed frames */ }
    }
  });

  ws.on('close', () => { isActive = false; closeGoogleStream(); });
  ws.on('error', () => { isActive = false; closeGoogleStream(); });
});

// ─── Server startup ──────────────────────────────────────────────────

async function start() {
  await ensureDataDir();

  server.listen(PORT, () => {
    console.log(`\n🚀 Synapses ESMS Backend running on http://localhost:${PORT}`);
    console.log(`📁 Archives stored in: ${ARCHIVES_FILE}\n`);
  });
}

start();
