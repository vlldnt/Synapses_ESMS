import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import NavItem from './NavItem';
import {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { MENUS } from '../../constants/menus';

const ICON_MAP = {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
  ShieldCheck,
};

const DEV_USER_IDS = new Set([
  '09eca25d-d955-4136-93f2-4467f2df37eb',
  '3cc14d1c-591d-468b-bad4-bfa0e79b25f4',
  '1c38aaee-4a20-43b3-bb92-92cd4f898dc1',
  'b6f01e00-b5fc-4ad8-98fc-f1dda88f9edf',
]);

function MobileMenu() {
  const role = useSelector((state) => state.role.role);
  const user = useSelector((state) => state.auth.user);
  const isDev =
    DEV_USER_IDS.has(user?.id) &&
    role === 'admin' &&
    user?.job === 'Administrateur';

  const menus = MENUS.filter((m) => m.roleAccess.includes(role));
  const cols = isDev ? menus.length + 1 : menus.length;

  return (
    <nav id="mobile-menu" className="fixed bottom-0 left-0 right-0 z-60 border-t border-(--border) bg-(--bg-primary) px-0 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-0 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
      <ul
        id="mobile-menu-list"
        className="grid gap-0 list-none m-0 p-0"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
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

        {isDev && (
          <li className="list-none">
            <NavLink
              to="/dev"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0 min-h-14 px-0 py-0 rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'text-amber-500 bg-amber-500/10 font-semibold'
                    : 'text-(--text-muted) hover:bg-amber-500/10 hover:text-amber-500'
                }`
              }
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <p className="text-[10px] leading-3 text-center">Dev</p>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default MobileMenu;
