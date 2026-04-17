import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import faviconUrl from '/favicon.png';
import {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NavItem from './NavItem';
import ProfileDropdown from './ProfileDropdown';
import { getMenusBySection } from '../../services/menu.service';

/**
 * Map les noms d'icônes Lucide vers les composants
 */
const ICON_MAP = {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
};

function Sidebar() {
  const [menusBySection, setMenusBySection] = useState({});
  const role = useSelector((state) => state.role.role);

  useEffect(() => {
    (async () => {
      try {
        const menus = await getMenusBySection(role);
        setMenusBySection(menus);
      } catch (err) {
        console.error('Failed to load menus:', err);
      }
    })();
  }, [role]);

  return (
    <aside id="sidebar" className="hidden md:flex fixed left-0 top-0 h-dvh w-64 bg-(--bg-primary) shadow-sm flex-col z-50 border-r border-(--border)">
      {/* Logo + Titre */}
      <Link
        id="sidebar-logo"
        className="flex flex-col justify-center items-start gap-3 px-5 py-6"
        to="/"
      >
        <img className="h-10" src={faviconUrl} alt="Logo Synapses" />
        <span
          className="flex text-2xl font-bold text-(--text-primary)"
          style={{ fontFamily: 'Ailerons' }}
        >
          Synapses ESMS
        </span>
      </Link>

      <div className="mx-1 border-t border-(--border)" />

      {/* Navigation dynamique par section */}
      <nav id="sidebar-nav" className="flex-1 py-4 mt-20">
        {Object.entries(menusBySection).map(([section, items]) => (
          <div key={section}>
            <p className="flex text-(--text-muted) mb-2 px-3 mt-2 uppercase text-xs font-semibold">
              {section}
            </p>
            <ul className="flex flex-col gap-1 list-none mb-6">
              {items.map((menu) => {
                const IconComponent = ICON_MAP[menu.icon] || LayoutDashboard;
                return (
                  <NavItem
                    key={menu.id}
                    titre={menu.label}
                    link={menu.route}
                    icon={IconComponent}
                  />
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-1 border-t border-(--border)" />

      {/* Profil dropdown */}
      <div className="px-3 py-4">
        <ProfileDropdown />
      </div>
    </aside>
  );
}

export default Sidebar;
