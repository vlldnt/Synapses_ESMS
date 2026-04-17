import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import NavItem from './NavItem';
import {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
} from 'lucide-react';
import { getMenusByRole } from '../../services/menu.service';

/**
 * Map les noms d'icônes Lucide vers les composants
 */
const ICON_MAP = {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
};

function MobileMenu() {
  const [menus, setMenus] = useState([]);
  const role = useSelector((state) => state.role.role);

  useEffect(() => {
    const allMenus = getMenusByRole(role);
    // Limiter à 3 items principaux pour le mobile
    setMenus(allMenus.slice(0, 3));
  }, [role]);

  return (
    <nav id="mobile-menu" className="fixed bottom-0 left-0 right-0 z-60 border-t border-(--border) bg-(--bg-primary) px-0 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-0 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
      <ul id="mobile-menu-list" className="grid grid-cols-3 gap-0 list-none m-0 p-0">
        {menus.map((menu) => {
          const IconComponent = ICON_MAP[menu.icon] || LayoutDashboard;
          return (
            <NavItem
              key={menu.id}
              titre={menu.label}
              link={menu.route}
              icon={IconComponent}
              mobile
            />
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileMenu;
