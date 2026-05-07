import DirectionPage from '../../components/DirectionPage';
import { generateRapportActivite } from '../../services/aiService';

const LOADING_MESSAGES = [
  "Analyse des éléments d'activité…",
  'Structuration du bilan quantitatif…',
  "Rédaction de l'analyse qualitative…",
  "Identification des axes d'amélioration…",
  'Finalisation du rapport…',
];

const config = {
  agentId: 'rapport-activite',
  badge: 'RA',
  storageKey: 'synapses_ra_draft',
  pageId: 'ra-page',
  formId: 'ra-form',
  resultId: 'ra-result',
  step1Subtitle: "Rapport d'Activité",
  step2Title: "Éléments d'activité",
  step2Subtitle: "Décrivez les actions menées, les chiffres clés, les points forts et les axes d'amélioration — l'IA structure le rapport",
  placeholder: "Période couverte, nombre d'usagers, actions réalisées, partenariats, événements marquants, difficultés rencontrées, points forts, perspectives…",
  buttonLabel: "Générer le rapport d'activité",
  resetLabel: '+ Nouveau rapport',
  resultTitle: "Rapport d'Activité généré",
  validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce rapport d'activité. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
  generateFn: generateRapportActivite,
  loadingMessages: LOADING_MESSAGES,
  interventionType: "Rapport d'Activité",
};

export default function RAPage() {
  return <DirectionPage config={config} />;
}
