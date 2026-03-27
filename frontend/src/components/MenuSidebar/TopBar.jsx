import { useLocation } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';

const routeTitles = {
  '/': 'Tableau de bord',
  '/compte-rendu': 'Compte rendu',
  '/projet-personnalise': 'Projet Personnalisé',
  '/historique': 'Historique',
  '/enfants': 'Enfants',
};

function TopBar() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Tableau de bord';

  return (
    <header
      id="topBar"
      className="sticky top-0 z-40 w-full h-14 md:h-16 bg-(--bg-primary) border-b border-(--border)"
    >
      <div className="h-full px-4 md:px-5 flex items-center gap-2 md:gap-3">
        <div className="md:hidden flex flex-col items-center leading-none">
          <img className="h-6 w-6" src="/favicon.png" alt="Logo Synapses" />
          <span
            className="text-[9px] text-(--text-muted)"
            style={{ fontFamily: 'Ailerons' }}
          >
            Synapses
          </span>
        </div>
        <h1 className="text-lg md:text-2xl font-bold text-(--text-primary)">
          {title}
        </h1>
        <div className="ml-auto md:hidden">
          <ProfileDropdown mobile />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
