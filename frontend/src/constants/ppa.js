export const STORAGE_KEY = 'ppa_draft';

export const LOADING_MESSAGES = [
  "L'IA structure votre projet personnalisé selon le référentiel SERAFIN-PH…",
  "Analyse des observations et identification des axes prioritaires…",
  "Formalisation des objectifs et modalités d'accompagnement…",
  "Organisation des données selon la trame PPA professionnelle…",
  "Vérification de la cohérence du projet personnalisé généré…",
  "Finalisation du document avant affichage…",
];

export const REPORT_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  ARCHIVED: 'archived',
};

export const AGE_GROUPS = [
  'Enfant (0-12 ans)',
  'Adolescent (12-18 ans)',
  'Jeune adulte (18-25 ans)',
  'Adulte (25+ ans)',
];

export const PERIODS = ['6 mois', '1 an', '2 ans'];

export const AXES = [
  { key: 'communication', label: 'Communication' },
  { key: 'mobilite', label: 'Mobilité & déplacements' },
  { key: 'autonomie', label: 'Autonomie quotidienne' },
  { key: 'socialisation', label: 'Socialisation' },
  { key: 'scolarite', label: 'Scolarité / Formation' },
  { key: 'emploi', label: 'Emploi & activité' },
  { key: 'sante', label: 'Santé & soins' },
  { key: 'logement', label: 'Logement & cadre de vie' },
];

export const PPA_FIELDS = [
  {
    key: 'situation',
    label: 'Présentation de la situation',
    placeholder: "Ex : Enfant 8 ans, TSA léger, SESSAD depuis 2 ans, ULIS",
  },
  {
    key: 'besoins_sante',
    label: 'Besoins – Santé somatique & psychique',
    placeholder:
      "Ex : Anxiété lors des transitions, sensibilité sensorielle, besoin de cadre",
  },
  {
    key: 'besoins_autonomie',
    label: 'Besoins – Autonomie',
    placeholder:
      "Ex : Aide séquence habillage, motricité fine, communication orale limitée",
  },
  {
    key: 'besoins_participation',
    label: 'Besoins – Participation sociale',
    placeholder:
      "Ex : Jeu solitaire, peu d'interactions en groupe, intérêts spécifiques lego",
  },
  {
    key: 'objectifs',
    label: 'Objectifs prioritaires',
    placeholder:
      "Ex : Améliorer communication, réduire anxiété aux transitions, autonomie hygiène",
  },
  {
    key: 'modalites',
    label: "Modalités d'accompagnement",
    placeholder:
      "Ex : Éducateur + psychologue, 2 séances/semaine domicile, supports visuels",
  },
  {
    key: 'participation_personne',
    label: 'Participation & choix de la personne',
    placeholder:
      "Ex : Préférences par pointage, apprécie lego et animaux, parents impliqués",
  },
  {
    key: 'suivi',
    label: 'Suivi et réévaluation',
    placeholder: "Ex : Bilan à 3 mois, révision complète à 6 mois, famille",
  },
];

export const EMPTY_NOTES = {
  situation: '',
  besoins_sante: '',
  besoins_autonomie: '',
  besoins_participation: '',
  objectifs: '',
  modalites: '',
  participation_personne: '',
  suivi: '',
};
