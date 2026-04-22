import Dashboard from '../features/Dashboard';
import InterventionReport from '../features/InterventionReport';
import PersonalizedProject from '../features/PersonalizedProject';
import Archives from '../features/Archives';

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
    path: '/cri',
    element: <InterventionReport />,
    title: "Compte Rendu d'Intervention",
  },
  {
    path: '/ppa',
    element: <PersonalizedProject />,
    title: 'PPA Médico-Social',
  },
  {
    path: '/archives',
    element: <Archives />,
    title: 'Archives',
  },
];
