import {
  LayoutDashboard,
  ClipboardPen,
  UserRoundPen,
  CalendarDays,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NavItem from './NavItem';
import ProfileDropdown from './ProfileDropdown';

function Sidebar() {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-(--bg-primary) shadow-sm flex-col z-50 border-r border-(--border)">
      {/* Logo + Titre */}
      <Link
        className="flex flex-col justify-center items-start gap-3 px-5 py-6"
        to="/"
      >
        <img className="h-10" src="/favicon.png" alt="Logo Synapses" />
        <span
          className="flex text-2xl font-bold text-(--text-primary)"
          style={{ fontFamily: 'Ailerons' }}
        >
          Synapses ESMS
        </span>
      </Link>

      <div className="mx-1 border-t border-(--border)" />

      {/* Navigation */}
      <nav className="flex-1 py-4 mt-20">
        <p className="flex text-(--text-muted) mb-2 px-3 mt-2">
          Menu
        </p>
        <ul className="flex flex-col gap-1 list-none mb-6">
          <NavItem titre="Tableau de bord" link="/" icon={LayoutDashboard} />
        </ul>

        <p className="flex text-(--text-muted) mb-2 px-3">Module IA</p>
        <ul className="flex flex-col gap-1 list-none mb-10">
          <NavItem
            titre="Compte rendu"
            link="/compte-rendu"
            icon={ClipboardPen}
          />
          <NavItem
            titre="Projet Personnalisé"
            link="/projet-personnalise"
            icon={UserRoundPen}
          />
          <NavItem titre="Compte rendu réunion" icon={CalendarDays} disabled />
        </ul>

        <p className="flex text-(--text-muted) mb-2 px-3">Gestion</p>
        <ul className="flex flex-col gap-1 list-none mb-4">
          <NavItem
            titre="Historique"
            link="/historique"
            icon={LayoutDashboard}
          />
        </ul>
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
