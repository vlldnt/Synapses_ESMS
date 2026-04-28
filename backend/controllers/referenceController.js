import { Router } from 'express';
import crypto from 'crypto';
import { loadJsonFile, saveJsonFile } from '../db.js';

const router = Router();

// GET /api/references — scoped to requester's organization
router.get('/', async (req, res) => {
  try {
    const orgId = req.auth.organizationId;
    const refs = await loadJsonFile('references.json');
    res.json(refs.filter((r) => r.organizationId === orgId));
  } catch {
    res.status(500).json({ error: 'Failed to load references' });
  }
});

// POST /api/references — create a reference in the requester's organization
router.post('/', async (req, res) => {
  const { firstName, lastName, educatorId } = req.body;
  if (!firstName?.trim() || !lastName?.trim()) {
    return res.status(400).json({ error: 'Prénom et nom sont requis.' });
  }

  try {
    const orgId = req.auth.organizationId;
    const refs = await loadJsonFile('references.json');

    const newRef = {
      id: crypto.randomUUID(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      educator: educatorId || null,
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    };

    refs.push(newRef);
    await saveJsonFile('references.json', refs);

    res.status(201).json(newRef);
  } catch (err) {
    console.error('Error creating reference:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/references/:id
router.delete('/:id', async (req, res) => {
  try {
    const orgId = req.auth.organizationId;
    const refs = await loadJsonFile('references.json');
    const target = refs.find((r) => r.id === req.params.id);

    if (!target) return res.status(404).json({ error: 'Référence introuvable.' });
    if (target.organizationId !== orgId) return res.status(403).json({ error: 'Accès refusé.' });

    await saveJsonFile('references.json', refs.filter((r) => r.id !== req.params.id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
