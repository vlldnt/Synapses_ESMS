export const STORAGE_KEY = 'cr_intervention_draft';

export const INTERVENTION_TYPES = [
  'Visite à domicile',
  'Entretien individuel',
  'Entretien famille',
  'Accompagnement extérieur',
  'Autre',
];

export const LOADING_MESSAGES = [
  "L'IA analyse votre transcription et structure le compte rendu…",
  'Analyse en cours : extraction des informations essentielles…',
  'Mise en forme du compte rendu selon la trame professionnelle…',
  'Organisation des faits, observations et actions de suivi…',
  'Verification de la coherence du contenu genere…',
  'Finalisation du document avant affichage…',
];

export const REPORT_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  ARCHIVED: 'archived',
};

export const STATUS_META = {
  [REPORT_STATUS.DRAFT]: {
    label: 'Brouillon',
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  [REPORT_STATUS.IN_PROGRESS]: {
    label: 'En cours',
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  [REPORT_STATUS.ARCHIVED]: {
    label: 'Archive',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
};
