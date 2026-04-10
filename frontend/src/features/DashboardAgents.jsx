import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AGENTS = [
  { id: 'compte-rendu-intervention', title: "Compte Rendu d'Intervention", to: '/agents/compte-rendu', roles: ['agent', 'admin'] },
  { id: 'ppa-medico-social', title: 'PPA Médico-Social', to: '/agents/projet-personnalise', roles: ['agent', 'admin'] },
  { id: 'ppa-social', title: 'PPA Social', to: null, roles: ['agent', 'admin'] },
  { id: 'ecrit-educatif', title: 'Écrit Éducatif', to: null, roles: ['agent', 'admin'] },
  { id: 'bilan-evaluation', title: "Bilan d'Évaluation", to: null, roles: ['agent', 'admin'] },
  { id: 'compte-rendu-reunion', title: 'Compte Rendu de Réunion', to: null, roles: ['direction', 'admin'] },
  { id: 'veille-professionnelle', title: 'Veille Professionnelle', to: null, roles: ['direction', 'admin'] },
  { id: 'reporting-mensuel', title: 'Reporting Mensuel', to: null, roles: ['direction', 'admin'] },
  { id: 'rapport-activite', title: "Rapport d'Activité", to: null, roles: ['direction', 'admin'] },
  { id: 'bilan-activite', title: "Bilan d'Activité", to: null, roles: ['direction', 'admin'] },
  { id: 'projet-etablissement', title: "Projet d'Établissement", to: null, roles: ['direction', 'admin'] },
  { id: 'projet-service', title: 'Projet de Service', to: null, roles: ['direction', 'admin'] },
  { id: 'evaluation-interne-externe', title: 'Préparation Évaluation HAS', to: null, roles: ['direction', 'admin'] },
  { id: 'appel-projet', title: 'Appel à Projet', to: null, roles: ['direction', 'admin'] },
];

function DashboardAgents() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useSelector((state) => state.role.role);
  const visibleAgents = AGENTS.filter((a) => a.roles.includes(role));

  const isOnChildRoute = location.pathname !== '/agents';
  const activeTabParam = searchParams.get('tab');

  // Onglet actif : soit la route courante, soit le param ?tab=
  const activeAgent = isOnChildRoute
    ? AGENTS.find((a) => a.to && location.pathname.startsWith(a.to))
    : AGENTS.find((a) => a.id === activeTabParam);

  const handleTabClick = (agent) => {
    if (!agent.to) {
      setSearchParams({ tab: agent.id }, { replace: true });
    }
  };

  const isTabActive = (agent) => {
    if (agent.to) return isOnChildRoute && location.pathname.startsWith(agent.to);
    return !isOnChildRoute && activeTabParam === agent.id;
  };

  return (
    <div id="agents-page" className="h-full flex flex-col overflow-hidden">

      {/* Tab bar */}
      <div className="shrink-0 h-9 border-b border-(--border) flex overflow-x-auto scrollbar-none">
        {visibleAgents.map((agent) => {
          const active = isTabActive(agent);
          const tab = (
            <span
              className={`h-full inline-flex items-center px-4 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                active
                  ? 'bg-(--bleu-fonce)/10 text-(--bleu-fonce) border-b-2 border-(--bleu-fonce)'
                  : 'text-(--text-muted) hover:bg-(--bg-tertiary) hover:text-(--text-secondary) cursor-pointer'
              }`}
            >
              {agent.title}
            </span>
          );

          return agent.to ? (
            <Link key={agent.id} className="h-full" to={agent.to}>{tab}</Link>
          ) : (
            <button key={agent.id} className="h-full" onClick={() => handleTabClick(agent)}>{tab}</button>
          );
        })}
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {isOnChildRoute ? (
          <Outlet />
        ) : activeAgent ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-lg font-semibold text-(--text-muted)">{activeAgent.title}</p>
          </div>
        ) : null}
      </div>

    </div>
  );
}

export default DashboardAgents;
