import { Router } from 'express';
import { loadJsonFile, saveJsonFile } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const DEV_USER_IDS = new Set([
  '09eca25d-d955-4136-93f2-4467f2df37eb',
  '3cc14d1c-591d-468b-bad4-bfa0e79b25f4',
  '1c38aaee-4a20-43b3-bb92-92cd4f898dc1',
  'b6f01e00-b5fc-4ad8-98fc-f1dda88f9edf',
]);

async function requireDev(req, res, next) {
  const { userId, role } = req.auth ?? {};
  if (!DEV_USER_IDS.has(userId) || role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé.' });
  }
  try {
    const users = await loadJsonFile('users.json');
    const user = users.find((u) => u.id === userId);
    if (user?.job !== 'Administrateur')
      return res.status(403).json({ error: 'Accès réservé.' });
    next();
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

router.get('/prompts', async (_req, res) => {
  try {
    const prompts = await loadJsonFile('prompts.json');
    res.json(prompts);
  } catch {
    res.status(500).json({ error: 'Failed to load prompts' });
  }
});

router.put('/prompts/:name', requireAuth, requireDev, async (req, res) => {
  const { name } = req.params;
  const { content } = req.body;
  if (typeof content !== 'string')
    return res.status(400).json({ error: 'content requis.' });

  try {
    const prompts = await loadJsonFile('prompts.json');
    const idx = prompts.findIndex((p) => p.name === name);
    if (idx === -1) return res.status(404).json({ error: 'Prompt introuvable.' });

    prompts[idx] = { ...prompts[idx], content };
    await saveJsonFile('prompts.json', prompts);
    res.json(prompts[idx]);
  } catch {
    res.status(500).json({ error: 'Échec de la sauvegarde.' });
  }
});

export default router;
