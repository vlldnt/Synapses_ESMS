import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

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

function AgentCard({ agent }) {
  const active = !!agent.to;
  const baseClass = 'rounded-2xl border border-(--border) bg-(--bg-primary) p-3 md:p-5 shadow-sm transition-all duration-200';
  const activeClass = `${baseClass} hover:-translate-y-0.5 hover:shadow-md`;
  const disabledClass = `${baseClass} opacity-60 cursor-not-allowed`;

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
      className={`block ${activeClass}`}
      style={{ borderTop: `4px solid ${agent.color}` }}
    >
      {inner}
    </Link>
  ) : (
    <article
      className={disabledClass}
      style={{ borderTop: `4px solid ${agent.color}` }}
    >
      {inner}
    </article>
  );
}

function DashboardAgents() {
  const user = useSelector((state) => state.auth.user);
  const [date, setDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(now);
    const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(now);
    const month = new Intl.DateTimeFormat('fr-FR', { month: '2-digit' }).format(now);
    const year = new Intl.DateTimeFormat('fr-FR', { year: 'numeric' }).format(now);
    setDate(`${weekday} ${day}/${month}/${year}`);
  }, []);

  const etablissement = user?.etablissement ?? '';

  return (
    <div id="agents-page" className="h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8">
      <div className="mx-auto flex w-full flex-col items-center justify-center">
        <div className="w-full text-left md:flex md:flex-col">
          <h1 className="text-xl md:text-3xl text-(--text-primary) whitespace-nowrap">
            Agents IA
          </h1>
          <p className="mt-1 text-xs md:text-sm text-(--text-muted)">
            {date}{etablissement ? ` - ${etablissement}` : ''}
          </p>
        </div>

        <div className="mt-8 w-full">
          <p className="text-xs text-(--text-muted) mb-6">
            {AGENTS.length} agents disponibles prochainement — sélectionnez un agent pour démarrer.
          </p>
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
