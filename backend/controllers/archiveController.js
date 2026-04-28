import { Router } from 'express';
import { loadDocuments, saveDocuments, loadArchiveRefs, saveArchiveRefs } from '../db.js';

const router = Router();

// GET /api/archives
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const orgId = req.auth.organizationId;
    const documents = await loadDocuments();
    const archiveRefs = await loadArchiveRefs();

    const docs = (Array.isArray(documents) ? documents : []).filter(
      (doc) => doc?.organizationId === orgId,
    );
    const refs = (Array.isArray(archiveRefs) ? archiveRefs : []).filter(
      (ref) => ref?.organizationId === orgId,
    );

    if (!userId) {
      res.json(docs);
      return;
    }

    const documentIds = new Set(
      refs.filter((ref) => ref?.creatorId === userId).map((ref) => ref?.documentId),
    );
    const linkedDocs = docs.filter((doc) => documentIds.has(doc?.id));
    const legacyDocs = docs.filter(
      (doc) => doc?.creatorId === userId && !documentIds.has(doc?.id),
    );

    res.json([...linkedDocs, ...legacyDocs]);
  } catch {
    res.status(500).json({ error: 'Failed to load archives' });
  }
});

// POST /api/archives
router.post('/', async (req, res) => {
  try {
    const orgId = req.auth.organizationId;
    const documents = await loadDocuments();
    const archiveRefs = await loadArchiveRefs();

    const docId = Date.now();
    const { structureType, companyName, educator, reference, userId, creatorId, text, ...safeData } = req.body;
    const resolvedCreatorId = userId || creatorId || educator?.id || 'unknown';
    const nowIso = new Date().toISOString();

    const document = {
      id: docId,
      ...safeData,
      status: 'archived',
      creatorId: resolvedCreatorId,
      organizationId: orgId,
      createdAt: nowIso,
      created_at: nowIso,
    };
    const archiveRef = {
      id: `arch_${docId}`,
      creatorId: resolvedCreatorId,
      documentId: docId,
      organizationId: orgId,
      createdAt: nowIso,
      created_at: nowIso,
    };

    documents.unshift(document);
    archiveRefs.unshift(archiveRef);
    await saveDocuments(documents);
    await saveArchiveRefs(archiveRefs);

    res.status(201).json(document);
  } catch (err) {
    console.error('Error saving archive:', err);
    res.status(500).json({ error: 'Failed to save archive' });
  }
});

// DELETE /api/archives/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const orgId = req.auth.organizationId;
    let documents = await loadDocuments();
    let archiveRefs = await loadArchiveRefs();

    const target = documents.find((e) => e.id === id);
    if (target?.organizationId && target.organizationId !== orgId) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

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

export default router;
