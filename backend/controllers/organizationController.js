import { Router } from 'express';
import { loadJsonFile } from '../db.js';

const router = Router();

// GET /api/organizations — requester's organization only
router.get('/organizations', async (req, res) => {
  try {
    const orgId = req.auth.organizationId;
    const orgs = await loadJsonFile('organizations.json');
    res.json(orgs.filter((o) => o.id === orgId));
  } catch {
    res.status(500).json({ error: 'Failed to load organizations' });
  }
});

// GET /api/prompts — shared across all organizations
router.get('/prompts', async (req, res) => {
  try {
    const prompts = await loadJsonFile('prompts.json');
    res.json(prompts);
  } catch {
    res.status(500).json({ error: 'Failed to load prompts' });
  }
});

// GET /api/reference — shared reference data (singular)
router.get('/reference', async (req, res) => {
  try {
    const ref = await loadJsonFile('reference.json');
    res.json(ref);
  } catch {
    res.status(500).json({ error: 'Failed to load reference' });
  }
});

export default router;
