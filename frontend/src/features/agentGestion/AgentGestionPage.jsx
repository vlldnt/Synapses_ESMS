import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { BookUser, FileText, Plus, Trash2, Download, X, Pencil } from 'lucide-react';
import { getHistory, deleteFromHistory } from '../../services/historyService';
import { getReferences, deleteReference, invalidateReferencesCache } from '../../services/referenceService';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import CreateReferenceModal from '../../components/admin/CreateReferenceModal';
import EditReferenceModal from '../../components/admin/EditReferenceModal';
import { AGENTS } from '../../constants/agents';
import { getDocTypeLabel, getDocColorFromLabel } from '../../utils/docTypeBadge';
import { formatReportName } from '../../utils/reportNameFormatter';
import { triggerDownload } from '../../utils/wordExport';
import { extractPreviewTextFromDocxBase64 } from '../../utils/docxPreview';
import WordPreview from '../../components/WordPreview';

const selectCls =
  'text-xs px-2.5 py-1.5 rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) focus:outline-none cursor-pointer';

function findAgentBadge(entry) {
  const direct = (entry.type || entry.reportType || '').toString().toLowerCase();
  const intervention = (entry.intervention_type || entry.interventionType || '').toString().toLowerCase();
  return AGENTS.find((a) => {
    const id = a.id.toLowerCase();
    if (direct && (direct === id || direct.includes(id))) return true;
    if (intervention && (intervention.includes(id) || intervention.includes(id.replace(/-/g, ' ')))) return true;
    if (direct && direct === (a.badge || '').toLowerCase()) return true;
    return false;
  }) || null;
}

function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}

function DocBadge({ doc }) {
  const agent = findAgentBadge(doc);
  const label = agent ? agent.badge : getDocTypeLabel(doc);
  const color = agent ? agent.color : getDocColorFromLabel(label);
  return (
    <span
      className="inline-flex items-center justify-center px-2 h-5 rounded-full text-[10px] font-bold shrink-0 text-white min-w-9"
      style={{ background: color }}
    >
      {label}
    </span>
  );
}

function AgentGestionPage() {
  const role = useSelector((state) => state.role.role);
  const { user, organization } = useCurrentUser();

  const [activeTab, setActiveTab] = useState('references');
  const [references, setReferences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRefModal, setShowRefModal] = useState(false);
  const [editingRef, setEditingRef] = useState(null);
  const [deletingRefId, setDeletingRefId] = useState(null);

  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [docRefFilter, setDocRefFilter] = useState('all');

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewText, setPreviewText] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);

  useEffect(() => {
    if (role !== 'agent' || !user?.id) return;
    Promise.all([
      getReferences(),
      getHistory(user.id),
    ])
      .then(([refs, docs]) => {
        setReferences(Array.isArray(refs) ? refs : []);
        setDocuments(Array.isArray(docs) ? docs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role, user?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadPreview() {
      if (!selectedDoc) { setPreviewText(''); setIsPreviewLoading(false); return; }
      if (selectedDoc.text?.trim()) { setPreviewText(selectedDoc.text); setIsPreviewLoading(false); return; }
      if (!selectedDoc.docx_base_64) { setPreviewText(''); setIsPreviewLoading(false); return; }
      setIsPreviewLoading(true);
      const extracted = await extractPreviewTextFromDocxBase64(selectedDoc.docx_base_64);
      if (!cancelled) { setPreviewText(extracted); setIsPreviewLoading(false); }
    }
    loadPreview();
    return () => { cancelled = true; };
  }, [selectedDoc]);

  if (role !== 'agent') return <Navigate to='/' replace />;

  const docTypes = [...new Set(documents.map((d) => d.type || d.reportType).filter(Boolean))];

  const filteredDocs = documents.filter((doc) => {
    if (docTypeFilter !== 'all' && (doc.type || doc.reportType) !== docTypeFilter) return false;
    if (docRefFilter !== 'all' && doc.reference_id !== docRefFilter && doc.referenceId !== docRefFilter) return false;
    return true;
  });

  async function handleDeleteRef(id) {
    setDeletingRefId(id);
    try {
      await deleteReference(id);
      setReferences((prev) => prev.filter((r) => r.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeletingRefId(null); }
  }

  async function handleDeleteDoc(id) {
    setDeletingDocId(id);
    try {
      await deleteFromHistory(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch (err) { console.error(err); }
    finally { setDeletingDocId(null); }
  }

  async function handleDownload() {
    if (!selectedDoc?.docx_base_64) return;
    setIsDownloading(true);
    try {
      const binaryString = atob(selectedDoc.docx_base_64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      triggerDownload(blob, selectedDoc.filename);
    } finally { setIsDownloading(false); }
  }

  const tabs = [
    { id: 'references', label: `Mes références (${references.length})` },
    { id: 'documents', label: `Mes documents (${documents.length})` },
  ];

  return (
    <div id='agent-gestion-page' className='h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8'>
      <div className='mx-auto w-full flex flex-col gap-5'>

        <div>
          <h1 className='text-xl md:text-3xl font-semibold text-(--text-primary)'>Gestion</h1>
          {organization?.name && (
            <p className='mt-1 text-xs text-(--text-muted)'>{organization.structure_type && `${organization.structure_type} — `}{organization.name}</p>
          )}
        </div>

        <div className='flex gap-0.5 border-b border-(--border) overflow-x-auto'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-(--bleu-fonce) text-(--bleu-fonce)'
                  : 'border-transparent text-(--text-muted) hover:text-(--text-primary)'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && <p className='text-sm text-(--text-muted) py-10 text-center'>Chargement…</p>}

        {/* ── Références ── */}
        {!loading && activeTab === 'references' && (
          <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm'>
            <div className='px-5 pt-5 pb-3 border-b border-(--border) flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <BookUser size={15} className='text-(--text-muted)' />
                <h2 className='text-sm font-semibold text-(--text-primary)'>Mes références</h2>
              </div>
              <button
                type='button'
                onClick={() => setShowRefModal(true)}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--bleu-fonce) text-white text-xs font-medium hover:bg-(--bleu-active) cursor-pointer transition-colors'
              >
                <Plus size={13} /> Ajouter
              </button>
            </div>
            <div className='divide-y divide-(--border)/50'>
              {references.length === 0 ? (
                <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucune référence assignée.</p>
              ) : references.map((ref) => (
                <div key={ref.id} className='flex items-center gap-3 px-5 py-3.5'>
                  <div className='w-9 h-9 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-sm font-semibold text-(--text-secondary) shrink-0 uppercase'>
                    {ref.first_name?.[0]}{ref.last_name?.[0]}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-(--text-primary)'>{ref.first_name} {ref.last_name}</p>
                    <p className='text-xs text-(--text-muted)'>Ajouté le {new Date(ref.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <button
                    type='button'
                    onClick={() => setEditingRef(ref)}
                    className='p-1.5 rounded-md text-(--text-muted) hover:text-(--bleu-fonce) hover:bg-(--bg-secondary) cursor-pointer transition-colors'
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type='button'
                    disabled={deletingRefId === ref.id}
                    onClick={() => handleDeleteRef(ref.id)}
                    className='p-1.5 rounded-md text-(--text-muted) hover:text-red-500 hover:bg-red-50 disabled:opacity-40 cursor-pointer transition-colors'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Documents ── */}
        {!loading && activeTab === 'documents' && (
          <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden'>
            <div className='px-5 pt-5 pb-3 border-b border-(--border) flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <FileText size={15} className='text-(--text-muted)' />
                <h2 className='text-sm font-semibold text-(--text-primary)'>Mes documents</h2>
              </div>
              <div className='flex gap-2 flex-wrap'>
                <select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)} className={selectCls}>
                  <option value='all'>Tous les types</option>
                  {docTypes.map((t) => {
                    const agent = AGENTS.find((a) => a.id === t);
                    return <option key={t} value={t}>{agent ? agent.badge : getDocTypeLabel({ type: t })}</option>;
                  })}
                </select>
                <select value={docRefFilter} onChange={(e) => setDocRefFilter(e.target.value)} className={selectCls}>
                  <option value='all'>Toutes les références</option>
                  {references.map((r) => (
                    <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`flex ${filteredDocs.length >= 10 ? 'h-130' : ''}`}>
              <div className={`overflow-y-auto divide-y divide-(--border)/50 ${selectedDoc ? 'w-2/5 border-r border-(--border)' : 'w-full'}`}>
                {filteredDocs.length === 0 ? (
                  <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucun document.</p>
                ) : filteredDocs.map((doc) => {
                  const active = selectedDoc?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      type='button'
                      onClick={() => setSelectedDoc(active ? null : doc)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${active ? 'bg-(--bg-secondary)' : 'hover:bg-(--bg-secondary)'}`}
                    >
                      <DocBadge doc={doc} />
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium text-(--text-primary) truncate'>{formatReportName(doc)}</p>
                        <p className='text-[11px] text-(--text-muted) truncate'>{doc.reference_name || doc.reference || '—'}</p>
                      </div>
                      <span className='text-[11px] text-(--text-muted) shrink-0'>{timeAgo(doc.created_at || doc.date)}</span>
                    </button>
                  );
                })}
              </div>

              {selectedDoc && (
                <div className='w-3/5 flex flex-col overflow-hidden'>
                  <div className='px-4 py-3 border-b border-(--border) flex items-center gap-2'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-semibold text-(--text-primary) truncate'>{formatReportName(selectedDoc)}</p>
                      <p className='text-[11px] text-(--text-muted)'>{timeAgo(selectedDoc.created_at || selectedDoc.date)}</p>
                    </div>
                    <button
                      type='button'
                      onClick={handleDownload}
                      disabled={isDownloading || !selectedDoc.docx_base_64}
                      className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-(--bleu-fonce) text-white text-xs font-medium hover:bg-(--bleu-active) disabled:opacity-50 cursor-pointer transition-colors shrink-0'
                    >
                      <Download size={12} />
                      {isDownloading ? '…' : 'Télécharger'}
                    </button>
                    <button
                      type='button'
                      disabled={deletingDocId === selectedDoc.id}
                      onClick={() => handleDeleteDoc(selectedDoc.id)}
                      className='p-1.5 rounded-md text-(--text-muted) hover:text-red-500 hover:bg-red-50 disabled:opacity-40 cursor-pointer transition-colors shrink-0'
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type='button'
                      onClick={() => setSelectedDoc(null)}
                      className='p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) cursor-pointer transition-colors shrink-0'
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className='flex-1 overflow-y-auto p-4 bg-(--bg-secondary)'>
                    <div className='rounded-xl border border-(--border) bg-(--bg-primary) p-4'>
                      {isPreviewLoading ? (
                        <p className='text-sm text-(--text-muted)'>Chargement…</p>
                      ) : previewText ? (
                        <WordPreview text={previewText} />
                      ) : (
                        <p className='text-sm text-(--text-muted)'>Aucun contenu à afficher</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {showRefModal && (
        <CreateReferenceModal
          showEducator={false}
          onClose={() => setShowRefModal(false)}
          onCreated={(newRef) => {
            invalidateReferencesCache();
            setReferences((prev) => [...prev, newRef]);
            setShowRefModal(false);
          }}
        />
      )}

      {editingRef && (
        <EditReferenceModal
          reference={editingRef}
          showEducator={false}
          onClose={() => setEditingRef(null)}
          onUpdated={(updated) => {
            setReferences((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setEditingRef(null);
          }}
        />
      )}
    </div>
  );
}

export default AgentGestionPage;
