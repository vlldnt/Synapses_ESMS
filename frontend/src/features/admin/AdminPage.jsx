import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Users, BookUser, FileText, Plus, Trash2, Download, X, Pencil } from 'lucide-react';
import { authFetch } from '../../services/authServices';
import { deleteReference } from '../../services/referenceService';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import CreateUserModal from '../../components/admin/CreateUserModal';
import CreateReferenceModal from '../../components/admin/CreateReferenceModal';
import EditUserModal from '../../components/admin/EditUserModal';
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
      className='inline-flex items-center justify-center px-2 h-5 rounded-full text-[10px] font-bold shrink-0 text-white min-w-9'
      style={{ background: color }}
    >
      {label}
    </span>
  );
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

  const [empRoleFilter, setEmpRoleFilter] = useState('all');
  const [empJobFilter, setEmpJobFilter] = useState('all');

  const [refEducatorFilter, setRefEducatorFilter] = useState('all');

  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [docRefFilter, setDocRefFilter] = useState('all');
  const [docCreatorFilter, setDocCreatorFilter] = useState('all');

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewText, setPreviewText] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deletingRefId, setDeletingRefId] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);

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
    if (emp.id === user?.id) return true;
    if (empRoleFilter !== 'all' && emp.role !== empRoleFilter) return false;
    if (empJobFilter !== 'all' && emp.job !== empJobFilter) return false;
    return true;
  });

  const filteredReferences = references.filter((ref) => {
    if (refEducatorFilter !== 'all' && ref.educator !== refEducatorFilter) return false;
    return true;
  });

  const docTypes = [...new Set(documents.map((d) => d.type || d.reportType).filter(Boolean))];

  const filteredDocs = documents.filter((doc) => {
    if (docTypeFilter !== 'all' && (doc.type || doc.reportType) !== docTypeFilter) return false;
    if (docRefFilter !== 'all' && doc.reference_id !== docRefFilter && doc.referenceId !== docRefFilter) return false;
    if (docCreatorFilter !== 'all' && doc.creator_id !== docCreatorFilter) return false;
    return true;
  });

  async function handleDeleteEmp(id) {
    if (!window.confirm('Supprimer cet employé ?')) return;
    setDeletingEmpId(id);
    try {
      const base = import.meta.env.VITE_BASENAME || '/synapses';
      await authFetch(`${base}/api/users/${id}`, { method: 'DELETE' });
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeletingEmpId(null); }
  }

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
      const base = import.meta.env.VITE_BASENAME || '/synapses';
      await authFetch(`${base}/api/archives/${id}`, { method: 'DELETE' });
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

  function getCreatorName(creatorId) {
    const emp = employees.find((e) => e.id === creatorId);
    return emp ? `${emp.first_name} ${emp.last_name}` : null;
  }

  const tabs = [
    { id: 'overview', label: organization?.structure_type ? `${organization.structure_type} — ${organization.name}` : (organization?.name || 'Vue générale') },
    { id: 'employes', label: `Employés (${employees.length})` },
    { id: 'references', label: `Références (${references.length})` },
    { id: 'documents', label: `Documents (${documents.length})` },
  ];

  return (
    <div id='admin-page' className='h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8'>
      <div className='mx-auto w-full flex flex-col gap-5'>

        <h1 className='text-xl md:text-3xl font-semibold text-(--text-primary)'>Administration</h1>

        {/* Onglets */}
        <div className='flex gap-0.5 border-b border-(--border) overflow-x-auto'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#673DE6] text-[#673DE6]'
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

            {/* Employés */}
            <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden'>
              <div className='px-4 pt-4 pb-2.5 border-b border-(--border) flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Users size={14} className='text-(--text-muted)' />
                  <span className='text-sm font-semibold text-(--text-primary)'>Employés</span>
                  <span className='text-xs text-(--text-muted)'>{employees.length}</span>
                </div>
                <button type='button' onClick={() => setShowUserModal(true)} className='w-6 h-6 rounded-md bg-[#673DE6] text-white flex items-center justify-center hover:bg-[#5A2FB8] cursor-pointer transition-colors'>
                  <Plus size={12} />
                </button>
              </div>
              <div className='divide-y divide-(--border)/50 max-h-72 overflow-y-auto'>
                {employees.length === 0 ? (
                  <p className='px-4 py-6 text-center text-xs text-(--text-muted)'>Aucun employé</p>
                ) : employees.map((emp) => (
                  <div key={emp.id} className='flex items-center gap-2.5 px-4 py-2.5'>
                    <div className='w-7 h-7 rounded-full bg-(--bg-secondary) flex items-center justify-center text-xs font-semibold text-(--text-secondary) shrink-0 uppercase'>
                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-medium text-(--text-primary) truncate'>{emp.first_name} {emp.last_name}</p>
                      <p className='text-[11px] text-(--text-muted) truncate'>{emp.job || emp.role}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${emp.status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                      {emp.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Références */}
            <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden'>
              <div className='px-4 pt-4 pb-2.5 border-b border-(--border) flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <BookUser size={14} className='text-(--text-muted)' />
                  <span className='text-sm font-semibold text-(--text-primary)'>Références</span>
                  <span className='text-xs text-(--text-muted)'>{references.length}</span>
                </div>
                <button type='button' onClick={() => setShowRefModal(true)} className='w-6 h-6 rounded-md bg-[#5A2FB8] text-white flex items-center justify-center hover:bg-[#673DE6] cursor-pointer transition-colors'>
                  <Plus size={12} />
                </button>
              </div>
              <div className='divide-y divide-(--border)/50 max-h-72 overflow-y-auto'>
                {references.length === 0 ? (
                  <p className='px-4 py-6 text-center text-xs text-(--text-muted)'>Aucune référence</p>
                ) : references.map((ref) => {
                  const educator = employees.find((e) => e.id === ref.educator);
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

            {/* Documents */}
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
          <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm'>
            <div className='px-5 pt-5 pb-3 border-b border-(--border) flex flex-col gap-3'>
              <div className='flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-(--text-primary)'>Employés</h2>
                <button
                  type='button'
                  onClick={() => setShowUserModal(true)}
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#673DE6] text-white text-xs font-medium hover:bg-[#5A2FB8] cursor-pointer transition-colors'
                >
                  <Plus size={13} /> Ajouter
                </button>
              </div>
              <div className='flex gap-2 flex-wrap'>
                <select value={empRoleFilter} onChange={(e) => setEmpRoleFilter(e.target.value)} className={selectCls}>
                  <option value='all'>Tous les rôles</option>
                  <option value='direction'>Direction</option>
                  <option value='agent'>Agent</option>
                </select>
                <select value={empJobFilter} onChange={(e) => setEmpJobFilter(e.target.value)} className={selectCls}>
                  <option value='all'>Tous les postes</option>
                  {availableJobs.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>
            <div className='divide-y divide-(--border)/50'>
              {filteredEmployees.length === 0 ? (
                <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucun employé.</p>
              ) : filteredEmployees.map((emp) => (
                <div key={emp.id} className='flex items-center gap-3 px-5 py-3.5'>
                  <div className='w-9 h-9 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-sm font-semibold text-(--text-secondary) shrink-0 uppercase'>
                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-medium text-(--text-primary)'>{emp.first_name} {emp.last_name}</p>
                      {emp.id === user?.id && <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-[#673DE6]/10 text-[#673DE6] font-medium'>Vous</span>}
                    </div>
                    <p className='text-xs text-(--text-muted) truncate'>{emp.email}{emp.job ? ` · ${emp.job}` : ''}</p>
                  </div>
                  <div className='flex items-center gap-1.5 shrink-0'>
                    <span className='text-[11px] font-medium px-2 py-0.5 rounded-full text-(--text-muted) bg-(--bg-secondary) capitalize'>{emp.role}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${emp.status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                      {emp.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                    <button type='button' onClick={() => setEditingEmp(emp)} className='p-1.5 rounded-md text-(--text-muted) hover:text-[#673DE6] hover:bg-(--bg-secondary) cursor-pointer transition-colors'>
                      <Pencil size={13} />
                    </button>
                    {emp.id !== user?.id && (
                      <button type='button' disabled={deletingEmpId === emp.id} onClick={() => handleDeleteEmp(emp.id)} className='p-1.5 rounded-md text-(--text-muted) hover:text-red-500 hover:bg-red-50 disabled:opacity-40 cursor-pointer transition-colors'>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Références ── */}
        {!loading && activeTab === 'references' && (
          <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm'>
            <div className='px-5 pt-5 pb-3 border-b border-(--border) flex flex-col gap-3'>
              <div className='flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-(--text-primary)'>Références</h2>
                <button
                  type='button'
                  onClick={() => setShowRefModal(true)}
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#673DE6] text-white text-xs font-medium hover:bg-[#5A2FB8] cursor-pointer transition-colors'
                >
                  <Plus size={13} /> Ajouter
                </button>
              </div>
              <div className='flex gap-2 flex-wrap'>
                <select value={refEducatorFilter} onChange={(e) => setRefEducatorFilter(e.target.value)} className={selectCls}>
                  <option value='all'>Tous les éducateurs</option>
                  {employees.filter((e) => e.role !== 'admin').map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className='divide-y divide-(--border)/50'>
              {filteredReferences.length === 0 ? (
                <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucune référence.</p>
              ) : filteredReferences.map((ref) => {
                const educator = employees.find((e) => e.id === ref.educator);
                return (
                  <div key={ref.id} className='flex items-center gap-3 px-5 py-3.5'>
                    <div className='w-9 h-9 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-sm font-semibold text-(--text-secondary) shrink-0 uppercase'>
                      {ref.first_name?.[0]}{ref.last_name?.[0]}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-(--text-primary)'>{ref.first_name} {ref.last_name}</p>
                      {educator && <p className='text-xs text-(--text-muted)'>Référent : {educator.first_name} {educator.last_name}</p>}
                    </div>
                    <button type='button' onClick={() => setEditingRef(ref)} className='p-1.5 rounded-md text-(--text-muted) hover:text-[#673DE6] hover:bg-(--bg-secondary) cursor-pointer transition-colors'>
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
                );
              })}
            </div>
          </div>
        )}

        {/* ── Documents ── */}
        {!loading && activeTab === 'documents' && (
          <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden'>
            <div className='px-5 pt-5 pb-3 border-b border-(--border) flex flex-col gap-3'>
              <h2 className='text-sm font-semibold text-(--text-primary)'>Documents</h2>
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
                <select value={docCreatorFilter} onChange={(e) => setDocCreatorFilter(e.target.value)} className={selectCls}>
                  <option value='all'>Tous les créateurs</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
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
                        <p className='text-[11px] text-(--text-muted) truncate'>{getCreatorName(doc.creator_id)}</p>
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
                      <p className='text-[11px] text-(--text-muted)'>{getCreatorName(selectedDoc.creator_id)} · {timeAgo(selectedDoc.created_at || selectedDoc.date)}</p>
                    </div>
                    <button
                      type='button'
                      onClick={handleDownload}
                      disabled={isDownloading || !selectedDoc.docx_base_64}
                      className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#673DE6] text-white text-xs font-medium hover:bg-[#5A2FB8] disabled:opacity-50 cursor-pointer transition-colors shrink-0'
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

      {showUserModal && (
        <CreateUserModal
          organizationId={user?.organization_id}
          onClose={() => setShowUserModal(false)}
          onCreated={() => setShowUserModal(false)}
        />
      )}

      {showRefModal && (
        <CreateReferenceModal
          employees={employees}
          onClose={() => setShowRefModal(false)}
          onCreated={(newRef) => setReferences((prev) => [...prev, newRef])}
        />
      )}

      {editingEmp && (
        <EditUserModal
          employee={editingEmp}
          onClose={() => setEditingEmp(null)}
          onUpdated={(updated) => {
            setEmployees((prev) => prev.map((e) => e.id === updated.id ? updated : e));
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

export default AdminPage;
