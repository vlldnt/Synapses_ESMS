import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env before any other imports that depend on process.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
try {
  const envPath = path.join(__dirname, '.env');
  readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (key?.trim()) process.env[key.trim()] = rest.join('=').trim();
  });
} catch { /* .env optional */ }

import express from 'express';
import cors from 'cors';
import http from 'http';

import { ensureDataDir } from './db.js';
import { globalAuthGuard } from './middleware/auth.js';
import authRouter from './controllers/authController.js';
import userRouter from './controllers/userController.js';
import archiveRouter from './controllers/archiveController.js';
import referenceRouter from './controllers/referenceController.js';
import organizationRouter from './controllers/organizationController.js';
import audioRouter, { initializeSpeechClient, setupWebSocketTranscription } from './controllers/audioController.js';
import promptsRouter from './controllers/promptsController.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3002;

// ─── Google Speech client ────────────────────────────────────────────
const GOOGLE_KEY_FILE = path.join(__dirname, 'google-key.json');
initializeSpeechClient(GOOGLE_KEY_FILE);

// ─── Core middleware ─────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ─── Global auth guard ───────────────────────────────────────────────
app.use('/api', globalAuthGuard);

// ─── Routers ─────────────────────────────────────────────────────────
app.use('/api', authRouter);
app.use('/api/users', userRouter);
app.use('/api/archives', archiveRouter);
app.use('/api/references', referenceRouter);
app.use('/api', organizationRouter);
app.use('/api', audioRouter);
app.use('/api', promptsRouter);

// ─── Health check ─────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── WebSocket streaming transcription ───────────────────────────────
setupWebSocketTranscription(server);

// ─── Server startup ───────────────────────────────────────────────────
async function start() {
  await ensureDataDir();
  server.listen(PORT, () => {
    console.log(`\n🚀 Synapses ESMS Backend running on http://localhost:${PORT}\n`);
  });
}

start();
