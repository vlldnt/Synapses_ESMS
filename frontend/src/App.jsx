import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { setTheme } from './store/themeSlice';
import { setOrganization } from './store/authSlice';
import { setRole } from './store/roleSlice';
import { getOrganizationById } from './services/organizationService';
import { Sun, Moon } from 'lucide-react';
import './App.css';
import Sidebar from './components/layout/Sidebar';
import MobileMenu from './components/layout/MobileMenu';
import TopBar from './components/layout/TopBar';
import AgentTabs from './components/layout/AgentTabs';
import LoginPage from './features/auth/LoginPage';
import JoinRequestPage from './features/auth/JoinRequestPage';
import SetPasswordPage from './features/auth/SetPasswordPage';
import SetAccountPage from './features/auth/SetAccountPage';
import DashboardPage from './features/dashboard/DashboardPage';
import InterventionReportPage from './features/interventionReport/InterventionReportPage';
import PersonalizedProjectPage from './features/personalizedProject/PersonalizedProjectPage';
import PpasSocialPage from './features/ppasSocial/PpasSocialPage';
import EcritEducatifPage from './features/ecritEducatif/EcritEducatifPage';
import BilanEvaluationPage from './features/bilanEvaluation/BilanEvaluationPage';
import ArchivesPage from './features/archives/ArchivesPage';
import AdminPage from './features/admin/AdminPage';
import AgentGestionPage from './features/agentGestion/AgentGestionPage';
import DevPage from './features/dev/DevPage';
import CRRPage from './features/compteRenduReunion/CRRPage';
import VEILLEPage from './features/veilleProfessionnelle/VEILLEPage';
import REPORTPage from './features/reportingMensuel/REPORTPage';
import RAPage from './features/rapportActivite/RAPage';
import BAPage from './features/bilanActivite/BAPage';
import PEPage from './features/projetEtablissement/PEPage';
import PSPage from './features/projetService/PSPage';
import HASPage from './features/evaluationHas/HASPage';
import AAPPage from './features/appelProjet/AAPPage';

function TopControls() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const isDark = theme === 'dark';

  return (
    <div className="hidden md:flex fixed top-2 right-4 z-100 items-center gap-2">
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

  const user = useSelector((state) => state.auth.user);
  const organization = useSelector((state) => state.auth.organization);

  // dérive le rôle depuis le JWT au refresh
  useEffect(() => {
    if (isLogged) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          dispatch(setRole(payload.role || 'agent'));
        } catch { /* ignore */ }
      }
    }
  }, [isLogged, dispatch]);

  // recharge l'org au refresh si le token est encore valide
  useEffect(() => {
    if (isLogged && user?.organization_id && !organization) {
      getOrganizationById(user.organization_id).then((org) => dispatch(setOrganization(org)));
    }
  }, [isLogged, user, organization, dispatch]);

  return (
    <>
      <TopControls />
      {!isLogged ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/rejoindre" element={<JoinRequestPage />} />
          <Route path="/set-password/:token" element={<SetPasswordPage />} />
          <Route path="/set-account/:token" element={<SetAccountPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <>
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <div className="md:hidden">
            <MobileMenu />
          </div>
          <main id="main-content" className="md:ml-64 min-h-dvh pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0 bg-(--bg-secondary) text-(--text-primary)">
            <TopBar />
            <AgentTabs />
            <div className="min-h-[calc(100dvh-3.5rem-3.75rem-env(safe-area-inset-bottom))] md:h-[calc(100dvh-4rem)]">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/rejoindre" element={<Navigate to="/" replace />} />
                <Route path="/compte_rendu_intervention" element={<InterventionReportPage />} />
                <Route path="/projet_personnalise_medico_social" element={<PersonalizedProjectPage />} />
                <Route path="/projet_personnalise_social" element={<PpasSocialPage />} />
                <Route path="/ecrit_educatif" element={<EcritEducatifPage />} />
                <Route path="/bilan_evaluation" element={<BilanEvaluationPage />} />
                <Route path="/cri" element={<Navigate to="/compte_rendu_intervention" replace />} />
                <Route path="/ppa" element={<Navigate to="/projet_personnalise_medico_social" replace />} />
                <Route path="/ppas" element={<Navigate to="/projet_personnalise_social" replace />} />
                <Route path="/ecrit" element={<Navigate to="/ecrit_educatif" replace />} />
                <Route path="/bilan" element={<Navigate to="/bilan_evaluation" replace />} />
                <Route path="/compte_rendu_reunion" element={<CRRPage />} />
                <Route path="/veille_professionnelle" element={<VEILLEPage />} />
                <Route path="/reporting_mensuel" element={<REPORTPage />} />
                <Route path="/rapport_activite" element={<RAPage />} />
                <Route path="/bilan_activite" element={<BAPage />} />
                <Route path="/projet_etablissement" element={<PEPage />} />
                <Route path="/projet_service" element={<PSPage />} />
                <Route path="/evaluation_has" element={<HASPage />} />
                <Route path="/appel_projet" element={<AAPPage />} />
                <Route path="/archives" element={<ArchivesPage />} />
                <Route path="/gestion" element={<AgentGestionPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/dev" element={<DevPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </>
      )}
    </>
  );
}

export default App;
