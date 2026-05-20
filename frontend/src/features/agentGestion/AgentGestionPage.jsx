import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { BookUser, FileText, Plus, Download, X, Pencil, ChevronRight } from 'lucide-react';
import { getHistory } from '../../services/historyService';
import { getReferences, invalidateReferencesCache, formatReferenceName } from '../../services/referenceService';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import CreateReferenceModal from '../../components/admin/CreateReferenceModal';
import EditReferenceModal from '../../components/admin/EditReferenceModal';
import { AGENTS } from '../../constants/agents';
import { getDocTypeLabel, getDocColorFromLabel } from '../../utils/docTypeBadge';
import { formatReportName } from '../../utils/reportNameFormatter';
import { extractPreviewTextFromDocxBase64 } from '../../utils/docxPreview';
import WordPreview from '../../components/WordPreview';
import { useDocumentDownload } from '../../hooks/useDocumentDownload';
import DownloadLoadingModal from '../../components/DownloadLoadingModal';
import DownloadToast from '../../components/DownloadToast';

const selectCls =
  'text-[11px] px-1.5 py-1 rounded-md border border-(--border) bg-(--bg-secondary) text-(--text-primary) focus:outline-none cursor-pointer min-w-0 flex-1';

const WORD_BTN = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium disabled:opacity-50 cursor-pointer transition-opacity';
const PDF_BTN  = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium disabled:opacity-50 cursor-pointer transition-opacity';
const WORD_STYLE = { background: 'linear-gradient(135deg, #0B46DB, #3093F1)' };
const PDF_STYLE  = { background: '#EA0E00' };

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
      className="inline-flex items-center justify-center w-14 h-5 rounded-full text-[10px] font-bold shrink-0 text-white"
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

  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [docRefFilter, setDocRefFilter] = useState('all');

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [modalAllSizes, setModalAllSizes] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [selectedRef, setSelectedRef] = useState(null);
  const previewRef = useRef(null);
  const mobilePreviewRef = useRef(null);
  const { handleDownload, isLoading: isDownloading, toast: downloadToast, clearToast } = useDocumentDownload();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key !== 'Escape') return;
      if (showDocModal) { closeDocModal(); return; }
      if (selectedRef) { setSelectedRef(null); return; }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showDocModal, selectedRef]);

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
    if (docRefFilter !== 'all' && doc.reference_name?.trim() !== docRefFilter) return false;
    return true;
  });

  function openDocModal(doc, allSizes = false) {
    setSelectedDoc(doc);
    setShowDocModal(true);
    setModalAllSizes(allSizes);
  }

  function closeDocModal() {
    setShowDocModal(false);
    setModalAllSizes(false);
    if (modalAllSizes) setSelectedDoc(null);
  }

  function selectDoc(doc) {
    setSelectedDoc(selectedDoc?.id === doc.id ? null : doc);
  }

  const tabs = [
    { id: 'references', label: `Mes références (${references.length})` },
    { id: 'documents', label: `Mes documents (${documents.length})` },
  ];

  const docPreviewContent = (ref) => (
    isPreviewLoading
      ? <p className='text-sm text-(--text-muted)'>Chargement…</p>
      : previewText
        ? <WordPreview text={previewText} />
        : <p className='text-sm text-(--text-muted)'>Aucun contenu à afficher</p>
  );

  return (
    <div id='agent-gestion-page' className='h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8'>
      <DownloadLoadingModal isOpen={isDownloading} />
      <DownloadToast filename={downloadToast} onClose={clearToast} />
      <div className='mx-auto w-full flex flex-col gap-5'>

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
          <div
            className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden flex flex-col'
            style={{ height: 'calc(100vh - 220px)', minHeight: '480px' }}
          >
            {/* Desktop : 3 colonnes identiques à Mes documents */}
            <div className='hidden md:flex flex-1 overflow-hidden'>

              {/* Col 1 : liste des références */}
              <div className={`flex flex-col shrink-0 border-r border-(--border) ${selectedRef ? 'w-[24%]' : 'w-full'}`}>
                <div className='px-5 pt-5 pb-3 border-b border-(--border) flex items-center gap-2 shrink-0'>
                  <BookUser size={15} className='text-(--text-muted)' />
                  <h2 className='text-sm font-semibold text-(--text-primary)'>Mes références</h2>
                </div>
                <button
                  type='button'
                  onClick={() => setShowRefModal(true)}
                  className='flex items-center gap-2 px-4 py-3 border-b border-(--border)/50 text-xs font-medium text-(--bleu-fonce) hover:bg-(--bleu-fonce)/5 cursor-pointer transition-colors shrink-0'
                >
                  <Plus size={13} /> Ajouter une référence
                </button>
                <div className='flex-1 overflow-y-auto divide-y divide-(--border)/50'>
                  {references.length === 0 ? (
                    <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucune référence assignée.</p>
                  ) : references.map((ref) => {
                    const active = selectedRef?.id === ref.id;
                    return (
                      <div
                        key={ref.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-(--bg-secondary)' : 'hover:bg-(--bg-secondary)'}`}
                        onClick={() => setSelectedRef(active ? null : ref)}
                      >
                        <div className='w-8 h-8 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-xs font-semibold text-(--text-secondary) shrink-0 uppercase'>
                          {ref.first_name?.[0]}{ref.last_name?.[0]}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs font-medium text-(--text-primary) truncate'>{ref.first_name} {ref.last_name}</p>
                        </div>
                        <button
                          type='button'
                          onClick={(e) => { e.stopPropagation(); setEditingRef(ref); }}
                          className='p-1.5 rounded-md text-(--text-muted) hover:text-(--bleu-fonce) hover:bg-(--bg-secondary) cursor-pointer transition-colors shrink-0'
                        >
                          <Pencil size={13} />
                        </button>
                        <ChevronRight size={12} className={`shrink-0 text-(--text-muted) transition-transform ${active ? 'rotate-90' : ''}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Col 2 : documents de la référence sélectionnée */}
              {selectedRef && (() => {
                const refFormatted = formatReferenceName(selectedRef);
                const refDocs = documents.filter((d) => d.reference_name?.trim() === refFormatted);
                return (
                  <div className='flex-1 flex flex-col overflow-hidden'>
                    <div className='px-5 pt-5 pb-3 border-b border-(--border) flex items-center justify-between shrink-0'>
                      <div className='flex items-center gap-2'>
                        <FileText size={15} className='text-(--text-muted)' />
                        <h2 className='text-sm font-semibold text-(--text-primary)'>
                          Documents de {selectedRef.first_name} {selectedRef.last_name}
                          <span className='ml-1.5 text-(--text-muted) font-normal text-xs'>({refDocs.length})</span>
                        </h2>
                      </div>
                      <button type='button' onClick={() => setSelectedRef(null)} className='p-1 rounded text-(--text-muted) hover:text-(--text-primary) cursor-pointer'>
                        <X size={13} />
                      </button>
                    </div>
                    <div className='flex-1 overflow-y-auto divide-y divide-(--border)/50'>
                      {refDocs.length === 0 ? (
                        <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucun document pour cette référence.</p>
                      ) : refDocs.map((doc) => (
                        <button
                          key={doc.id}
                          type='button'
                          onClick={() => openDocModal(doc, true)}
                          className='w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-(--bg-secondary) transition-colors cursor-pointer'
                        >
                          <DocBadge doc={doc} />
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-medium text-(--text-primary) truncate'>{formatReportName(doc)}</p>
                            <p className='text-[11px] text-(--text-muted)'>{timeAgo(doc.created_at || doc.date)}</p>
                          </div>
                          <ChevronRight size={12} className='text-(--text-muted) shrink-0' />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Mobile : liste refs */}
            <div className='md:hidden flex-1 overflow-y-auto divide-y divide-(--border)/50'>
              <button
                type='button'
                onClick={() => setShowRefModal(true)}
                className='w-full flex items-center gap-2 px-4 py-3.5 text-xs font-medium text-(--bleu-fonce) hover:bg-(--bleu-fonce)/5 cursor-pointer transition-colors'
              >
                <Plus size={13} /> Ajouter une référence
              </button>
              {references.length === 0 ? (
                <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucune référence assignée.</p>
              ) : references.map((ref) => (
                <div
                  key={ref.id}
                  className='flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-(--bg-secondary) transition-colors'
                  onClick={() => setSelectedRef(ref)}
                >
                  <div className='w-9 h-9 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-sm font-semibold text-(--text-secondary) shrink-0 uppercase'>
                    {ref.first_name?.[0]}{ref.last_name?.[0]}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-(--text-primary)'>{ref.first_name} {ref.last_name}</p>
                    {ref.created_at && (
                      <p className='text-xs text-(--text-muted)'>Ajouté le {new Date(ref.created_at).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                  <button
                    type='button'
                    onClick={(e) => { e.stopPropagation(); setEditingRef(ref); }}
                    className='p-1.5 rounded-md text-(--text-muted) hover:text-(--bleu-fonce) cursor-pointer shrink-0'
                  >
                    <Pencil size={13} />
                  </button>
                  <ChevronRight size={13} className='text-(--text-muted) shrink-0' />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom sheet mobile : documents d'une référence */}
        {selectedRef && (() => {
          const refFormatted = formatReferenceName(selectedRef);
          const refDocs = documents.filter((d) =>
            d.reference_name?.trim() === refFormatted
          );
          return (
            <div
              className='md:hidden fixed inset-0 z-50 bg-black/50 flex flex-col justify-end'
              onClick={() => setSelectedRef(null)}
            >
              <div
                className='bg-(--bg-primary) rounded-t-2xl flex flex-col max-h-[80vh]'
                onClick={(e) => e.stopPropagation()}
              >
                <div className='px-4 py-3 border-b border-(--border) flex items-center justify-between shrink-0'>
                  <p className='text-sm font-semibold text-(--text-primary)'>
                    {selectedRef.first_name} {selectedRef.last_name}
                    <span className='ml-1.5 text-xs text-(--text-muted) font-normal'>({refDocs.length} doc{refDocs.length !== 1 ? 's' : ''})</span>
                  </p>
                  <button type='button' onClick={() => setSelectedRef(null)} className='p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) cursor-pointer'>
                    <X size={15} />
                  </button>
                </div>
                <div className='overflow-y-auto divide-y divide-(--border)/50 flex-1'>
                  {refDocs.length === 0 ? (
                    <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucun document pour cette référence.</p>
                  ) : refDocs.map((doc) => (
                    <button
                      key={doc.id}
                      type='button'
                      onClick={() => { setSelectedRef(null); openDocModal(doc, true); }}
                      className='w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-(--bg-secondary) transition-colors cursor-pointer'
                    >
                      <DocBadge doc={doc} />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-(--text-primary) truncate'>{formatReportName(doc)}</p>
                        <p className='text-xs text-(--text-muted)'>{timeAgo(doc.created_at || doc.date)}</p>
                      </div>
                      <ChevronRight size={13} className='text-(--text-muted) shrink-0' />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Documents ── */}
        {!loading && activeTab === 'documents' && (
          <div
            className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden flex'
            style={{ height: 'calc(100vh - 220px)', minHeight: '480px' }}
          >
            {/* ── Colonne gauche : header + liste ── */}
            <div className={`flex flex-col shrink-0 w-full ${selectedDoc ? 'md:w-[24%] md:border-r md:border-(--border)' : ''}`}>
              <div className='px-5 pt-5 pb-3 border-b border-(--border) flex flex-col gap-3 shrink-0'>
                <div className='flex items-center gap-2'>
                  <FileText size={15} className='text-(--text-muted)' />
                  <h2 className='text-sm font-semibold text-(--text-primary)'>Mes documents</h2>
                </div>
                <div className='flex gap-2'>
                  <select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)} className={selectCls}>
                    <option value='all'>Tous les types</option>
                    {docTypes.map((t) => {
                      const agent = AGENTS.find((a) => a.id === t);
                      return <option key={t} value={t}>{agent ? agent.badge : getDocTypeLabel({ type: t })}</option>;
                    })}
                  </select>
                  <select value={docRefFilter} onChange={(e) => setDocRefFilter(e.target.value)} className={selectCls}>
                    <option value='all'>Toutes les références</option>
                    {references.map((r) => {
                      const formatted = formatReferenceName(r);
                      return <option key={r.id} value={formatted}>{formatted}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div className='flex-1 overflow-y-auto divide-y divide-(--border)/50'>
                {filteredDocs.length === 0 ? (
                  <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucun document.</p>
                ) : filteredDocs.map((doc) => {
                  const active = selectedDoc?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      type='button'
                      onClick={() => selectDoc(doc)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${active ? 'bg-(--bg-secondary)' : 'hover:bg-(--bg-secondary)'}`}
                    >
                      <DocBadge doc={doc} />
                      <div className='flex-1 min-w-0'>
                        <p className={`text-xs truncate text-(--text-primary) ${active ? 'font-semibold' : 'font-medium'}`}>{formatReportName(doc)}</p>
                        <p className='text-[11px] text-(--text-muted) truncate'>{doc.reference_name || doc.reference || '-'}</p>
                      </div>
                      <span className='text-[11px] text-(--text-muted) shrink-0'>{timeAgo(doc.created_at || doc.date)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Colonne droite (desktop md+ uniquement) ── */}
            {selectedDoc && (
              <div className='hidden md:flex flex-1 flex-col overflow-hidden'>
                {/* Header aligné : nom fichier + Word + PDF + Fermer */}
                <div className='px-5 pt-5 pb-3 border-b border-(--border) flex items-center gap-2 shrink-0'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-(--text-primary) truncate'>{formatReportName(selectedDoc)}</p>
                    <p className='text-[11px] text-(--text-muted)'>{timeAgo(selectedDoc.created_at || selectedDoc.date)}</p>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleDownload('word', selectedDoc)}
                    disabled={isDownloading || !selectedDoc.docx_base_64}
                    className={WORD_BTN}
                    style={WORD_STYLE}
                  >
                    <Download size={12} /> Word
                  </button>
                  <button
                    type='button'
                    onClick={() => handleDownload('pdf', selectedDoc, previewRef.current)}
                    disabled={isDownloading || !selectedDoc.docx_base_64}
                    className={PDF_BTN}
                    style={PDF_STYLE}
                  >
                    <Download size={12} /> PDF
                  </button>
                  <button
                    type='button'
                    onClick={() => setSelectedDoc(null)}
                    className='p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) cursor-pointer transition-colors shrink-0'
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Contenu scrollable */}
                <div className='flex-1 overflow-y-auto p-4 bg-(--bg-secondary)'>
                  <div ref={previewRef} className='rounded-xl border border-(--border) bg-(--bg-primary) p-4'>
                    {docPreviewContent(previewRef)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Modal preview document (style Archives) ── */}
      {showDocModal && selectedDoc && (
        <div
          className='fixed inset-0 z-50 bg-black/55 backdrop-blur-[1px] flex flex-col justify-end md:p-6 md:justify-start'
          onClick={(e) => e.target === e.currentTarget && closeDocModal()}
        >
          <div className='bg-(--bg-primary) rounded-t-2xl border border-(--border) shadow-2xl overflow-hidden flex flex-col max-h-[92vh] md:mx-auto md:w-full md:max-w-5xl md:h-full md:rounded-2xl'>
            <div className='px-4 py-3 border-b border-(--border) flex items-center gap-3'>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-(--text-primary) truncate'>{formatReportName(selectedDoc)}</p>
                <p className='text-xs text-(--text-muted)'>Aperçu en lecture seule · téléchargement uniquement</p>
              </div>
              <button
                type='button'
                onClick={() => handleDownload('word', selectedDoc)}
                disabled={isDownloading || !selectedDoc.docx_base_64}
                className={`${WORD_BTN} shrink-0`}
                style={WORD_STYLE}
              >
                <Download size={12} /> Word
              </button>
              <button
                type='button'
                onClick={() => handleDownload('pdf', selectedDoc, mobilePreviewRef.current)}
                disabled={isDownloading || !selectedDoc.docx_base_64}
                className={`${PDF_BTN} shrink-0`}
                style={PDF_STYLE}
              >
                <Download size={12} /> PDF
              </button>
              <button
                type='button'
                onClick={closeDocModal}
                className='w-8 h-8 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) flex items-center justify-center cursor-pointer shrink-0'
                aria-label='Fermer'
              >
                <X size={15} />
              </button>
            </div>
            <div className='flex-1 overflow-y-auto p-4 md:p-6 bg-(--bg-secondary)'>
              <div ref={mobilePreviewRef} className='rounded-xl border border-(--border) bg-(--bg-primary) p-4 md:p-6'>
                {docPreviewContent(mobilePreviewRef)}
              </div>
            </div>
          </div>
        </div>
      )}

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
