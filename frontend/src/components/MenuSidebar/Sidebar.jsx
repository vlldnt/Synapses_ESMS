import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import faviconUrl from '/favicon.png';
import {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import NavItem from './NavItem';
import ProfileDropdown from './ProfileDropdown';
import { getMenusBySection } from '../../services/menu.service';
import { AGENTS, AGENT_CARD_COLORS } from '../../constants/agents';

const ICON_MAP = {
  LayoutDashboard,
  BotMessageSquare,
  History,
  ClipboardList,
};

function AgentsNavItem({ label, role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const agentRoutes = AGENTS.filter((a) => a.to).map((a) => a.to);
  const isOnAgents = agentRoutes.some((r) => location.pathname === r);
  const [open, setOpen] = useState(isOnAgents);

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
            ? 'text-(--bleu-fonce) bg-(--bg-tertiary) font-semibold border-l-4 border-(--bleu-fonce)'
            : 'text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--bleu-fonce)'
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
              const color = AGENT_CARD_COLORS[agent.id] || '#0D66D4';
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
                          ? { color, background: `${color}12`, fontWeight: 600 }
                          : { color: 'var(--text-muted)' }
                      }
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: isActive ? color : 'var(--text-muted)' }}
                      />
                      <span className="truncate">{agent.title}</span>
                    </NavLink>
                  ) : (
                    <button
                      onClick={() => navigate('/')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors duration-150 cursor-pointer hover:bg-(--bg-secondary)"
                      style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: color, opacity: 0.4 }}
                      />
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

      <div className="mx-1 border-t border-(--border)" />

      {/* Profil */}
      <div className="px-3 py-4">
        <ProfileDropdown />
      </div>
    </aside>
  );
}

export default Sidebar;
