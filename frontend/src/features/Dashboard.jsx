import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getHistory } from '../services/historyService';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { FileText, Bot, Clock, ChevronRight } from 'lucide-react';

const AGENT_COLORS = {
  'Compte rendu': '#0D66D4',
  'PPA': '#16a34a',
  'Autre': '#94a3b8',
};

function getAgentColor(type) {
  if (!type) return AGENT_COLORS['Autre'];
  if (type.toLowerCase().includes('ppa')) return AGENT_COLORS['PPA'];
  if (type.toLowerCase().includes('compte rendu') || type.toLowerCase().includes('intervention')) return AGENT_COLORS['Compte rendu'];
  return AGENT_COLORS['Autre'];
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-5 md:p-6 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm text-(--text-muted)">{label}</span>
        <span className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </span>
      </div>
      <p className="text-3xl md:text-4xl font-bold text-(--text-primary)">{value}</p>
      {sub && <p className="text-xs text-(--text-muted)">{sub}</p>}
    </div>
  );
}

function AgentBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-(--text-secondary)">{label}</span>
        <span className="font-semibold text-(--text-primary)">{count} <span className="text-(--text-muted) font-normal">({pct}%)</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-(--bg-tertiary) overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
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

const ROLE_LABEL = {
  agent: 'Agent',
  direction: 'Direction',
  admin: 'Administrateur',
};

function Dashboard() {
  const { firstName, job, organization } = useCurrentUser();
  const [date, setDate] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(now);
    const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(now);
    const month = new Intl.DateTimeFormat('fr-FR', { month: '2-digit' }).format(now);
    const year = new Intl.DateTimeFormat('fr-FR', { year: 'numeric' }).format(now);
    setDate(`${weekday} ${day}/${month}/${year}`);

    (async () => {
      try {
        const archives = await getHistory();
        setHistory(archives);
      } catch (err) {
        console.error('Failed to load history:', err);
        setHistory([]);
      }
    })();
  }, []);

  const etablissementName = organization?.name ?? 'ESMS';
  const organisationType = organization?.type ?? '';

  const total = history.length;
  const thisMonth = history.filter((e) => {
    const d = new Date(e.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // répartition par type
  const byType = history.reduce((acc, e) => {
    const key = e.interventionType?.toLowerCase().includes('ppa') ? 'PPA'
      : e.interventionType?.toLowerCase().includes('compte rendu') || e.interventionType?.toLowerCase().includes('intervention') ? 'Compte rendu'
      : 'Autre';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const recent = history.slice(0, 5);

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

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={FileText}
            label="Documents générés"
            value={total}
            sub="Total depuis le début"
            color="#0D66D4"
          />
          <StatCard
            icon={Clock}
            label="Ce mois-ci"
            value={thisMonth}
            sub={`Sur ${total} document${total > 1 ? 's' : ''} au total`}
            color="#ea580c"
          />
          <StatCard
            icon={Bot}
            label="Agents disponibles"
            value="14"
            sub="2 actifs · 12 bientôt disponibles"
            color="#16a34a"
          />
        </div>

        {/* Main row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Derniers documents */}
          <div className="lg:col-span-2 rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-(--border)">
              <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Derniers documents</h2>
              <Link to="/historique" className="text-xs text-(--bleu-fonce) hover:underline flex items-center gap-0.5">
                Voir tout <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-(--border)/50">
              {recent.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-(--text-muted)">
                  Aucun document généré pour l'instant.<br />
                  <Link to="/agents" className="text-(--bleu-fonce) hover:underline">Utiliser un agent →</Link>
                </div>
              ) : (
                recent.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                      style={{ background: `${getAgentColor(entry.interventionType)}18` }}
                    >
                      <FileText size={14} style={{ color: getAgentColor(entry.interventionType) }} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--text-primary) truncate">
                        {entry.interventionType || 'Document'}
                      </p>
                      <p className="text-xs text-(--text-muted) truncate">
                        Réf. {entry.reference} · {entry.structureType}
                      </p>
                    </div>
                    <span className="text-xs text-(--text-muted) shrink-0">{timeAgo(entry.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Répartition agents */}
          <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm">
            <div className="px-5 pt-5 pb-3 border-b border-(--border)">
              <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Répartition par agent</h2>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              {total === 0 ? (
                <p className="text-sm text-(--text-muted) text-center py-6">Aucune donnée</p>
              ) : (
                Object.entries(AGENT_COLORS).map(([label, color]) => (
                  <AgentBar
                    key={label}
                    label={label}
                    count={byType[label] || 0}
                    total={total}
                    color={color}
                  />
                ))
              )}
            </div>
            <div className="px-5 pb-5">
              <Link
                to="/agents"
                className="block w-full text-center rounded-xl py-2.5 text-sm font-medium text-white transition-colors"
                style={{ background: '#0D66D4' }}
              >
                Accéder aux agents →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
