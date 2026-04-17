import Dashboard from '../features/Dashboard';
import DashboardAgents from '../features/DashboardAgents';
import InterventionReport from '../features/InterventionReport';
import PersonalizedProject from '../features/PersonalizedProject';
import History from '../features/History';

/**
 * Configuration centralisée des routes
 * Chaque route peut avoir:
 * - path: le chemin URL
 * - element: le composant React à afficher
 * - title: le titre affiché dans TopBar (optionnel)
 * - children: routes enfants (optionnel)
 */
export const routes = [
  {
    path: '/',
    element: <Dashboard />,
    title: 'Tableau de bord',
  },
  {
    path: '/agents',
    element: <DashboardAgents />,
    title: 'Agents IA',
    children: [
      {
        index: true,
        path: 'compte-rendu',
        element: <InterventionReport />,
        title: 'Compte rendu',
      },
      {
        path: 'projet-personnalise',
        element: <PersonalizedProject />,
        title: 'PPA',
      },
    ],
  },
  {
    path: '/historique',
    element: <History />,
    title: 'Historique',
  },
];
