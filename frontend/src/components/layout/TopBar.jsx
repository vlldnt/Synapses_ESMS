import { useLocation } from 'react-router-dom';
import faviconUrl from '/favicon.png';
import ProfileDropdown from './ProfileDropdown';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const routeTitles = {
  '/': {
    title: 'Tableau de bord',
    subtitle: null,
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
    title: 'Documents archivés',
    subtitle: null,
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
    subtitle: 'Accès restreint - Éditeur de prompts et configuration',
  },
  '/gestion': {
    title: 'Gestion',
    subtitle: null,
  },
};

function buildDateStr() {
  const now = new Date();
  const [weekday, date] = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).split(' ');
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${date}`;
}

function PageSubtitle({ firstName, job, organization }) {
  const dateStr = buildDateStr();
  const structureType = organization?.structure_type;
  const orgName = organization?.name ?? 'Synapses';
  return (
    <>
      <strong className="font-semibold">{firstName}</strong>
      {/* job visible uniquement desktop */}
      {job && (
        <span className="hidden md:contents">
          <span className="mx-1">·</span>
          <em className="not-italic opacity-80">{job}</em>
        </span>
      )}
      <span className="mx-1">-</span>{dateStr}
      {structureType && <><span className="mx-1">-</span><em className="not-italic opacity-80">{structureType}</em></>}
      {orgName && <><span className="mx-1">-</span>{orgName}</>}
    </>
  );
}

function TopBar() {
  const location = useLocation();
  const { firstName, job, organization } = useCurrentUser();

  const routeEntry = routeTitles[location.pathname] || routeTitles['/'];
  const title = routeEntry.title;

  const isDynamic = ['/', '/archives', '/gestion'].includes(location.pathname);
  let subtitleNode = null;
  if (location.pathname === '/gestion') {
    subtitleNode = <PageSubtitle firstName={firstName} job={job} organization={organization} />;
  } else if (isDynamic) {
    subtitleNode = <PageSubtitle firstName={firstName} job={job} organization={organization} />;
  } else if (routeEntry.subtitle) {
    subtitleNode = routeEntry.subtitle;
  }

  return (
    <header
      id="topBar"
      className="sticky top-0 z-40 w-full bg-(--bg-primary) border-b border-(--border)"
    >
      <div className="min-h-14 md:min-h-16 px-4 md:px-5 py-2 flex items-center gap-2 md:gap-3">
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
          {subtitleNode && (
            <p className="flex items-center flex-wrap gap-x-0.5 text-xs text-(--text-muted)">
              {subtitleNode}
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
