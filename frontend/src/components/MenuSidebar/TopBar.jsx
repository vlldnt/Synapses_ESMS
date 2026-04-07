import { useLocation } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';

const routeTitles = {
  '/': { title: 'Tableau de bord' },
  '/compte-rendu': { title: "Compte rendu d'intervention", subtitle: 'Rédaction professionnelle assistée par IA' },
  '/projet-personnalise': { title: 'Projet Personnalisé' },
  '/historique': { title: 'Historique' },
  '/enfants': { title: 'Enfants' },
};

function TopBar() {
  const location = useLocation();
  const { title, subtitle } = routeTitles[location.pathname] || routeTitles['/'];

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
        <div id="page-title" className="flex flex-col leading-tight">
          <h1 className="text-lg md:text-2xl font-bold text-(--text-primary)">{title}</h1>
          {subtitle && (
            <p className="hidden md:block text-xs text-(--text-muted)">{subtitle}</p>
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
