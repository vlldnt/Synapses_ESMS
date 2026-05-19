import DirectionPage from '../../components/DirectionPage';
import { generateEvaluationHas } from '../../services/aiService';

const LOADING_MESSAGES = [
  'Analyse des éléments de démarche qualité…',
  'Référencement HAS en cours…',
  'Identification des points forts…',
  'Formulation des axes d\'amélioration…',
  'Structuration du plan d\'action…',
];

const config = {
  agentId: 'evaluation-interne-externe',
  badge: 'HAS',
  storageKey: 'synapses_has_draft',
  pageId: 'has-page',
  formId: 'has-form',
  resultId: 'has-result',
  step1Subtitle: 'Préparation Évaluation HAS',
  step2Title: 'Éléments de la démarche',
  step2Subtitle: "Décrivez votre contexte, vos pratiques actuelles, les thématiques HAS concernées - l'IA structure votre préparation",
  placeholder: 'Thématique HAS ciblée, pratiques actuelles, points forts identifiés, axes d\'amélioration pressentis, actions déjà engagées, observations de l\'équipe…',
  buttonLabel: 'Générer la préparation HAS',
  resetLabel: '+ Nouvelle préparation',
  resultTitle: 'Préparation Évaluation HAS générée',
  validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce document. Je reste l'auteur et le responsable de ce contenu. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
  generateFn: generateEvaluationHas,
  loadingMessages: LOADING_MESSAGES,
  interventionType: 'Évaluation HAS',
};

export default function HASPage() {
  return <DirectionPage config={config} />;
}
