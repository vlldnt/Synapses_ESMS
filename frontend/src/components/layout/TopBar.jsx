import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import faviconUrl from '/favicon.png';
import ProfileDropdown from './ProfileDropdown';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const routeTitles = {
  '/': {
    title: 'Tableau de bord',
    subtitle: "Vue d'ensemble de votre activité et accès rapide aux fonctionnalités",
  },
  '/compte_rendu_intervention': {
    title: "Compte Rendu d'Intervention",
    subtitle: "Générez un compte rendu d'intervention",
  },
  '/projet_personnalise_medico_social': {
    title: 'PPA Médico-Social',
    subtitle: 'Générez un projet personnalisé d\'accompagnement médico-social',
  },
  '/projet_personnalise_social': {
    title: 'PPA Social',
    subtitle: 'Générez un projet personnalisé d\'accompagnement social',
  },
  '/ecrit_educatif': {
    title: 'Écrit Éducatif',
    subtitle: 'Rédigez un écrit éducatif structuré à partir de vos observations',
  },
  '/bilan_evaluation': {
    title: "Bilan d'Évaluation",
    subtitle: "Générez un bilan d'évaluation à partir de vos éléments d'analyse",
  },
  '/archives': {
    title: 'Archives',
    subtitle: "Consultez, gérez et retrouvez l'ensemble de vos documents générés",
  },
  '/evaluation_has': {
    title: 'Préparation Évaluation HAS',
    subtitle: "Préparez votre démarche d'évaluation interne et externe",
  },
  '/appel_projet': {
    title: 'Appel à Projet',
    subtitle: "Structurez votre réponse à un appel à projet ou à manifestation d'intérêt",
  },
  '/dev': {
    title: 'Développeur',
    subtitle: 'Accès restreint — Éditeur de prompts et configuration',
  },
};

function TopBar() {
  const location = useLocation();
  const { title, subtitle } = routeTitles[location.pathname] || routeTitles['/'];
  const { fullName, organization } = useCurrentUser();
  const role = useSelector((state) => state.role.role);

  return (
    <header
      id="topBar"
      className="sticky top-0 z-40 w-full h-14 md:h-16 bg-(--bg-primary) border-b border-(--border)"
    >
      <div className="h-full px-4 md:px-5 flex items-center gap-2 md:gap-3">
        <div className="md:hidden flex flex-col items-center leading-none">
          <img className="h-6 w-6" src={faviconUrl} alt="Logo Synapses" />
          <span
            className="text-[9px] text-(--text-muted)"
            style={{ fontFamily: 'Ailerons' }}
          >
            Synapses
          </span>
        </div>
        <div id="page-title" className="flex flex-col leading-tight">
          <h1 className="text-lg md:text-2xl font-bold text-(--text-primary)">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden md:block text-xs text-(--text-muted)">
              {subtitle}
            </p>
          )}
        </div>
        <div className="ml-auto md:hidden">
          <ProfileDropdown mobile />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
