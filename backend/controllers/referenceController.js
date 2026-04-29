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

// POST /api/references (disabled)
router.post('/', (req, res) => {
  res.status(403).json({ error: 'References are read-only' });
});

// DELETE /api/references/:id (disabled)
router.delete('/:id', (req, res) => {
  res.status(403).json({ error: 'References are read-only' });
});

export default router;
