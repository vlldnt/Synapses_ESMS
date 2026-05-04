import { useSelector } from 'react-redux';
import NavItem from './NavItem';
import {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
} from 'lucide-react';
import { MENUS } from '../../constants/menus';

const ICON_MAP = {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
};

function MobileMenu() {
  const role = useSelector((state) => state.role.role);
  const menus = MENUS.filter((m) => m.roleAccess.includes(role)).slice(0, 3);

  return (
    <nav id="mobile-menu" className="fixed bottom-0 left-0 right-0 z-60 border-t border-(--border) bg-(--bg-primary) px-0 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-0 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
      <ul id="mobile-menu-list" className="grid grid-cols-3 gap-0 list-none m-0 p-0">
        {menus.map((menu) => {
          const IconComponent = ICON_MAP[menu.icon] || LayoutDashboard;
          const activeRoutes = menu.id === 'agents' ? ['/compte_rendu_intervention', '/projet_personnalise_medico_social'] : [];
          return (
            <NavItem
              key={menu.id}
              titre={menu.label}
              link={menu.route}
              icon={IconComponent}
              mobile
              activeRoutes={activeRoutes}
            />
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileMenu;
