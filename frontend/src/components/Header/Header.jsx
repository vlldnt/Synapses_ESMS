import { House, FileText, List } from 'lucide-react';
import ItemList from './ItemList';
import ProfileDropdown from './ProfileDropdown';

function Header() {
  return (
    <header className="hidden md:flex w-full justify-center h-20 bg-white shadow-sm">
      <div className="h-full w-4/5 flex justify-between items-center">
        {/* Logo + Titre */}
        <a className="flex items-center gap-3 h-full w-1/5" href="/">
          <img className="h-3/5" src="/favicon.png" alt="Logo Synapses" />
          <span
            className="text-4xl font-bold text-gray-800"
            style={{ fontFamily: 'Ailerons' }}
          >
            Synapses
          </span>
        </a>

        {/* Menu central */}
        <nav className="w-3/5 flex justify-center">
          <ul className="flex gap-10 list-none">
            <ItemList titre="Accueil" link="#" icon={House} />
            <ItemList titre="Rapport" link="#" icon={FileText} />
            <ItemList titre="Liste" link="#" icon={List} />
          </ul>
        </nav>

        {/* Profil dropdown */}
        <div className="w-1/5 flex justify-end">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}

export default Header;
