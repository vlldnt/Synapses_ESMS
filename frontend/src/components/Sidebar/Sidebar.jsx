import { House, FileText, List } from 'lucide-react';
import SidebarItem from './SidebarItem';
import ProfileDropdown from './ProfileDropdown';

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-(--bg-primary) shadow-sm flex flex-col z-50 border-r border-(--border)">
      {/* Logo + Titre */}
      <a className="flex flex-col items-start gap-3 px-5 py-6" href="/">
        <img className="h-20" src="/favicon.png" alt="Logo Synapses" />
        <span
          className="text-2xl font-bold text-(--text-primary)"
          style={{ fontFamily: 'Ailerons' }}
        >
          Synapses ESMS
        </span>
      </a>

      <div className="mx-4 border-t border-(--border)" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1 list-none">
          <SidebarItem titre="Accueil" link="#" icon={House} />
          <SidebarItem titre="Rapport" link="#" icon={FileText} />
          <SidebarItem titre="Liste" link="#" icon={List} />
        </ul>
      </nav>

      <div className="mx-4 border-t border-(--border)" />

      {/* Profil dropdown */}
      <div className="px-3 py-4">
        <ProfileDropdown />
      </div>
    </aside>
  );
}

export default Sidebar;
