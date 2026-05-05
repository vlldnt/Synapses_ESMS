import { Router } from 'express';
import { loadJsonFile } from '../db.js';

const router = Router();

router.get('/prompts', async (_req, res) => {
  try {
    const prompts = await loadJsonFile('prompts.json');
    res.json(prompts);
  } catch {
    res.status(500).json({ error: 'Failed to load prompts' });
  }
});

export default router;
