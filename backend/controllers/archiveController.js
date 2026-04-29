import { Router } from 'express';
import { loadDocuments, saveDocuments, loadArchiveRefs, saveArchiveRefs } from '../db.js';
import { checkDataAccess } from '../middleware/rbac.js';

const router = Router();

// GET /api/archives
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const { role, organizationId, userId: authUserId } = req.auth;
    const documents = await loadDocuments();
    const archiveRefs = await loadArchiveRefs();

    const docs = (Array.isArray(documents) ? documents : []).filter(
      (doc) => doc?.organization_id === organizationId,
    );
    const refs = (Array.isArray(archiveRefs) ? archiveRefs : []).filter(
      (ref) => ref?.organization_id === organizationId,
    );

    if (userId && role !== 'admin' && userId !== authUserId) {
      return res.status(403).json({ error: 'Cannot view other users archives' });
    }

    const targetUserId = userId || (role === 'admin' ? null : authUserId);

    if (!targetUserId) {
      res.json(docs);
      return;
    }

    const documentIds = new Set(
      refs.filter((ref) => ref?.creator_id === targetUserId).map((ref) => ref?.document_id),
    );
    const linkedDocs = docs.filter((doc) => documentIds.has(doc?.id));
    const legacyDocs = docs.filter(
      (doc) => doc?.creator_id === targetUserId && !documentIds.has(doc?.id),
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
    const { structure_type, company_name, educator, reference, creator_id, text, ...safeData } = req.body;
    const resolvedCreatorId = creator_id || educator?.id || 'unknown';
    const nowIso = new Date().toISOString();

    const document = {
      id: docId,
      ...safeData,
      status: 'archived',
      creator_id: resolvedCreatorId,
      organization_id: orgId,
      created_at: nowIso,
    };
    const archiveRef = {
      id: `arch_${docId}`,
      creator_id: resolvedCreatorId,
      document_id: docId,
      organization_id: orgId,
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
    const { organizationId, userId: authUserId, role } = req.auth;
    let documents = await loadDocuments();
    let archiveRefs = await loadArchiveRefs();

    const target = documents.find((e) => e.id === id);
    if (!target) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (target.organization_id !== organizationId) {
      return res.status(403).json({ error: 'Cannot delete documents from other organizations' });
    }

    if (role !== 'admin' && target.creator_id !== authUserId) {
      return res.status(403).json({ error: 'Can only delete own documents' });
    }

    documents = documents.filter((e) => e.id !== id);
    archiveRefs = archiveRefs.filter((e) => e.document_id !== id);

    await saveDocuments(documents);
    await saveArchiveRefs(archiveRefs);

    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting archive:', err);
    res.status(500).json({ error: 'Failed to delete archive' });
  }
});

export default router;
