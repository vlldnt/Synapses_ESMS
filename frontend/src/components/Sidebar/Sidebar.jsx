import { LayoutDashboard, ClipboardPen, UserRoundPen } from 'lucide-react';
import { Link } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import ProfileDropdown from './ProfileDropdown';

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 lg:w-64 bg-(--bg-primary) shadow-sm flex flex-col z-50 border-r border-(--border)">
      {/* Logo + Titre */}
      <Link className="flex flex-col justify-center items-center lg:items-start gap-2 lg:gap-3 px-0 lg:px-5 py-3 lg:py-6" to="/">
        <img className="h-8 w-8 lg:h-10" src="/favicon.png" alt="Logo Synapses" />
        <span
          className="hidden lg:flex text-2xl font-bold text-(--text-primary)"
          style={{ fontFamily: 'Ailerons' }}
        >
          Synapses ESMS
        </span>
      </Link>

      <div className="mx-1 border-t border-(--border)" />

      {/* Navigation */}
      <nav className="flex-1 py-4 mt-20">
        <p className="hidden lg:flex text-(--text-muted) mb-2 px-3 mt-2">Module IA</p>
        <ul className="flex flex-col gap-1 list-none mb-10">
          <SidebarItem
            titre="Tableau de bord"
            link="/"
            icon={LayoutDashboard}
          />
          <SidebarItem titre="Compte rendu" link="/compte-rendu" icon={ClipboardPen} />
          <SidebarItem
            titre="Projet Personnalisé"
            link="/projet-personnalise"
            icon={UserRoundPen}
          />
        </ul>

        <p className="hidden lg:flex text-(--text-muted) mb-2 px-3">Gestion</p>
        <ul className="flex flex-col gap-1 list-none mb-4">
          <SidebarItem titre="Historique" link="/historique" icon={LayoutDashboard} />
          <SidebarItem titre="Enfants" link="/enfants" icon={UserRoundPen} />
        </ul>
      </nav>

      <div className="mx-1 border-t border-(--border)" />

      {/* Profil dropdown */}
      <div className="px-1 lg:px-3 py-4">
        <ProfileDropdown />
      </div>
    </aside>
  );
}

export default Sidebar;
