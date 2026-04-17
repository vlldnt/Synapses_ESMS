import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { setTheme } from './store/themeSlice';
import { setRole } from './store/roleSlice';
import { fetchCurrentUser } from './store/authSlice';
import { Sun, Moon } from 'lucide-react';
import './App.css';
import Sidebar from './components/MenuSidebar/Sidebar';
import MobileMenu from './components/MenuSidebar/MobileMenu';
import TopBar from './components/MenuSidebar/TopBar';
import Login from './features/Login';
import Dashboard from './features/Dashboard';
import DashboardAgents from './features/DashboardAgents';
import InterventionReport from './features/InterventionReport';
import PersonalizedProject from './features/PersonalizedProject';
import History from './features/History';

const ROLES = ['agent', 'direction', 'admin'];
const ROLE_LABELS = { agent: 'Agent', direction: 'Direction', admin: 'Admin' };

function TopControls() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const role = useSelector((state) => state.role.role);
  const isDark = theme === 'dark';

  return (
    <div className="hidden md:flex fixed top-2 right-4 z-100 items-center gap-2">
      {/* Role switcher */}
      <div className="flex rounded-full bg-(--bg-primary)/80 backdrop-blur-sm shadow-lg border border-(--border) overflow-hidden text-xs font-medium">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => dispatch(setRole(r))}
            className={`px-3 py-1.5 transition-colors duration-150 cursor-pointer ${
              role === r
                ? 'bg-(--bleu-fonce) text-white'
                : 'text-(--text-secondary) hover:bg-(--bg-tertiary)'
            }`}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Theme toggle */}
      <button
        id="theme-toggle"
        onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
        className="p-2.5 rounded-full bg-(--bg-primary)/80 backdrop-blur-sm shadow-lg border border-(--border) text-(--text-secondary) hover:bg-(--bg-tertiary) transition-colors duration-200 cursor-pointer"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const isLogged = useSelector((state) => state.auth.isLogged);
  const theme = useSelector((state) => state.theme.theme);
  const role = useSelector((state) => state.role.role);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Au chargement de la page ou changement de rôle, si la session cookie existe déjà,
  // on récupère les données user/organization selon le rôle sélectionné.
  useEffect(() => {
    if (isLogged) dispatch(fetchCurrentUser(role));
  }, [isLogged, role, dispatch]);

  if (!isLogged)
    return (
      <>
        <TopControls />
        <Login />
      </>
    );

  return (
    <>
      <TopControls />
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:hidden">
        <MobileMenu />
      </div>
      <main id="main-content" className="md:ml-64 min-h-dvh pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0 bg-(--bg-secondary) text-(--text-primary)">
        <TopBar />
        <div className="min-h-[calc(100dvh-3.5rem-3.75rem-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<DashboardAgents />}>
              <Route index element={<Navigate to="/agents/compte-rendu" replace />} />
              <Route path="compte-rendu" element={<InterventionReport />} />
              <Route path="projet-personnalise" element={<PersonalizedProject />} />
            </Route>
            <Route path="/historique" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </>
  );
}

export default App;
