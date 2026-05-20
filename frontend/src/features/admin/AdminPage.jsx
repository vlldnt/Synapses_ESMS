import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import {
  Users, BookUser, FileText, Plus, Trash2, Download, X,
  Pencil, ChevronRight, Mail, Briefcase, Shield,
} from 'lucide-react';
import { authFetch } from '../../services/authServices';
import { deleteReference, formatReferenceName } from '../../services/referenceService';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import CreateUserModal from '../../components/admin/CreateUserModal';
import CreateReferenceModal from '../../components/admin/CreateReferenceModal';
import EditUserModal from '../../components/admin/EditUserModal';
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

const WORD_BTN = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium disabled:opacity-50 cursor-pointer transition-opacity shrink-0';
const PDF_BTN  = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium disabled:opacity-50 cursor-pointer transition-opacity shrink-0';
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
      className='inline-flex items-center justify-center w-14 h-5 rounded-full text-[10px] font-bold shrink-0 text-white'
      style={{ background: color }}
    >
      {label}
    </span>
  );
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
];

function empColor(emp) {
  const code = (emp.id || '').charCodeAt((emp.id || '').length - 1) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function AdminPage() {
  const role = useSelector((state) => state.role.role);
  const { user, organization } = useCurrentUser();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [employees, setEmployees] = useState([]);
  const [references, setReferences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showRefModal, setShowRefModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [editingRef, setEditingRef] = useState(null);
  const [deletingEmpId, setDeletingEmpId] = useState(null);
  const [deletingRefId, setDeletingRefId] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedRef, setSelectedRef] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [showDocModal, setShowDocModal] = useState(false);
  const [modalDoc, setModalDoc] = useState(null);

  const [empRoleFilter, setEmpRoleFilter] = useState('all');
  const [empJobFilter, setEmpJobFilter] = useState('all');
  const [refEducatorFilter, setRefEducatorFilter] = useState('all');
  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [docRefFilter, setDocRefFilter] = useState('all');
  const [docCreatorFilter, setDocCreatorFilter] = useState('all');

  const [previewText, setPreviewText] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const previewRef = useRef(null);
  const modalPreviewRef = useRef(null);
  const { handleDownload, isLoading: isDownloading, toast: downloadToast, clearToast } = useDocumentDownload();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key !== 'Escape') return;
      if (showDocModal) { setShowDocModal(false); setModalDoc(null); return; }
      if (selectedDoc) { setSelectedDoc(null); return; }
      if (selectedRef) { setSelectedRef(null); return; }
      if (selectedEmp) { setSelectedEmp(null); return; }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showDocModal, selectedDoc, selectedRef, selectedEmp]);

  useEffect(() => {
    if (role !== 'admin' || !user?.organization_id) return;
    const base = import.meta.env.VITE_BASENAME || '/synapses';
    Promise.all([
      authFetch(`${base}/api/users`).then((r) => r.json()),
      authFetch(`${base}/api/references`).then((r) => r.json()),
      authFetch(`${base}/api/archives`).then((r) => r.json()),
    ])
      .then(([users, refs, docs]) => {
        setEmployees(Array.isArray(users) ? users : []);
        setReferences(Array.isArray(refs) ? refs : []);
        setDocuments(Array.isArray(docs) ? docs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role, user?.organization_id]);

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

  if (role !== 'admin') return <Navigate to='/' replace />;

  const availableJobs = [...new Set(employees.map((e) => e.job).filter(Boolean))];

  const filteredEmployees = employees.filter((emp) => {
    if (empRoleFilter !== 'all' && emp.role !== empRoleFilter) return false;
    if (empJobFilter !== 'all' && emp.job !== empJobFilter) return false;
    return true;
  });

  const filteredReferences = references.filter((ref) => {
    if (refEducatorFilter !== 'all' && ref.educator_id !== refEducatorFilter) return false;
    return true;
  });

  const docTypes = [...new Set(documents.map((d) => d.type || d.reportType).filter(Boolean))];

  const filteredDocs = documents.filter((doc) => {
    if (docTypeFilter !== 'all' && (doc.type || doc.reportType) !== docTypeFilter) return false;
    if (docRefFilter !== 'all' && doc.reference_name?.trim() !== docRefFilter) return false;
    if (docCreatorFilter !== 'all' && doc.creator_id !== docCreatorFilter) return false;
    return true;
  });

  function getCreatorName(creatorId) {
    const emp = employees.find((e) => e.id === creatorId);
    return emp ? `${emp.first_name} ${emp.last_name}` : null;
  }

  async function handleDeleteEmp(id) {
    if (!window.confirm('Supprimer cet employé ?')) return;
    setDeletingEmpId(id);
    try {
      const base = import.meta.env.VITE_BASENAME || '/synapses';
      await authFetch(`${base}/api/users/${id}`, { method: 'DELETE' });
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      if (selectedEmp?.id === id) setSelectedEmp(null);
    } catch (err) { console.error(err); }
    finally { setDeletingEmpId(null); }
  }

  async function handleDeleteRef(id) {
    setDeletingRefId(id);
    try {
      await deleteReference(id);
      setReferences((prev) => prev.filter((r) => r.id !== id));
      if (selectedRef?.id === id) setSelectedRef(null);
    } catch (err) { console.error(err); }
    finally { setDeletingRefId(null); }
  }

  async function handleDeleteDoc(id) {
    setDeletingDocId(id);
    try {
      const base = import.meta.env.VITE_BASENAME || '/synapses';
      await authFetch(`${base}/api/archives/${id}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
      if (modalDoc?.id === id) { setShowDocModal(false); setModalDoc(null); }
    } catch (err) { console.error(err); }
    finally { setDeletingDocId(null); }
  }

  function openDocModal(doc) {
    setModalDoc(doc);
    setShowDocModal(true);
  }

  const tabs = [
    { id: 'overview', label: organization?.structure_type ? `${organization.structure_type} – ${organization.name}` : (organization?.name || 'Vue générale') },
    { id: 'employes', label: `Employés (${employees.length})` },
    { id: 'references', label: `Références (${references.length})` },
    { id: 'documents', label: `Documents (${documents.length})` },
  ];

  const docPreviewContent = (ref) =>
    isPreviewLoading
      ? <p className='text-sm text-(--text-muted)'>Chargement…</p>
      : previewText
        ? <WordPreview text={previewText} />
        : <p className='text-sm text-(--text-muted)'>Aucun contenu à afficher</p>;

  return (
    <div id='admin-page' className='h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8'>
      <DownloadLoadingModal isOpen={isDownloading} />
      <DownloadToast filename={downloadToast} onClose={clearToast} />
      <div className='mx-auto w-full flex flex-col gap-5'>

        {/* Onglets */}
        <div className='flex gap-0.5 border-b border-(--border) overflow-x-auto'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type='button'
              onClick={() => { setActiveTab(tab.id); setSelectedEmp(null); setSelectedRef(null); setSelectedDoc(null); }}
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

        {/* ── Vue générale ── */}
        {!loading && activeTab === 'overview' && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-start'>

            <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden'>
              <div className='px-4 pt-4 pb-2.5 border-b border-(--border) flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Users size={14} className='text-(--text-muted)' />
                  <span className='text-sm font-semibold text-(--text-primary)'>Employés</span>
                  <span className='text-xs text-(--text-muted)'>{employees.length}</span>
                </div>
                <button type='button' onClick={() => setShowUserModal(true)} className='w-6 h-6 rounded-md bg-(--bleu-fonce) text-white flex items-center justify-center hover:bg-(--bleu-active) cursor-pointer transition-colors'>
                  <Plus size={12} />
                </button>
              </div>
              <div className='divide-y divide-(--border)/50 max-h-72 overflow-y-auto'>
                {employees.length === 0 ? (
                  <p className='px-4 py-6 text-center text-xs text-(--text-muted)'>Aucun employé</p>
                ) : employees.map((emp) => (
                  <div key={emp.id} className='flex items-center gap-2.5 px-4 py-2.5'>
                    <div className={`w-7 h-7 rounded-full ${empColor(emp)} flex items-center justify-center text-xs font-bold text-white shrink-0 uppercase`}>
                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-medium text-(--text-primary) truncate'>{emp.first_name} {emp.last_name}</p>
                      <p className='text-[11px] text-(--text-muted) truncate'>{emp.job || emp.role}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${emp.status === 'active' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 bg-gray-100'}`}>
                      {emp.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden'>
              <div className='px-4 pt-4 pb-2.5 border-b border-(--border) flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <BookUser size={14} className='text-(--text-muted)' />
                  <span className='text-sm font-semibold text-(--text-primary)'>Références</span>
                  <span className='text-xs text-(--text-muted)'>{references.length}</span>
                </div>
                <button type='button' onClick={() => setShowRefModal(true)} className='w-6 h-6 rounded-md bg-(--bleu-active) text-white flex items-center justify-center hover:bg-(--bleu-fonce) cursor-pointer transition-colors'>
                  <Plus size={12} />
                </button>
              </div>
              <div className='divide-y divide-(--border)/50 max-h-72 overflow-y-auto'>
                {references.length === 0 ? (
                  <p className='px-4 py-6 text-center text-xs text-(--text-muted)'>Aucune référence</p>
                ) : references.map((ref) => {
                  const educator = employees.find((e) => e.id === ref.educator_id);
                  return (
                    <div key={ref.id} className='flex items-center gap-2.5 px-4 py-2.5'>
                      <div className='w-7 h-7 rounded-full bg-(--bg-secondary) flex items-center justify-center text-xs font-semibold text-(--text-secondary) shrink-0 uppercase'>
                        {ref.first_name?.[0]}{ref.last_name?.[0]}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium text-(--text-primary) truncate'>{ref.first_name} {ref.last_name}</p>
                        {educator && <p className='text-[11px] text-(--text-muted) truncate'>{educator.first_name} {educator.last_name}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden'>
              <div className='px-4 pt-4 pb-2.5 border-b border-(--border) flex items-center gap-2'>
                <FileText size={14} className='text-(--text-muted)' />
                <span className='text-sm font-semibold text-(--text-primary)'>Documents</span>
                <span className='text-xs text-(--text-muted)'>{documents.length}</span>
              </div>
              <div className='divide-y divide-(--border)/50 max-h-72 overflow-y-auto'>
                {documents.length === 0 ? (
                  <p className='px-4 py-6 text-center text-xs text-(--text-muted)'>Aucun document</p>
                ) : documents.slice(0, 20).map((doc) => (
                  <div key={doc.id} className='flex items-center gap-2.5 px-4 py-2.5'>
                    <DocBadge doc={doc} />
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-medium text-(--text-primary) truncate'>{formatReportName(doc)}</p>
                      <p className='text-[11px] text-(--text-muted) truncate'>{getCreatorName(doc.creator_id)}</p>
                    </div>
                    <span className='text-[11px] text-(--text-muted) shrink-0'>{timeAgo(doc.created_at || doc.date)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── Employés ── */}
        {!loading && activeTab === 'employes' && (
          <div
            className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden flex'
            style={{ height: 'calc(100vh - 220px)', minHeight: '480px' }}
          >
            {/* Col gauche : liste */}
            <div className={`flex flex-col shrink-0 ${selectedEmp ? 'w-[24%] border-r border-(--border)' : 'w-full'}`}>
              <div className='px-5 pt-5 pb-3 border-b border-(--border) flex flex-col gap-3 shrink-0'>
                <div className='flex items-center gap-2'>
                  <Users size={15} className='text-(--text-muted)' />
                  <h2 className='text-sm font-semibold text-(--text-primary)'>Employés</h2>
                </div>
                <div className='flex items-center gap-2'>
                  <select value={empRoleFilter} onChange={(e) => setEmpRoleFilter(e.target.value)} className={selectCls}>
                    <option value='all'>Tous les rôles</option>
                    <option value='direction'>Direction</option>
                    <option value='agent'>Agent</option>
                  </select>
                  <select value={empJobFilter} onChange={(e) => setEmpJobFilter(e.target.value)} className={selectCls}>
                    <option value='all'>Tous les postes</option>
                    {availableJobs.map((j) => <option key={j} value={j}>{j}</option>)}
                  </select>
                  {(empRoleFilter !== 'all' || empJobFilter !== 'all') && (
                    <button type='button'
                      onClick={() => { setEmpRoleFilter('all'); setEmpJobFilter('all'); }}
                      className='flex items-center gap-1 px-2 py-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer shrink-0 text-[11px] font-medium border border-red-200 dark:border-red-800'
                      title='Réinitialiser les filtres'>
                      <X size={11} /> Reset
                    </button>
                  )}
                </div>
              </div>
              <button
                type='button'
                onClick={() => setShowUserModal(true)}
                className='flex items-center gap-2 px-4 py-3 border-b border-(--border)/50 text-xs font-medium text-(--bleu-fonce) hover:bg-(--bleu-fonce)/5 cursor-pointer transition-colors shrink-0'
              >
                <Plus size={13} /> Ajouter un employé
              </button>
              <div className='flex-1 overflow-y-auto divide-y divide-(--border)/50'>
                {filteredEmployees.length === 0 ? (
                  <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucun employé.</p>
                ) : filteredEmployees.map((emp) => {
                  const active = selectedEmp?.id === emp.id;
                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmp(active ? null : emp)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-(--bg-secondary)' : 'hover:bg-(--bg-secondary)'}`}
                    >
                      <div className={`w-8 h-8 rounded-full ${empColor(emp)} flex items-center justify-center text-xs font-bold text-white shrink-0 uppercase`}>
                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium text-(--text-primary) truncate'>{emp.first_name} {emp.last_name}</p>
                        {!selectedEmp && <p className='text-[11px] text-(--text-muted) truncate'>{emp.job || emp.role}</p>}
                      </div>
                      <ChevronRight size={12} className={`shrink-0 text-(--text-muted) transition-transform ${active ? 'rotate-90' : ''}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Col droite : profil employé */}
            {selectedEmp && (() => {
              const empDocs = documents.filter((d) => d.creator_id === selectedEmp.id);
              const color = empColor(selectedEmp);
              return (
                <div className='flex-1 flex flex-col overflow-hidden'>
                  <div className='px-5 pt-5 pb-3 border-b border-(--border) flex items-center justify-between shrink-0'>
                    <h2 className='text-sm font-semibold text-(--text-primary)'>Profil</h2>
                    <div className='flex items-center gap-1.5'>
                      <button type='button' onClick={() => setEditingEmp(selectedEmp)} className='p-1.5 rounded-md text-(--text-muted) hover:text-(--bleu-fonce) hover:bg-(--bg-secondary) cursor-pointer transition-colors'>
                        <Pencil size={13} />
                      </button>
                      {selectedEmp.id !== user?.id && (
                        <button type='button' disabled={deletingEmpId === selectedEmp.id} onClick={() => handleDeleteEmp(selectedEmp.id)} className='p-1.5 rounded-md text-(--text-muted) hover:text-red-500 hover:bg-red-50 disabled:opacity-40 cursor-pointer transition-colors'>
                          <Trash2 size={13} />
                        </button>
                      )}
                      <button type='button' onClick={() => setSelectedEmp(null)} className='p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) cursor-pointer transition-colors'>
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                  <div className='flex-1 overflow-y-auto p-6 flex flex-col gap-5'>
                    {/* Avatar + nom */}
                    <div className='flex flex-col items-center gap-3 pt-2'>
                      <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-2xl font-bold text-white shadow-md uppercase`}>
                        {selectedEmp.first_name?.[0]}{selectedEmp.last_name?.[0]}
                      </div>
                      <div className='text-center'>
                        <p className='text-lg font-bold text-(--text-primary)'>{selectedEmp.first_name} {selectedEmp.last_name}</p>
                        {selectedEmp.id === user?.id && (
                          <span className='text-[11px] px-2 py-0.5 rounded-full bg-(--bleu-fonce)/10 text-(--bleu-fonce) font-medium'>Vous</span>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-medium px-2.5 py-1 rounded-full bg-(--bg-secondary) border border-(--border) text-(--text-secondary) capitalize'>
                          {selectedEmp.role}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${selectedEmp.status === 'active' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-500 bg-gray-100'}`}>
                          {selectedEmp.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>

                    {/* Infos */}
                    <div className='flex flex-col gap-2 rounded-xl border border-(--border) bg-(--bg-secondary) p-4'>
                      {selectedEmp.job && (
                        <div className='flex items-center gap-2.5 text-sm'>
                          <Briefcase size={14} className='text-(--text-muted) shrink-0' />
                          <span className='text-(--text-primary)'>{selectedEmp.job}</span>
                        </div>
                      )}
                      {selectedEmp.email && (
                        <div className='flex items-center gap-2.5 text-sm'>
                          <Mail size={14} className='text-(--text-muted) shrink-0' />
                          <span className='text-(--text-primary) truncate'>{selectedEmp.email}</span>
                        </div>
                      )}
                      <div className='flex items-center gap-2.5 text-sm'>
                        <Shield size={14} className='text-(--text-muted) shrink-0' />
                        <span className='text-(--text-primary) capitalize'>{selectedEmp.role}</span>
                      </div>
                    </div>

                    {/* Stats documents */}
                    <div className='rounded-xl border border-(--border) bg-(--bg-secondary) p-4 flex items-center gap-3'>
                      <FileText size={15} className='text-(--bleu-fonce) shrink-0' />
                      <div>
                        <p className='text-sm font-semibold text-(--text-primary)'>{empDocs.length}</p>
                        <p className='text-xs text-(--text-muted)'>document{empDocs.length !== 1 ? 's' : ''} généré{empDocs.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Derniers docs */}
                    {empDocs.length > 0 && (
                      <div className='rounded-xl border border-(--border) overflow-hidden'>
                        <p className='px-4 py-2.5 border-b border-(--border) text-xs font-semibold text-(--text-primary) bg-(--bg-secondary)'>Derniers documents</p>
                        <div className='divide-y divide-(--border)/50'>
                          {empDocs.slice(0, 5).map((doc) => (
                            <button
                              key={doc.id}
                              type='button'
                              onClick={() => openDocModal(doc)}
                              className='w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-(--bg-secondary) transition-colors cursor-pointer'
                            >
                              <DocBadge doc={doc} />
                              <div className='flex-1 min-w-0'>
                                <p className='text-xs font-medium text-(--text-primary) truncate'>{formatReportName(doc)}</p>
                              </div>
                              <span className='text-[11px] text-(--text-muted) shrink-0'>{timeAgo(doc.created_at || doc.date)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Références ── */}
        {!loading && activeTab === 'references' && (
          <div
            className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden flex'
            style={{ height: 'calc(100vh - 220px)', minHeight: '480px' }}
          >
            {/* Col gauche : liste refs */}
            <div className={`flex flex-col shrink-0 ${selectedRef ? 'w-[24%] border-r border-(--border)' : 'w-full'}`}>
              <div className='px-5 pt-5 pb-3 border-b border-(--border) flex flex-col gap-3 shrink-0'>
                <div className='flex items-center gap-2'>
                  <BookUser size={15} className='text-(--text-muted)' />
                  <h2 className='text-sm font-semibold text-(--text-primary)'>Références</h2>
                </div>
                <div className='flex items-center gap-2'>
                  <select value={refEducatorFilter} onChange={(e) => setRefEducatorFilter(e.target.value)} className={selectCls}>
                    <option value='all'>Tous les éducateurs</option>
                    {employees.filter((e) => e.role !== 'admin').map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                    ))}
                  </select>
                  {refEducatorFilter !== 'all' && (
                    <button type='button'
                      onClick={() => setRefEducatorFilter('all')}
                      className='flex items-center gap-1 px-2 py-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer shrink-0 text-[11px] font-medium border border-red-200 dark:border-red-800'
                      title='Réinitialiser les filtres'>
                      <X size={11} /> Reset
                    </button>
                  )}
                </div>
              </div>
              <button
                type='button'
                onClick={() => setShowRefModal(true)}
                className='flex items-center gap-2 px-4 py-3 border-b border-(--border)/50 text-xs font-medium text-(--bleu-fonce) hover:bg-(--bleu-fonce)/5 cursor-pointer transition-colors shrink-0'
              >
                <Plus size={13} /> Ajouter une référence
              </button>
              <div className='flex-1 overflow-y-auto divide-y divide-(--border)/50'>
                {filteredReferences.length === 0 ? (
                  <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucune référence.</p>
                ) : filteredReferences.map((ref) => {
                  const active = selectedRef?.id === ref.id;
                  const educator = employees.find((e) => e.id === ref.educator_id);
                  return (
                    <div
                      key={ref.id}
                      onClick={() => setSelectedRef(active ? null : ref)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-(--bg-secondary)' : 'hover:bg-(--bg-secondary)'}`}
                    >
                      <div className='w-8 h-8 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-xs font-semibold text-(--text-secondary) shrink-0 uppercase'>
                        {ref.first_name?.[0]}{ref.last_name?.[0]}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium text-(--text-primary) truncate'>{ref.first_name} {ref.last_name}</p>
                        {!selectedRef && educator && <p className='text-[11px] text-(--text-muted) truncate'>{educator.first_name} {educator.last_name}</p>}
                      </div>
                      <button type='button' onClick={(e) => { e.stopPropagation(); setEditingRef(ref); }} className='p-1.5 rounded-md text-(--text-muted) hover:text-(--bleu-fonce) hover:bg-(--bg-secondary) cursor-pointer transition-colors shrink-0'>
                        <Pencil size={13} />
                      </button>
                      <button type='button' disabled={deletingRefId === ref.id} onClick={(e) => { e.stopPropagation(); handleDeleteRef(ref.id); }} className='p-1.5 rounded-md text-(--text-muted) hover:text-red-500 hover:bg-red-50 disabled:opacity-40 cursor-pointer transition-colors shrink-0'>
                        <Trash2 size={13} />
                      </button>
                      <ChevronRight size={12} className={`shrink-0 text-(--text-muted) transition-transform ${active ? 'rotate-90' : ''}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Col droite : documents de la référence */}
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
                        onClick={() => openDocModal(doc)}
                        className='w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-(--bg-secondary) transition-colors cursor-pointer'
                      >
                        <DocBadge doc={doc} />
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs font-medium text-(--text-primary) truncate'>{formatReportName(doc)}</p>
                          <p className='text-[11px] text-(--text-muted)'>{getCreatorName(doc.creator_id)} · {timeAgo(doc.created_at || doc.date)}</p>
                        </div>
                        <ChevronRight size={12} className='text-(--text-muted) shrink-0' />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Documents ── */}
        {!loading && activeTab === 'documents' && (
          <div
            className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden flex'
            style={{ height: 'calc(100vh - 220px)', minHeight: '480px' }}
          >
            {/* Col gauche */}
            <div className={`flex flex-col shrink-0 ${selectedDoc ? 'w-[24%] border-r border-(--border)' : 'w-full'}`}>
              <div className='px-5 pt-5 pb-3 border-b border-(--border) flex flex-col gap-3 shrink-0'>
                <div className='flex items-center gap-2'>
                  <FileText size={15} className='text-(--text-muted)' />
                  <h2 className='text-sm font-semibold text-(--text-primary)'>Documents</h2>
                </div>
                <div className='flex items-center gap-2 flex-wrap'>
                  <select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)} className={selectCls}>
                    <option value='all'>Tous les types</option>
                    {docTypes.map((t) => {
                      const agent = AGENTS.find((a) => a.id === t);
                      return <option key={t} value={t}>{agent ? agent.badge : getDocTypeLabel({ type: t })}</option>;
                    })}
                  </select>
                  <select value={docRefFilter} onChange={(e) => setDocRefFilter(e.target.value)} className={selectCls}>
                    <option value='all'>Toutes les réfs</option>
                    {references.map((r) => {
                      const formatted = formatReferenceName(r);
                      return <option key={r.id} value={formatted}>{formatted}</option>;
                    })}
                  </select>
                  <select value={docCreatorFilter} onChange={(e) => setDocCreatorFilter(e.target.value)} className={selectCls}>
                    <option value='all'>Tous les agents</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                    ))}
                  </select>
                  {(docTypeFilter !== 'all' || docRefFilter !== 'all' || docCreatorFilter !== 'all') && (
                    <button
                      type='button'
                      onClick={() => { setDocTypeFilter('all'); setDocRefFilter('all'); setDocCreatorFilter('all'); }}
                      className='flex items-center gap-1 px-2 py-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer shrink-0 text-[11px] font-medium border border-red-200 dark:border-red-800'
                      title='Réinitialiser les filtres'
                    >
                      <X size={11} /> Reset
                    </button>
                  )}
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
                      onClick={() => setSelectedDoc(active ? null : doc)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${active ? 'bg-(--bg-secondary)' : 'hover:bg-(--bg-secondary)'}`}
                    >
                      <DocBadge doc={doc} />
                      <div className='flex-1 min-w-0'>
                        <p className={`text-xs truncate text-(--text-primary) ${active ? 'font-semibold' : 'font-medium'}`}>{formatReportName(doc)}</p>
                        <p className='text-[11px] text-(--text-muted) truncate'>{getCreatorName(doc.creator_id)}</p>
                      </div>
                      <span className='text-[11px] text-(--text-muted) shrink-0'>{timeAgo(doc.created_at || doc.date)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Col droite : preview inline */}
            {selectedDoc && (
              <div className='flex-1 flex flex-col overflow-hidden'>
                <div className='px-5 pt-5 pb-3 border-b border-(--border) flex items-center gap-2 shrink-0'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-(--text-primary) truncate'>{formatReportName(selectedDoc)}</p>
                    <p className='text-[11px] text-(--text-muted)'>{getCreatorName(selectedDoc.creator_id)} · {timeAgo(selectedDoc.created_at || selectedDoc.date)}</p>
                  </div>
                  <button type='button' onClick={() => handleDownload('word', selectedDoc)} disabled={isDownloading || !selectedDoc.docx_base_64} className={WORD_BTN} style={WORD_STYLE}>
                    <Download size={12} /> Word
                  </button>
                  <button type='button' onClick={() => handleDownload('pdf', selectedDoc, previewRef.current)} disabled={isDownloading || !selectedDoc.docx_base_64} className={PDF_BTN} style={PDF_STYLE}>
                    <Download size={12} /> PDF
                  </button>
                  <button type='button' disabled={deletingDocId === selectedDoc.id} onClick={() => handleDeleteDoc(selectedDoc.id)} className='p-1.5 rounded-md text-(--text-muted) hover:text-red-500 hover:bg-red-50 disabled:opacity-40 cursor-pointer transition-colors shrink-0'>
                    <Trash2 size={13} />
                  </button>
                  <button type='button' onClick={() => setSelectedDoc(null)} className='p-1.5 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) cursor-pointer transition-colors shrink-0'>
                    <X size={13} />
                  </button>
                </div>
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

      {/* ── Modal document (Archives style) ── */}
      {showDocModal && modalDoc && (
        <div
          className='fixed inset-0 z-50 bg-black/55 backdrop-blur-[1px] flex flex-col justify-end pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:pb-0 md:p-6 md:justify-start'
          onClick={(e) => e.target === e.currentTarget && (setShowDocModal(false), setModalDoc(null))}
        >
          <div className='bg-(--bg-primary) rounded-t-2xl border border-(--border) shadow-2xl overflow-hidden flex flex-col max-h-[92vh] md:mx-auto md:w-full md:max-w-5xl md:h-full md:rounded-2xl'>
            <div className='px-4 py-3 border-b border-(--border) flex items-center gap-3'>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-(--text-primary) truncate'>{formatReportName(modalDoc)}</p>
                <p className='text-xs text-(--text-muted)'>Aperçu en lecture seule · téléchargement uniquement</p>
              </div>
              <button type='button' onClick={() => handleDownload('word', modalDoc)} disabled={isDownloading || !modalDoc.docx_base_64} className={WORD_BTN} style={WORD_STYLE}>
                <Download size={12} /> Word
              </button>
              <button type='button' onClick={() => handleDownload('pdf', modalDoc, modalPreviewRef.current)} disabled={isDownloading || !modalDoc.docx_base_64} className={PDF_BTN} style={PDF_STYLE}>
                <Download size={12} /> PDF
              </button>
              <button type='button' onClick={() => { setShowDocModal(false); setModalDoc(null); }} className='w-8 h-8 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) flex items-center justify-center cursor-pointer shrink-0' aria-label='Fermer'>
                <X size={15} />
              </button>
            </div>
            <div className='flex-1 overflow-y-auto px-2 py-3 md:p-6 bg-(--bg-secondary)'>
              <div ref={modalPreviewRef} className='rounded-xl border border-(--border) bg-(--bg-primary) px-3 py-4 md:p-6'>
                <ModalDocPreview doc={modalDoc} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <CreateUserModal
          organizationId={user?.organization_id}
          onClose={() => setShowUserModal(false)}
          onCreated={(newEmp) => {
            if (newEmp) setEmployees((prev) => [...prev, newEmp]);
            setShowUserModal(false);
          }}
        />
      )}

      {showRefModal && (
        <CreateReferenceModal
          employees={employees}
          onClose={() => setShowRefModal(false)}
          onCreated={(newRef) => { setReferences((prev) => [...prev, newRef]); setShowRefModal(false); }}
        />
      )}

      {editingEmp && (
        <EditUserModal
          employee={editingEmp}
          onClose={() => setEditingEmp(null)}
          onUpdated={(updated) => {
            setEmployees((prev) => prev.map((e) => e.id === updated.id ? updated : e));
            if (selectedEmp?.id === updated.id) setSelectedEmp(updated);
            setEditingEmp(null);
          }}
        />
      )}

      {editingRef && (
        <EditReferenceModal
          reference={editingRef}
          employees={employees}
          onClose={() => setEditingRef(null)}
          onUpdated={(updated) => {
            setReferences((prev) => prev.map((r) => r.id === updated.id ? updated : r));
            setEditingRef(null);
          }}
        />
      )}
    </div>
  );
}

function ModalDocPreview({ doc }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doc) return;
    if (doc.text?.trim()) { setText(doc.text); return; }
    if (!doc.docx_base_64) return;
    let cancelled = false;
    setLoading(true);
    extractPreviewTextFromDocxBase64(doc.docx_base_64).then((t) => {
      if (!cancelled) { setText(t); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [doc]);

  if (loading) return <p className='text-sm text-(--text-muted)'>Chargement…</p>;
  if (!text) return <p className='text-sm text-(--text-muted)'>Aucun contenu à afficher</p>;
  return <WordPreview text={text} />;
}

export default AdminPage;
