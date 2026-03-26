import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLogged } from '../../store/authSlice';
import { setTheme } from '../../store/themeSlice';
import { User, LogOut, Sun, Moon, ChevronDown } from 'lucide-react';

function ProfileDropdown({
  initials = 'AV',
  fullname = 'Adrien Vieilledent',
  photo = null,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimeout = useRef(null);
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    dispatch(setTheme(isDark ? 'light' : 'dark'));
  };

  const clearCloseTimeout = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  };

  const startCloseTimeout = () => {
    clearCloseTimeout();
    closeTimeout.current = setTimeout(() => setOpen(false), 1000);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearCloseTimeout();
    };
  }, []);

  const handleLogout = () => {
    dispatch(setLogged(false));
    setOpen(false);
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => {
        clearCloseTimeout();
        setOpen(true);
      }}
      onMouseLeave={startCloseTimeout}
    >
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center lg:justify-start gap-3 w-full cursor-pointer rounded-lg px-1 lg:px-3 py-2.5 transition-all duration-200 hover:bg-(--bg-tertiary)"
      >
        {photo ? (
          <img
            src={photo}
            alt="Photo de profil"
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-(--bleu-fonce) flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {initials}
          </div>
        )}
        <span className="hidden lg:flex font-medium text-(--text-primary) text-sm">
          {fullname}
        </span>
        <ChevronDown
          size={16}
          className={`hidden lg:flex ml-auto text-(--text-muted) transition-transform duration-200 ${open ? '' : 'rotate-180'}`}
        />
      </button>

      {/* Menu (s'ouvre vers le haut) */}
      {open && (
        <div className="absolute bottom-full left-full ml-2 mb-2 w-56 lg:w-full lg:left-0 lg:ml-0 bg-(--bg-primary) rounded-xl shadow-lg border border-(--border) py-2 z-70">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 text-(--text-primary) hover:bg-(--bg-tertiary) transition-colors duration-150"
            onClick={() => setOpen(false)}
          >
            <User size={18} className="text-(--bleu-fonce)" />
            <span className="font-medium">Profil</span>
          </a>

          <div className="mx-3 my-1 border-t border-(--border)" />

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-(--text-primary) hover:bg-(--bg-tertiary) transition-colors duration-150 cursor-pointer"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-medium">
              {isDark ? 'Mode clair' : 'Mode sombre'}
            </span>
          </button>

          <div className="mx-3 my-1 border-t border-(--border)" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 cursor-pointer"
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
