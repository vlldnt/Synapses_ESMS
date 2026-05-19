import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getHistory } from '../../services/historyService';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useDocumentDownload } from '../../hooks/useDocumentDownload';
import DownloadLoadingModal from '../../components/DownloadLoadingModal';
import DownloadToast from '../../components/DownloadToast';
import { formatReportName } from '../../utils/reportNameFormatter';
import { getEnrichedInfo } from '../../utils/documentEnricher';
import { extractPreviewTextFromDocxBase64 } from '../../utils/docxPreview';
import Button from '../../components/Button';
import WordPreview from '../../components/WordPreview';
import AgentCard from './component/AgentCard';
import CreateUserModal from '../../components/admin/CreateUserModal';
import CreateReferenceModal from '../../components/admin/CreateReferenceModal';
import { AGENTS } from '../../constants/agents';
import { getDocTypeLabel, getDocColorFromLabel } from '../../utils/docTypeBadge';
import { authFetch } from '../../services/authServices';
import { Download, X, ChevronRight } from 'lucide-react';

function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

function DashboardPage() {
  const { firstName, job, organization, user } = useCurrentUser();
  const role = useSelector((state) => state.role.role);
  const [date, setDate] = useState('');
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [references, setReferences] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [previewText, setPreviewText] = useState('');
  const previewRef = useRef(null);
  const { handleDownload, isLoading: isDownloading, toast: downloadToast, clearToast } = useDocumentDownload();
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showAddRefModal, setShowAddRefModal] = useState(false);

  const visibleAgents = AGENTS.filter((a) => a.roles.includes(role));

  useEffect(() => {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(now);
    const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(now);
    const month = new Intl.DateTimeFormat('fr-FR', { month: '2-digit' }).format(now);
    const year = new Intl.DateTimeFormat('fr-FR', { year: 'numeric' }).format(now);
    setDate(`${weekday} ${day}/${month}/${year}`);

    (async () => {
      try {
        const basename = import.meta.env.VITE_BASENAME || '/synapses';
        const [archives, orgsData] = await Promise.all([
          getHistory(user?.id),
          authFetch(`${basename}/api/organizations`).then(r => r.json()),
        ]);
        setHistory(archives);
        setOrganizations(orgsData);

        if (role === 'admin') {
          const [usersData, refsData] = await Promise.all([
            authFetch(`${basename}/api/users`).then(r => r.json()),
            authFetch(`${basename}/api/references`).then(r => r.json()),
          ]);
          setUsers(Array.isArray(usersData) ? usersData : []);
          setReferences(Array.isArray(refsData) ? refsData : []);
        } else if (role === 'agent') {
          const refsData = await authFetch(`${basename}/api/references`).then(r => r.json());
          setReferences(Array.isArray(refsData) ? refsData : []);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setHistory([]);
      }
    })();
  }, [user?.id, role]);


  const etablissementName = organization?.name ?? 'ESMS';
  const organisationType = organization?.structure_type ?? '';
  const recent = history.slice(0, 5);

  function findAgentForEntry(entry) {
    const direct = (entry.type || entry.reportType || '').toString().toLowerCase();
    const intervention = (entry.intervention_type || entry.interventionType || '').toString().toLowerCase();

    const byIdOrBadge = AGENTS.find((a) => {
      const id = a.id.toLowerCase();
      const badge = (a.badge || '').toLowerCase();
      if (direct && (direct === id || direct.includes(id))) return true;
      if (intervention && (intervention.includes(id) || intervention.includes(id.replace(/-/g, ' ')))) return true;
      if (direct && direct === badge) return true;
      return false;
    });
    if (byIdOrBadge) return byIdOrBadge;

    if (intervention.includes('ppa')) {
      if (intervention.includes('médico') || intervention.includes('medico')) {
        return AGENTS.find((a) => a.id === 'ppa-medico-social') || null;
      }
      return AGENTS.find((a) => a.id === 'ppa-social') || AGENTS.find((a) => a.id === 'ppa-medico-social') || null;
    }

    if (intervention.includes('compte') || intervention.includes('intervention') || intervention.includes('compte rendu')) {
      return AGENTS.find((a) => a.id === 'compte-rendu-intervention') || null;
    }

    return null;
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedEntry) {
        setSelectedEntry(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedEntry]);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      if (!selectedEntry) {
        setPreviewText('');
        setIsPreviewLoading(false);
        return;
      }

      if (selectedEntry.text?.trim()) {
        setPreviewText(selectedEntry.text);
        setIsPreviewLoading(false);
        return;
      }

      if (!selectedEntry.docx_base_64) {
        setPreviewText('');
        setIsPreviewLoading(false);
        return;
      }

      setIsPreviewLoading(true);
      const extracted = await extractPreviewTextFromDocxBase64(selectedEntry.docx_base_64);
      if (!cancelled) {
        setPreviewText(extracted);
        setIsPreviewLoading(false);
      }
    }

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [selectedEntry]);

  return (
    <div id="dashboard-page" className="h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8">
      <div className="mx-auto w-full flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-xl md:text-3xl text-(--text-primary)">
            {`Bonjour ${firstName}`}
            {role !== 'admin' && job && <span className="ml-2 text-sm font-normal text-(--text-muted)">{job}</span>}
          </h1>
          <p className="mt-1 text-xs md:text-sm text-(--text-muted)">
            {[date, etablissementName].filter(Boolean).join(' - ')}
          </p>
        </div>

        {/* Admin Panel */}
        {role === 'admin' && (
          <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-(--border)">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Panneau d'administration</h2>
                  <span className="text-[11px] font-medium text-(--text-muted) bg-(--bg-secondary) px-2 py-0.5 rounded-full border border-(--border)">Admin</span>
                  <span className="text-xs text-(--text-muted)">
                    {organisationType && `${organisationType} - `}{etablissementName}
                  </span>
                </div>
                <Link to="/admin" className="text-xs text-(--bleu-fonce) hover:underline font-medium shrink-0">
                  → Administration
                </Link>
              </div>
            </div>
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Agents */}
                <div className="bg-(--bg-primary) rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to="/admin"
                      state={{ tab: 'employes' }}
                      className="flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-5 rounded-full bg-(--bleu-fonce) shrink-0" />
                      <span className="text-sm font-bold text-(--text-primary) group-hover:text-(--bleu-fonce) transition-colors">Agents</span>
                      <span className="text-xs font-medium text-white bg-(--bleu-fonce) px-1.5 py-0.5 rounded-full">{users.length}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowAddAgentModal(true)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-(--bleu-fonce) text-white hover:bg-(--bleu-active) cursor-pointer transition-colors shrink-0"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <span className="block h-px bg-(--border)" />
                  <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '108px' }}>
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center gap-2.5 shrink-0">
                        <div className="w-7 h-7 rounded-full bg-(--bg-secondary) flex items-center justify-center text-xs font-semibold text-(--text-secondary) shrink-0 uppercase">
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </div>
                        <p className="text-xs font-medium text-(--text-primary) truncate min-w-0">
                          {u.first_name} {u.last_name}{u.job && <span className="text-(--text-muted) font-normal"> · {u.job}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Références */}
                <div className="bg-(--bg-primary) rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to="/admin"
                      state={{ tab: 'references' }}
                      className="flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-5 rounded-full bg-(--bleu-active) shrink-0" />
                      <span className="text-sm font-bold text-(--text-primary) group-hover:text-(--bleu-active) transition-colors">Références</span>
                      <span className="text-xs font-medium text-white bg-(--bleu-active) px-1.5 py-0.5 rounded-full">{references.length}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowAddRefModal(true)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-(--bleu-active) text-white hover:bg-(--bleu-fonce) cursor-pointer transition-colors shrink-0"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <span className="block h-px bg-(--border)" />
                  <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '108px' }}>
                    {references.map((r) => (
                      <div key={r.id} className="flex items-center gap-2.5 shrink-0">
                        <div className="w-7 h-7 rounded-full bg-(--bg-secondary) flex items-center justify-center text-xs font-semibold text-(--text-secondary) shrink-0 uppercase">
                          {r.first_name?.[0]}{r.last_name?.[0]}
                        </div>
                        <p className="text-xs font-medium text-(--text-primary) truncate">{r.first_name} {r.last_name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-(--bg-primary) rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to="/admin"
                      state={{ tab: 'documents' }}
                      className="flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-5 rounded-full bg-[#9B2CB6] shrink-0" />
                      <span className="text-sm font-bold text-(--text-primary) group-hover:text-[#9B2CB6] transition-colors">Documents</span>
                      <span className="text-xs font-medium text-white bg-[#9B2CB6] px-1.5 py-0.5 rounded-full">{history.length}</span>
                    </Link>
                    <Link
                      to="/admin"
                      state={{ tab: 'documents' }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#9B2CB6] text-white hover:opacity-80 transition-opacity shrink-0"
                    >
                      Voir →
                    </Link>
                  </div>
                  <span className="block h-px bg-(--border)" />
                  <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '108px' }}>
                    {history.map((doc) => (
                      <p key={doc.id} className="text-xs text-(--text-primary) truncate shrink-0">
                        {doc.filename || doc.type || 'Document'}
                      </p>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Agent Panel */}
        {role === 'agent' && (
          <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-(--border)">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Mon tableau de bord</h2>
                <span className="text-[11px] font-medium text-(--text-muted) bg-(--bg-secondary) px-2 py-0.5 rounded-full border border-(--border)">Agent</span>
              </div>
            </div>
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Mes références */}
                <div className="bg-(--bg-primary) rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-5 rounded-full bg-(--bleu-active) shrink-0" />
                      <span className="text-sm font-bold text-(--text-primary)">Mes références</span>
                      <span className="text-xs font-medium text-white bg-(--bleu-active) px-1.5 py-0.5 rounded-full">{references.length}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddRefModal(true)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-(--bleu-active) text-white hover:bg-(--bleu-fonce) cursor-pointer transition-colors shrink-0"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <span className="block h-px bg-(--border)" />
                  <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '108px' }}>
                    {references.length === 0 ? (
                      <p className="text-xs text-(--text-muted)">Aucune référence assignée.</p>
                    ) : (
                      references.map((r) => (
                        <div key={r.id} className="flex items-center gap-2.5 shrink-0">
                          <div className="w-7 h-7 rounded-full bg-(--bg-secondary) flex items-center justify-center text-xs font-semibold text-(--text-secondary) shrink-0 uppercase">
                            {r.first_name?.[0]}{r.last_name?.[0]}
                          </div>
                          <p className="text-xs font-medium text-(--text-primary) truncate">{r.first_name} {r.last_name}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mes documents */}
                <div className="bg-(--bg-primary) rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link to="/archives" className="flex items-center gap-2 group">
                      <span className="w-1.5 h-5 rounded-full bg-[#9B2CB6] shrink-0" />
                      <span className="text-sm font-bold text-(--text-primary) group-hover:text-[#9B2CB6] transition-colors">Mes documents</span>
                      <span className="text-xs font-medium text-white bg-[#9B2CB6] px-1.5 py-0.5 rounded-full">{history.length}</span>
                    </Link>
                    <Link
                      to="/archives"
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#9B2CB6] text-white hover:opacity-80 transition-opacity shrink-0"
                    >
                      Voir →
                    </Link>
                  </div>
                  <span className="block h-px bg-(--border)" />
                  <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '108px' }}>
                    {history.length === 0 ? (
                      <p className="text-xs text-(--text-muted)">Aucun document généré.</p>
                    ) : (
                      history.map((doc) => {
                        const agent = findAgentForEntry(doc);
                        const label = agent ? agent.badge : getDocTypeLabel(doc);
                        const color = agent ? agent.color : getDocColorFromLabel(label);
                        return (
                          <div key={doc.id} className="flex items-center gap-2 shrink-0">
                            <span
                              className="inline-flex items-center justify-center w-14 h-5 rounded-full text-[10px] font-bold shrink-0 text-white"
                              style={{ background: color }}
                            >
                              {label}
                            </span>
                            <p className="text-xs text-(--text-primary) truncate">{formatReportName(doc)}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Agent cards */}
        <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-(--border)">
            <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Mes agents de rédaction</h2>
            <Link to="/compte_rendu_intervention" className="text-xs text-(--bleu-fonce) hover:underline flex items-center gap-0.5">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          <div className="p-4 md:p-5 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {visibleAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* Derniers documents */}
        <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-(--border)">
            <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Derniers documents</h2>
            <Link to="/archives" className="text-xs text-(--bleu-fonce) hover:underline flex items-center gap-0.5">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-(--border)/50">
            {recent.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-(--text-muted)">
                Aucun document généré pour l'instant.<br />
                <Link to="/compte_rendu_intervention" className="text-(--bleu-fonce) hover:underline">Utiliser un agent →</Link>
              </div>
            ) : (
              recent.map((entry) => {
                const agentForEntry = findAgentForEntry(entry);
                const typeLabel = agentForEntry ? agentForEntry.badge : getDocTypeLabel(entry);
                const docColor = agentForEntry ? agentForEntry.color : getDocColorFromLabel(typeLabel);
                const childName = entry.reference_name || entry.childName || null;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-(--bg-secondary) transition-colors cursor-pointer"
                  >
                    <span
                      className="inline-flex items-center justify-center w-14 h-5 rounded-full text-[10px] font-bold shrink-0 text-white"
                      style={{ background: docColor }}
                    >
                      {typeLabel}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--text-primary) truncate">
                        {formatReportName(entry)}
                      </p>
                      {childName && (
                        <p className="text-xs text-(--text-muted) truncate">{childName}</p>
                      )}
                    </div>
                    <span className="text-xs text-(--text-muted) shrink-0">{timeAgo(entry.created_at || entry.date)}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

      </div>

      <DownloadLoadingModal isOpen={isDownloading} />
      <DownloadToast filename={downloadToast} onClose={clearToast} />

      {/* Modal aperçu document */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-90 bg-black/55 backdrop-blur-[1px] p-3 md:p-6"
          onClick={(e) => e.target === e.currentTarget && setSelectedEntry(null)}
        >
          <div className="mx-auto w-full max-w-5xl h-full flex flex-col rounded-2xl border border-(--border) bg-(--bg-primary) shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-(--border) flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-(--text-primary) truncate">
                  {formatReportName(selectedEntry)}
                </p>
                <p className="text-xs text-(--text-muted)">Aperçu en lecture seule · téléchargement uniquement</p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload('word', selectedEntry)}
                disabled={isDownloading || !selectedEntry.docx_base_64}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-(--bleu-fonce) text-white text-xs font-medium hover:bg-(--bleu-active) disabled:opacity-50 cursor-pointer transition-colors shrink-0"
              >
                <Download size={12} />
                Word
              </button>
              <button
                type="button"
                onClick={() => handleDownload('pdf', selectedEntry, previewRef.current)}
                disabled={isDownloading || !selectedEntry.docx_base_64}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) text-xs font-medium hover:bg-(--bg-tertiary) disabled:opacity-50 cursor-pointer transition-colors shrink-0"
              >
                <Download size={12} />
                PDF
              </button>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) flex items-center justify-center cursor-pointer"
                aria-label="Fermer"
              >
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-(--bg-secondary)">
              <div ref={previewRef} className="rounded-xl border border-(--border) bg-(--bg-primary) p-4 md:p-6">
                {isPreviewLoading ? (
                  <p className="text-(--text-muted)">Chargement de l'aperçu du document...</p>
                ) : previewText ? (
                  <WordPreview text={previewText} />
                ) : (
                  <p className="text-(--text-muted)">Aucun contenu à afficher</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {role === 'admin' && showAddAgentModal && (
        <CreateUserModal
          organizationId={user?.organization_id}
          onClose={() => setShowAddAgentModal(false)}
          onCreated={() => {
            setShowAddAgentModal(false);
            (async () => {
              try {
                const basename = import.meta.env.VITE_BASENAME || '/synapses';
                const usersData = await authFetch(`${basename}/api/users`).then(r => r.json());
                setUsers(usersData);
              } catch (err) {
                console.error('Failed to reload users:', err);
              }
            })();
          }}
        />
      )}

      {role === 'admin' && showAddRefModal && (
        <CreateReferenceModal
          employees={users}
          onClose={() => setShowAddRefModal(false)}
          onCreated={(newRef) => {
            setReferences((prev) => [...prev, newRef]);
            setShowAddRefModal(false);
          }}
        />
      )}

      {role === 'agent' && showAddRefModal && (
        <CreateReferenceModal
          showEducator={false}
          onClose={() => setShowAddRefModal(false)}
          onCreated={(newRef) => {
            setReferences((prev) => [...prev, newRef]);
            setShowAddRefModal(false);
          }}
        />
      )}

    </div>
  );
}

export default DashboardPage;
