import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getHistory } from '../services/historyService';
import { Bot, FileText } from 'lucide-react';

const AGENTS = [
  {
    id: 'compte-rendu-intervention',
    title: 'Compte Rendu d\'Intervention',
    description: 'Saisissez vos notes brutes, l\'IA génère un écrit structuré et professionnel adapté au secteur ESMS.',
    color: '#0D66D4',
    to: '/compte-rendu',
  },
  {
    id: 'ppa-medico-social',
    title: 'PPA Médico-Social',
    description: 'Construisez un PPA structuré, aligné avec le référentiel SERAFIN-PH, avec des objectifs SMART générés par l\'IA.',
    color: '#16a34a',
    to: '/projet-personnalise',
  },
  {
    id: 'ppa-social',
    title: 'PPA Social',
    description: 'Élaborez un projet personnalisé d\'accompagnement social avec axes d\'intervention et indicateurs de suivi.',
    color: '#15803d',
    to: '',
  },
  {
    id: 'ecrit-educatif',
    title: 'Écrit Éducatif',
    description: 'Rédigez des écrits éducatifs professionnels : notes de situation, synthèses, transmissions.',
    color: '#7c3aed',
    to: '',
  },
  {
    id: 'bilan-evaluation',
    title: 'Bilan d\'Évaluation',
    description: 'Structurez un bilan d\'évaluation complet des compétences, acquis et axes de progression.',
    color: '#9333ea',
    to: '',
  },
  {
    id: 'compte-rendu-reunion',
    title: 'Compte Rendu de Réunion',
    description: 'Synthèse automatique des réunions d\'équipe, de synthèse ou pluridisciplinaires.',
    color: '#ea580c',
    to: '',
  },
  {
    id: 'veille-professionnelle',
    title: 'Veille Professionnelle / Réglementaire',
    description: 'Résumés de textes législatifs, circulaires et actualités du secteur médico-social.',
    color: '#0891b2',
    to: '',
  },
  {
    id: 'reporting-mensuel',
    title: 'Reporting Mensuel Direction',
    description: 'Générez un reporting mensuel structuré pour la direction à partir de vos indicateurs d\'activité.',
    color: '#0e7490',
    to: '',
  },
  {
    id: 'rapport-activite',
    title: 'Rapport d\'Activité',
    description: 'Rédigez votre rapport d\'activité annuel avec synthèse des données, faits marquants et perspectives.',
    color: '#b45309',
    to: '',
  },
  {
    id: 'bilan-activite',
    title: 'Bilan d\'Activité',
    description: 'Construisez un bilan d\'activité synthétique avec analyse des résultats et recommandations.',
    color: '#d97706',
    to: '',
  },
  {
    id: 'projet-etablissement',
    title: 'Projet d\'Établissement',
    description: 'Élaborez ou actualisez votre projet d\'établissement en cohérence avec les exigences HAS.',
    color: '#be123c',
    to: '',
  },
  {
    id: 'projet-service',
    title: 'Projet de Service',
    description: 'Rédigez votre projet de service avec missions, valeurs, modalités d\'accompagnement et objectifs.',
    color: '#e11d48',
    to: '',
  },
  {
    id: 'evaluation-interne-externe',
    title: 'Préparation Évaluation Interne / Externe',
    description: 'Préparez votre évaluation HAS avec grilles, auto-diagnostic et plans d\'amélioration.',
    color: '#475569',
    to: '',
  },
  {
    id: 'appel-projet',
    title: 'Réponse à Appel à Projet / Appel d\'Offres',
    description: 'Structurez votre réponse à un appel à projet ou appel d\'offres du secteur social et médico-social.',
    color: '#334155',
    to: '',
  },
];

const ACTIVE_AGENTS = AGENTS.filter((a) => a.to);

function AgentCard({ agent }) {
  const active = !!agent.to;
  const baseClass = 'rounded-2xl border border-(--border) bg-(--bg-primary) p-3 md:p-5 shadow-sm transition-all duration-200';

  const inner = (
    <>
      <h2 className="mt-2 text-base md:text-lg font-semibold text-(--text-primary)">
        {agent.title}
      </h2>
      <p className="mt-2 text-xs md:text-sm leading-6 text-(--text-secondary) line-clamp-2">
        {agent.description}
      </p>
      <span
        className="mt-4 inline-flex text-sm font-semibold"
        style={{ color: active ? agent.color : 'var(--text-muted)' }}
      >
        {active ? 'Ouvrir l\'agent →' : 'Bientôt disponible'}
      </span>
    </>
  );

  return active ? (
    <Link
      to={agent.to}
      className={`block ${baseClass} hover:-translate-y-0.5 hover:shadow-md`}
      style={{ borderTop: `4px solid ${agent.color}` }}
    >
      {inner}
    </Link>
  ) : (
    <article
      className={`${baseClass} opacity-60 cursor-not-allowed`}
      style={{ borderTop: `4px solid ${agent.color}` }}
    >
      {inner}
    </article>
  );
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

function DashboardAgents() {
  const user = useSelector((state) => state.auth.user);
  const [date, setDate] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(now);
    const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(now);
    const month = new Intl.DateTimeFormat('fr-FR', { month: '2-digit' }).format(now);
    const year = new Intl.DateTimeFormat('fr-FR', { year: 'numeric' }).format(now);
    setDate(`${weekday} ${day}/${month}/${year}`);
    setHistory(getHistory());
  }, []);

  const etablissement = user?.etablissement ?? '';
  const recent = history.slice(0, 3);

  return (
    <div id="agents-page" className="h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8">
      <div className="mx-auto w-full flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-xl md:text-3xl text-(--text-primary)">Agents IA</h1>
          <p className="mt-1 text-xs md:text-sm text-(--text-muted)">
            {date}{etablissement ? ` — ${etablissement}` : ''}
          </p>
        </div>

        {/* Agents actifs + derniers docs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Agents actifs */}
          <div className="lg:col-span-2 rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm">
            <div className="px-5 pt-5 pb-3 border-b border-(--border)">
              <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Agents disponibles</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACTIVE_AGENTS.map((agent) => (
                <Link
                  key={agent.id}
                  to={agent.to}
                  className="flex items-center gap-3 rounded-xl border border-(--border) p-3 hover:bg-(--bg-secondary) transition-colors"
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ background: `${agent.color}18` }}>
                    <Bot size={16} style={{ color: agent.color }} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-(--text-primary) truncate">{agent.title}</p>
                    <p className="text-xs text-(--text-muted) truncate">{agent.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Derniers documents */}
          <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-(--border)">
              <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Derniers documents</h2>
              <Link to="/historique" className="text-xs text-(--bleu-fonce) hover:underline">Voir tout</Link>
            </div>
            <div className="divide-y divide-(--border)/50">
              {recent.length === 0 ? (
                <p className="px-5 py-8 text-sm text-(--text-muted) text-center">Aucun document</p>
              ) : (
                recent.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 bg-(--bg-secondary)">
                      <FileText size={13} className="text-(--text-muted)" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-(--text-primary) truncate">{entry.interventionType || 'Document'}</p>
                      <p className="text-[10px] text-(--text-muted)">Réf. {entry.reference}</p>
                    </div>
                    <span className="text-[10px] text-(--text-muted) shrink-0">{timeAgo(entry.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
            {recent.length > 0 && (
              <div className="px-5 pb-4 pt-2">
                <Link to="/historique" className="block w-full text-center rounded-xl py-2 text-xs font-medium border border-(--border) text-(--text-secondary) hover:bg-(--bg-secondary) transition-colors">
                  Voir l'historique complet
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tous les agents */}
        <div>
          <h2 className="text-sm font-semibold text-(--text-muted) mb-4 uppercase tracking-wide">Tous les agents</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {AGENTS.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardAgents;
