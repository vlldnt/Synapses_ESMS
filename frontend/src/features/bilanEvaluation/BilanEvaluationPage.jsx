import AgentPage from '../../components/AgentPage';
import { generateBilanEvaluation } from '../../services/aiService';

const LOADING_MESSAGES = [
  "L'IA structure votre bilan d'évaluation à partir des éléments fournis…",
  "Analyse et synthèse des observations d'évaluation…",
  "Formalisation des axes d'évolution et des recommandations…",
  "Organisation du bilan selon la trame d'évaluation professionnelle…",
  'Vérification de la cohérence du bilan généré…',
  'Finalisation du document avant affichage…',
];

export default function BilanEvaluationPage() {
  return (
    <AgentPage config={{
      agentId: 'bilan-evaluation',
      badge: 'BILAN',
      storageKey: 'bilan_draft',
      pageId: 'bilan-page',
      formId: 'bilan-form',
      resultId: 'bilan-result',
      step1Subtitle: "Bilan d'évaluation",
      step2Title: "Éléments d'évaluation",
      step2Subtitle: "Décrivez les observations, les évolutions et les axes à évaluer - l'IA structure le bilan",
      placeholder: "Décrivez les acquis, les progrès observés, les difficultés persistantes, les évolutions depuis le dernier bilan, les objectifs atteints ou non, les nouvelles orientations envisagées… L'IA se charge du reste.",
      buttonLabel: 'Générer le bilan',
      resetLabel: '+ Nouveau bilan',
      resetConfirm: 'Commencer un nouveau bilan ? Le brouillon sera effacé.',
      resultTitle: "Bilan d'évaluation généré",
      validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce bilan d'évaluation. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
      generateFn: generateBilanEvaluation,
      loadingMessages: LOADING_MESSAGES,
      interventionType: "Bilan d'évaluation",
      type: 'BILAN',
    }} />
  );
}
