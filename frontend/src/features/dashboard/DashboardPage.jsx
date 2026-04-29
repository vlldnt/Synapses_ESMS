import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getHistory } from '../../services/historyService';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { downloadDocx, triggerDownload } from '../../utils/wordExport';
import { formatReportName } from '../../utils/reportNameFormatter';
import { getEnrichedInfo } from '../../utils/documentEnricher';
import { extractPreviewTextFromDocxBase64 } from '../../utils/docxPreview';
import Button from '../../components/Button';
import WordPreview from '../../components/WordPreview';
import { AGENTS } from '../../constants/agents';
import { getDocTypeLabel, getDocColorFromLabel } from '../../utils/docTypeBadge';
import { authFetch } from '../../services/authServices';
import { FileText, ChevronRight, Download, X } from 'lucide-react';

function AgentCard({ agent }) {
  const isAvailable = !!agent.to;
  const color = agent.color;

  const inner = (
    <div
      className={`rounded-2xl bg-(--bg-primary) p-4 h-full flex flex-col gap-3 transition-all duration-200 ${
        isAvailable
          ? 'border border-(--border) hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
          : 'border border-(--border) opacity-35 cursor-default'
      }`}
      style={isAvailable ? { borderLeftColor: color, borderLeftWidth: '3px' } : {}}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center justify-center px-2 h-6 rounded-full text-[10px] font-bold text-white shrink-0"
          style={{ background: isAvailable ? color : '#94a3b8' }}
        >
          {agent.badge}
        </span>
        {!isAvailable && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-(--bg-tertiary) text-(--text-muted) font-medium shrink-0">
            Bientôt
          </span>
        )}
      </div>
      <p className={`text-xs md:text-sm font-semibold leading-snug flex-1 ${isAvailable ? 'text-(--text-primary)' : 'text-(--text-muted)'}`}>
        {agent.title}
      </p>
      {isAvailable && (
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color }}>
          Ouvrir <ChevronRight size={11} />
        </div>
      )}
    </div>
  );

  return isAvailable ? (
    <Link to={agent.to} className="block h-full">{inner}</Link>
  ) : (
    <div className="h-full">{inner}</div>
  );
}

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
  const [organizations, setOrganizations] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

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
        const [archives, usersData, orgsData] = await Promise.all([
          getHistory(user?.id),
          authFetch(`${basename}/api/users`).then(r => r.json()),
          authFetch(`${basename}/api/organizations`).then(r => r.json()),
        ]);
        setHistory(archives);
        setUsers(usersData);
        setOrganizations(orgsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setHistory([]);
      }
    })();
  }, [user?.id]);

  const handleDownload = async () => {
    if (!selectedEntry) return;
    setIsDownloading(true);
    try {
      if (selectedEntry.docx_base_64) {
        const binaryString = atob(selectedEntry.docx_base_64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        triggerDownload(blob, selectedEntry.filename);
      }
    } finally {
      setIsDownloading(false);
    }
  };

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
            Bonjour {firstName}
            {job && <span className="ml-2 text-sm font-normal text-(--text-muted)">{job}</span>}
          </h1>
          <p className="mt-1 text-xs md:text-sm text-(--text-muted)">
            {date} — {organisationType && `${organisationType} - `}{etablissementName}
          </p>
        </div>

        {/* Agent cards */}
        <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-(--border)">
            <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Mes agents</h2>
            <Link to="/compte_rendu_intervention" className="text-xs text-(--bleu-fonce) hover:underline flex items-center gap-0.5">
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>
          <div className="p-4 md:p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
                const enriched = getEnrichedInfo(entry, users, organizations);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-(--bg-secondary) transition-colors cursor-pointer"
                  >
                    <span
                      className="inline-flex items-center justify-center px-2.5 h-7 rounded-full text-[11px] font-bold shrink-0 min-w-11 text-white"
                      style={{ background: docColor }}
                    >
                      {typeLabel}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--text-primary) truncate">
                        {formatReportName(entry)}
                      </p>
                      <p className="text-xs text-(--text-muted) truncate">
                        {enriched.companyName}
                      </p>
                    </div>
                    <span className="text-xs text-(--text-muted) shrink-0">{timeAgo(entry.created_at || entry.date)}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

      </div>

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
              <Button
                color="blue"
                size="sm"
                icon={Download}
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? 'Génération...' : 'Télécharger'}
              </Button>
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
              <div className="rounded-xl border border-(--border) bg-(--bg-primary) p-4 md:p-6">
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

    </div>
  );
}

export default DashboardPage;
