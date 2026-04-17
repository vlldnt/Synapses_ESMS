import { useLocation } from 'react-router-dom';
import faviconUrl from '/favicon.png';
import ProfileDropdown from './ProfileDropdown';

const routeTitles = {
  '/': {
    title: 'Tableau de bord',
    subtitle: "Vue d\u2019ensemble de votre activit\u00e9 et acc\u00e8s rapide aux fonctionnalit\u00e9s",
  },
  '/agents': {
    title: 'Agents IA',
    subtitle: 'S\u00e9lectionnez un rapport pour commencer',
  },
  '/agents/compte-rendu': {
    title: 'Compte Rendu d\u2019Intervention',
    subtitle: 'G\u00e9n\u00e9rez un compte rendu d\u2019intervention',
  },
  '/agents/projet-personnalise': {
    title: 'PPA M\u00e9dico-Social',
    subtitle: 'G\u00e9n\u00e9rez un projet personnalis\u00e9',
  },
  '/interventions': {
    title: 'Interventions',
    subtitle: 'Consultez l\u2019historique de vos interventions',
  },
  '/historique': {
    title: 'Historique',
    subtitle: "Consultez, g\u00e9rez et retrouvez l\u2019ensemble de vos documents g\u00e9n\u00e9r\u00e9s",
  },
};

function TopBar() {
  const location = useLocation();
  const { title, subtitle } =
    routeTitles[location.pathname] || routeTitles['/'];

  return (
    <header
      id="topBar"
      className="sticky top-0 z-40 w-full h-14 md:h-16 bg-(--bg-primary) border-b border-(--border)"
    >
      <div className="h-full px-4 md:px-5 flex items-center gap-2 md:gap-3">
        <div className="md:hidden flex flex-col items-center leading-none">
          <img className="h-6 w-6" src={faviconUrl} alt="Logo Synapses" />
          <span
            className="text-[9px] text-(--text-muted)"
            style={{ fontFamily: 'Ailerons' }}
          >
            Synapses
          </span>
        </div>
        <div id="page-title" className="flex flex-col leading-tight">
          <h1 className="text-lg md:text-2xl font-bold text-(--text-primary)">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden md:block text-xs text-(--text-muted)">
              {subtitle}
            </p>
          )}
        </div>
        <div className="ml-auto md:hidden">
          <ProfileDropdown mobile />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
