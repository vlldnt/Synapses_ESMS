import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLogged } from '../../store/authSlice';
import { setTheme } from '../../store/themeSlice';
import { setRole } from '../../store/roleSlice';
import { User, LogOut, Sun, Moon, ChevronDown, Download, ShieldCheck } from 'lucide-react';

const ROLES = ['agent', 'direction', 'admin'];
const ROLE_LABELS = { agent: 'Agent', direction: 'Direction', admin: 'Admin' };
import { PWAInstallModal } from '../PWAInstallGuide';

function ProfileDropdown({
  initials = 'AV',
  fullname = 'Adrien Vieilledent',
  jobType = 'Éducateur Spécialisé',
  photo = null,
  mobile = false,
}) {
  const [open, setOpen] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const role = useSelector((state) => state.role.role);
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    dispatch(setTheme(isDark ? 'light' : 'dark'));
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
    };
  }, []);

  const handleLogout = () => {
    dispatch(setLogged(false));
    setOpen(false);
  };

  return (
    <>
    <div id={mobile ? 'profile-dropdown-mobile' : 'profile-dropdown'} className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        id={mobile ? 'profile-trigger-mobile' : 'profile-trigger'}
        onClick={() => setOpen((prev) => !prev)}
        className={
          mobile
            ? 'flex items-center justify-center cursor-pointer rounded-full p-0.75 bg-(--bg-primary)/90 backdrop-blur-sm border border-(--border) shadow-sm transition-all duration-200 hover:bg-(--bg-tertiary)'
            : 'flex items-center justify-start gap-3 w-full cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-(--bg-tertiary)'
        }
      >
        {photo ? (
          <img
            src={photo}
            alt="Photo de profil"
            className={
              mobile
                ? 'w-8 h-8 rounded-full object-cover'
                : 'w-9 h-9 rounded-full object-cover'
            }
          />
        ) : (
          <div
            className={
              mobile
                ? 'w-8 h-8 rounded-full bg-(--bleu-fonce) flex items-center justify-center text-white font-semibold text-xs shrink-0'
                : 'w-9 h-9 rounded-full bg-(--bleu-fonce) flex items-center justify-center text-white font-semibold text-sm shrink-0'
            }
          >
            {initials}
          </div>
        )}
        {!mobile && (
          <>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-medium text-(--text-primary) text-sm">
                {fullname}
              </span>
              <span className="text-(--text-muted) text-xs">{jobType}</span>
            </div>
            <ChevronDown
              size={16}
              className={`flex ml-auto text-(--text-muted) transition-transform duration-200 ${open ? '' : 'rotate-180'}`}
            />
          </>
        )}
      </button>

      {/* Menu (s'ouvre vers le haut) */}
      {open && (
        <div
          id={mobile ? 'profile-menu-mobile' : 'profile-menu'}
          className={
            mobile
              ? 'absolute top-full right-0 mt-2 w-52 bg-(--bg-primary) rounded-xl shadow-lg border border-(--border) py-2 z-70'
              : 'absolute bottom-full left-0 mb-2 w-full bg-(--bg-primary) rounded-xl shadow-lg border border-(--border) py-2 z-70'
          }
        >
          {mobile && (
            <div className="px-4 py-2">
              <p className="font-medium text-(--text-primary) text-sm">
                {fullname}
              </p>
              <p className="text-(--text-muted) text-xs">{jobType}</p>
            </div>
          )}

          {mobile && <div className="mx-3 my-1 border-t border-(--border)" />}

          <a
            id="profile-settings"
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 text-(--text-primary) hover:bg-(--bg-tertiary) transition-colors duration-150"
            onClick={() => setOpen(false)}
          >
            <User size={18} className="text-(--bleu-fonce)" />
            <span className="font-medium text-xs md:text-sm">Paramètres</span>
          </a>

          <button
            id="profile-install-pwa"
            onClick={() => { setOpen(false); setShowInstall(true); }}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-(--text-primary) hover:bg-(--bg-tertiary) transition-colors duration-150 cursor-pointer"
          >
            <Download size={18} className="text-(--vert-fonce)" />
            <span className="font-medium text-xs md:text-sm">Installer l'application</span>
          </button>

          <div className="mx-3 my-1 border-t border-(--border)" />

          <button
            id="profile-theme-toggle"
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-(--text-primary) hover:bg-(--bg-tertiary) transition-colors duration-150 cursor-pointer"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-medium text-xs md:text-sm">
              {isDark ? 'Mode clair' : 'Mode sombre'}
            </span>
          </button>

          <div className="mx-3 my-1 border-t border-(--border)" />

          <div className="px-4 py-2.5 flex items-center gap-3">
            <ShieldCheck size={18} className="text-(--text-muted) shrink-0" />
            <div className="flex gap-1">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => dispatch(setRole(r))}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    role === r
                      ? 'bg-(--bleu-fonce) text-white'
                      : 'bg-(--bg-tertiary) text-(--text-muted) hover:text-(--text-secondary)'
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-3 my-1 border-t border-(--border)" />

          <button
            id="profile-logout"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 cursor-pointer"
          >
            <LogOut size={18} />
            <span className="font-medium text-xs md:text-sm">Déconnexion</span>
          </button>
        </div>
      )}
    </div>
    {showInstall && <PWAInstallModal onClose={() => setShowInstall(false)} />}
    </>
  );
}

export default ProfileDropdown;
