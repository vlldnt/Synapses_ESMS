import DirectionPage from '../../components/DirectionPage';
import { generateBilanActivite } from '../../services/aiService';

const LOADING_MESSAGES = [
  "Analyse des données d'activité…",
  'Évaluation des objectifs fixés…',
  'Synthèse des réalisations…',
  'Identification des enseignements…',
  'Rédaction des orientations…',
];

const config = {
  agentId: 'bilan-activite',
  badge: 'BA',
  storageKey: 'synapses_ba_draft',
  pageId: 'ba-page',
  formId: 'ba-form',
  resultId: 'ba-result',
  step1Subtitle: "Bilan d'Activité",
  step2Title: 'Éléments du bilan',
  step2Subtitle: "Décrivez les objectifs fixés, les réalisations, les indicateurs et les enseignements tirés — l'IA structure le bilan",
  placeholder: "Objectifs de la période, actions réalisées, taux d'atteinte, indicateurs clés, points forts, difficultés, enseignements et orientations pour la prochaine période…",
  buttonLabel: "Générer le bilan d'activité",
  resetLabel: '+ Nouveau bilan',
  resultTitle: "Bilan d'Activité généré",
  validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce bilan d'activité. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
  generateFn: generateBilanActivite,
  loadingMessages: LOADING_MESSAGES,
  interventionType: "Bilan d'Activité",
};

export default function BAPage() {
  return <DirectionPage config={config} />;
}
