import NavItem from './NavItem';
import ProfileDropdown from './ProfileDropdown';
import {
  LayoutDashboard,
  UserRoundPen,
  ClipboardPen,
  History,
} from 'lucide-react';

function MobileMenu() {
  return (
    <>
      <div className="fixed top-2 right-2 z-70">
        <ProfileDropdown mobile />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-60 border-t border-(--border) bg-(--bg-primary) px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
        <ul className="grid grid-cols-4 gap-1 list-none m-0 p-0">
          <NavItem
            titre="Tableau de bord"
            link="/"
            icon={LayoutDashboard}
            mobile
          />
          <NavItem
            titre="Compte rendu"
            link="/compte-rendu"
            icon={ClipboardPen}
            mobile
          />
          <NavItem
            titre="Projet Personalisé"
            link="/projet-personnalise"
            icon={UserRoundPen}
            mobile
          />
          <NavItem titre="Historique" link="/historique" icon={History} mobile />
        </ul>
      </nav>
    </>
  );
}

export default MobileMenu;
