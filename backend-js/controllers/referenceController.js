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

// POST /api/references
// - agent: crée une référence liée à lui-même (educator = userId)
// - admin: peut choisir n'importe quel éducateur de la même organisation
router.post('/', requireRole('admin', 'agent'), async (req, res) => {
  try {
    const { role, organizationId, userId } = req.auth;
    const { firstName, lastName, educatorId } = req.body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ error: 'Prénom et nom sont requis.' });
    }

    let assignedEducator;

    if (role === 'agent') {
      assignedEducator = userId;
    } else {
      if (educatorId) {
        const users = await loadJsonFile('users.json');
        const educator = users.find((u) => u.id === educatorId);
        if (!educator) return res.status(400).json({ error: 'Référent introuvable.' });
        if (educator.organization_id !== organizationId) {
          return res.status(403).json({ error: 'Le référent doit appartenir à la même organisation.' });
        }
        assignedEducator = educatorId;
      } else {
        assignedEducator = null;
      }
    }

    const refs = await loadJsonFile('references.json');
    const newRef = {
      id: crypto.randomUUID(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      educator: assignedEducator,
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

// PUT /api/references/:id
// - agent: peut modifier prénom/nom de ses propres références uniquement
// - admin: peut aussi réassigner l'éducateur (validé dans la même organisation)
router.put('/:id', requireRole('admin', 'agent'), async (req, res) => {
  try {
    const { role, organizationId, userId } = req.auth;
    const { firstName, lastName, educatorId } = req.body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ error: 'Prénom et nom sont requis.' });
    }

    const refs = await loadJsonFile('references.json');
    const idx = refs.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Reference not found' });

    const ref = refs[idx];
    if (ref.organization_id !== organizationId) return res.status(403).json({ error: 'Accès refusé.' });

    if (role === 'agent') {
      if (ref.educator !== userId) return res.status(403).json({ error: 'Accès refusé.' });
      refs[idx] = { ...ref, first_name: firstName.trim(), last_name: lastName.trim() };
    } else {
      let assignedEducator = ref.educator;
      if (educatorId !== undefined) {
        if (educatorId) {
          const users = await loadJsonFile('users.json');
          const educator = users.find((u) => u.id === educatorId);
          if (!educator) return res.status(400).json({ error: 'Référent introuvable.' });
          if (educator.organization_id !== organizationId) {
            return res.status(403).json({ error: 'Le référent doit appartenir à la même organisation.' });
          }
          assignedEducator = educatorId;
        } else {
          assignedEducator = null;
        }
      }
      refs[idx] = { ...ref, first_name: firstName.trim(), last_name: lastName.trim(), educator: assignedEducator };
    }

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
