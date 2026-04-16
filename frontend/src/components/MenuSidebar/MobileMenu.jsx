import NavItem from './NavItem';
import {
  LayoutDashboard,
  BotMessageSquare,
  History,
} from 'lucide-react';

function MobileMenu() {
  return (
    <nav id="mobile-menu" className="fixed bottom-0 left-0 right-0 z-60 border-t border-(--border) bg-(--bg-primary) px-0 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-0 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
      <ul id="mobile-menu-list" className="grid grid-cols-3 gap-0 list-none m-0 p-0">
        <NavItem titre="Tableau de bord" link="/" icon={LayoutDashboard} mobile />
        <NavItem titre="Générer un document" link="/agents/compte-rendu" icon={BotMessageSquare} mobile />
        <NavItem titre="Historique" link="/historique" icon={History} mobile />
      </ul>
    </nav>
  );
}

export default MobileMenu;
