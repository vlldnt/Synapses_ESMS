const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Logger middleware
app.use((req, res, next) => {
  console.log(`\n📨 [${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('  Body:', JSON.stringify(req.body, null, 2).substring(0, 500) + '...');
  }

  // Capturer la réponse
  const originalJson = res.json;
  res.json = function(data) {
    console.log(`  ✅ Response: ${res.statusCode}`, JSON.stringify(data).substring(0, 200) + '...');
    return originalJson.call(this, data);
  };

  next();
});

// Chemin du fichier d'archives
const archivePath = path.join(__dirname, 'data', 'historyArchive.json');

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialiser le fichier s'il n'existe pas
if (!fs.existsSync(archivePath)) {
  fs.writeFileSync(archivePath, JSON.stringify([], null, 2));
}

/**
 * GET /api/archive/list
 * Retourne toutes les archives
 */
app.get('/api/archive/list', (req, res) => {
  try {
    const data = fs.readFileSync(archivePath, 'utf-8');
    const archives = JSON.parse(data);
    res.json(archives);
  } catch (err) {
    console.error('Erreur lecture archives:', err);
    res.status(500).json({ error: 'Erreur lecture archives' });
  }
});

/**
 * POST /api/archive/save
 * Sauvegarde une archive
 */
app.post('/api/archive/save', (req, res) => {
  try {
    const archive = req.body;

    if (!archive.id || !archive.filename || !archive.docxBase64) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Lire les archives existantes
    const data = fs.readFileSync(archivePath, 'utf-8');
    let archives = JSON.parse(data);

    // Ajouter ou mettre à jour l'archive
    const existingIndex = archives.findIndex((a) => a.id === archive.id);
    if (existingIndex >= 0) {
      archives[existingIndex] = archive;
    } else {
      archives.unshift(archive);
    }

    // Écrire dans le fichier
    fs.writeFileSync(archivePath, JSON.stringify(archives, null, 2));

    res.json({ success: true, message: 'Archive sauvegardée', archive });
  } catch (err) {
    console.error('Erreur sauvegarde archive:', err);
    res.status(500).json({ error: 'Erreur sauvegarde archive' });
  }
});

/**
 * DELETE /api/archive/:id
 * Supprime une archive
 */
app.delete('/api/archive/:id', (req, res) => {
  try {
    const { id } = req.params;

    const data = fs.readFileSync(archivePath, 'utf-8');
    let archives = JSON.parse(data);

    archives = archives.filter((a) => a.id !== id);

    fs.writeFileSync(archivePath, JSON.stringify(archives, null, 2));

    res.json({ success: true, message: 'Archive supprimée' });
  } catch (err) {
    console.error('Erreur suppression archive:', err);
    res.status(500).json({ error: 'Erreur suppression archive' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur ESMS lancé sur http://localhost:${PORT}`);
  console.log(`📁 Archives stockées dans: ${archivePath}`);
});
