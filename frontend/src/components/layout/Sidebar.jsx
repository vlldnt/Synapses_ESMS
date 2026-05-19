import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import faviconUrl from '/favicon.png';
import {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Cookie,
} from 'lucide-react';
import NavItem from './NavItem';
import ProfileDropdown from './ProfileDropdown';
import { MENUS } from '../../constants/menus';
import { AGENTS } from '../../constants/agents';
import { useCookieModal } from '../cookies/ConsentBanner';

const DEV_USER_IDS = new Set([
  '8eb164ea-36e1-417b-b843-b5370dc905ff',
  '09eca25d-d955-4136-93f2-4467f2df37eb',
  '3cc14d1c-591d-468b-bad4-bfa0e79b25f4',
  '1c38aaee-4a20-43b3-bb92-92cd4f898dc1',
  'b6f01e00-b5fc-4ad8-98fc-f1dda88f9edf',
]);

const ICON_MAP = {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
  ShieldCheck,
};

function AgentsNavItem({ label, role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const agentRoutes = AGENTS.filter((a) => a.to).map((a) => a.to);
  const isOnAgents = agentRoutes.some((r) => location.pathname === r);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isOnAgents) setOpen(true);
  }, [isOnAgents]);

  const visibleAgents = AGENTS.filter((a) => a.roles.includes(role));

  return (
    <li className="list-none">
      {/* Bouton principal */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex justify-start items-center w-full gap-3 px-5 py-3 text-sm transition-colors duration-200 rounded-xs cursor-pointer ${
          isOnAgents
            ? 'text-(--bleu-fonce) bg-(--bleu-fonce)/10 font-semibold border-l-4 border-(--bleu-fonce)'
            : 'text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)'
        }`}
      >
        <BotMessageSquare className="w-5 h-5 shrink-0" />
        <p className="flex-1 text-left">{label}</p>
        <ChevronRight
          size={13}
          className={`shrink-0 transition-transform duration-300 ease-in-out ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Accordéon — grid-template-rows pour animation fluide vers auto */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-0.5 pt-1 pb-2 pl-3 pr-2">
            {visibleAgents.map((agent) => {
              const color = agent.color;
              const isActive = agent.to
                ? location.pathname.startsWith(agent.to)
                : location.search.includes(agent.id);

              return (
                <li key={agent.id} className="list-none">
                  {agent.to ? (
                    <NavLink
                      to={agent.to}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors duration-150"
                      style={({ isActive: a }) =>
                        a
                          ? { color, background: `${color}18`, fontWeight: 600 }
                          : { color }
                      }
                    >
                      <span className="truncate">{agent.title}</span>
                    </NavLink>
                  ) : (
                    <button
                      onClick={() => navigate('/')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors duration-150 cursor-pointer hover:bg-(--bg-secondary)"
                      style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                    >
                      <span className="truncate">{agent.title}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </li>
  );
}

function Sidebar() {
  const role = useSelector((state) => state.role.role);
  const user = useSelector((state) => state.auth.user);
  const { openModal, modal } = useCookieModal();
  const isDev =
    DEV_USER_IDS.has(user?.id) &&
    role === 'admin' &&
    user?.job === 'Administrateur';
  const filtered = MENUS.filter((m) => m.roleAccess.includes(role));
  const menusBySection = filtered.reduce((acc, m) => {
    const s = m.section || 'Menu';
    if (!acc[s]) acc[s] = [];
    acc[s].push(m);
    return acc;
  }, {});

  return (
    <aside id="sidebar" className="hidden md:flex fixed left-0 top-0 h-dvh w-64 bg-(--bg-primary) shadow-sm flex-col z-50 border-r border-(--border)">
      {/* Logo */}
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

      {/* Navigation */}
      <nav id="sidebar-nav" className="flex-1 py-4 mt-20 overflow-y-auto">
        {Object.entries(menusBySection).map(([section, items]) => (
          <div key={section}>
            <p className="flex text-(--text-muted) mb-2 px-3 mt-2 uppercase text-xs font-semibold">
              {section}
            </p>
            <ul className="flex flex-col gap-1 list-none mb-6">
              {items.map((menu) => {
                const isAgentsItem = menu.id === 'agents';
                if (isAgentsItem) {
                  return (
                    <AgentsNavItem key={menu.id} label={menu.label} role={role} />
                  );
                }
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

      {isDev && (
        <>
          <div className="mx-1 border-t border-(--border)" />
          <div className="px-3 py-3">
            <p className="text-(--text-muted) mb-1.5 px-2 uppercase text-[10px] font-semibold tracking-wider">
              Dev
            </p>
            <NavLink
              to="/dev"
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-amber-500/10 text-amber-500 font-semibold'
                    : 'text-(--text-muted) hover:bg-(--bg-tertiary) hover:text-(--text-primary)',
                ].join(' ')
              }
            >
              <Terminal size={15} className="shrink-0" />
              Développeur
            </NavLink>
          </div>
        </>
      )}

      <div className="mx-1 border-t border-(--border)" />

      {/* Cookies + Profil */}
      <div className="px-3 pt-2 pb-1">
        <button
          onClick={openModal}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-[11px] text-(--text-muted) hover:bg-(--bg-tertiary) hover:text-(--text-primary) transition-colors cursor-pointer"
        >
          <Cookie size={13} className="shrink-0" />
          <span>Gestion des cookies</span>
        </button>
      </div>
      <div className="px-3 pb-4">
        <ProfileDropdown />
      </div>

      {modal}
    </aside>
  );
}

export default Sidebar;
