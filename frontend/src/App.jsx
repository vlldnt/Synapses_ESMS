import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { setTheme } from './store/themeSlice';
import { Sun, Moon } from 'lucide-react';
import './App.css';
import Sidebar from './components/MenuSidebar/Sidebar';
import MobileMenu from './components/MenuSidebar/MobileMenu';
import TopBar from './components/MenuSidebar/TopBar';
import Login from './features/Login';
import Dashboard from './features/Dashboard';
import CompteRendu from './features/CompteRendu';
import ProjetPersonnalise from './features/ProjetPersonnalise';
import Historique from './features/Historique';

function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle"
      onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
      className="hidden md:flex fixed top-2 right-4 z-100 p-2.5 rounded-full bg-(--bg-primary)/80 backdrop-blur-sm shadow-lg border border-(--border) text-(--text-secondary) hover:bg-(--bg-tertiary) transition-colors duration-200 cursor-pointer"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

function App() {
  const isLogged = useSelector((state) => state.auth.isLogged);
  const theme = useSelector((state) => state.theme.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!isLogged)
    return (
      <>
        <ThemeToggle />
        <Login />
      </>
    );

  return (
    <>
      <ThemeToggle />
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:hidden">
        <MobileMenu />
      </div>
      <main id="main-content" className="md:ml-64 min-h-dvh pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0 bg-(--bg-secondary) text-(--text-primary)">
        <TopBar />
        <div className="h-[calc(100dvh-3.5rem-3.75rem-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compte-rendu" element={<CompteRendu />} />
            <Route
              path="/projet-personnalise"
              element={<ProjetPersonnalise />}
            />
            <Route path="/historique" element={<Historique />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </>
  );
}

export default App;
