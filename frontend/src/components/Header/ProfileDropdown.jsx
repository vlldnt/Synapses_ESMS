import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLogged } from '../../store/authSlice';
import { User, LogOut, ChevronDown } from 'lucide-react';

function ProfileDropdown({ initials = 'AV', photo = null }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(setLogged(false));
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer rounded-full transition-all duration-200 hover:ring-2 hover:ring-(--bleu-clair) p-1"
      >
        {photo ? (
          <img
            src={photo}
            alt="Photo de profil"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-(--bleu-fonce) flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
        )}
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menu déroulant */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            onClick={() => setOpen(false)}
          >
            <User size={18} className="text-(--bleu-fonce)" />
            <span className="font-medium">Profil</span>
          </a>

          <div className="mx-3 my-1 border-t border-gray-100" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
          >
            <LogOut size={18} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
