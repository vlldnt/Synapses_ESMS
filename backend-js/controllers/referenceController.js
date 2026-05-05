import { Router } from 'express';
import crypto from 'crypto';
import { loadJsonFile, saveJsonFile } from '../db.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// GET /api/references (read-only, agent sees own, admin sees all)
router.get('/', async (req, res) => {
  try {
    const { role, organizationId, userId } = req.auth;
    const refs = await loadJsonFile('references.json');
    const orgRefs = refs.filter((r) => r.organization_id === organizationId);

    if (role === 'admin') {
      return res.json(orgRefs);
    }

    res.json(orgRefs.filter((r) => r.educator === userId));
  } catch {
    res.status(500).json({ error: 'Failed to load references' });
  }
});

// POST /api/references (admin only)
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { organizationId } = req.auth;
    const { firstName, lastName, educatorId } = req.body;
    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ error: 'Prénom et nom sont requis.' });
    }
    const refs = await loadJsonFile('references.json');
    const newRef = {
      id: crypto.randomUUID(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      educator: educatorId || null,
      organization_id: organizationId,
      created_at: new Date().toISOString(),
    };
    refs.push(newRef);
    await saveJsonFile('references.json', refs);
    res.status(201).json(newRef);
  } catch {
    res.status(500).json({ error: 'Failed to create reference' });
  }
});

// PUT /api/references/:id (admin only)
router.put('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { organizationId } = req.auth;
    const { firstName, lastName, educatorId } = req.body;
    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ error: 'Prénom et nom sont requis.' });
    }
    const refs = await loadJsonFile('references.json');
    const idx = refs.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Reference not found' });
    if (refs[idx].organization_id !== organizationId) return res.status(403).json({ error: 'Accès refusé.' });
    refs[idx] = { ...refs[idx], first_name: firstName.trim(), last_name: lastName.trim(), educator: educatorId || null };
    await saveJsonFile('references.json', refs);
    res.json(refs[idx]);
  } catch {
    res.status(500).json({ error: 'Failed to update reference' });
  }
});

// DELETE /api/references/:id (admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { organizationId } = req.auth;
    const refs = await loadJsonFile('references.json');
    const target = refs.find((r) => r.id === req.params.id);
    if (!target) return res.status(404).json({ error: 'Reference not found' });
    if (target.organization_id !== organizationId) return res.status(403).json({ error: 'Accès refusé.' });
    await saveJsonFile('references.json', refs.filter((r) => r.id !== req.params.id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete reference' });
  }
});

export default router;
