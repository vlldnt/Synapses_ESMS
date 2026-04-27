import Dashboard from '../features/Dashboard';
import InterventionReport from '../features/InterventionReport';
import PersonalizedProject from '../features/PersonalizedProject';
import Archives from '../features/Archives';

export const routes = [
  {
    path: '/',
    element: <Dashboard />,
    title: 'Tableau de bord',
  },
  {
    path: '/compte_rendu_intervention',
    element: <InterventionReport />,
    title: "Compte Rendu d'Intervention",
  },
  {
    path: '/projet_personnalise_medico_social',
    element: <PersonalizedProject />,
    title: 'PPA Médico-Social',
  },
  {
    path: '/archives',
    element: <Archives />,
    title: 'Archives',
  },
];
