import AgentPage from '../../components/AgentPage';
import { generateInterventionReport } from '../../services/aiService';

const LOADING_MESSAGES = [
  "L'IA analyse votre transcription et structure le compte rendu…",
  'Analyse en cours : extraction des informations essentielles…',
  'Mise en forme du compte rendu selon la trame professionnelle…',
  'Organisation des faits, observations et actions de suivi…',
  'Verification de la coherence du contenu genere…',
  'Finalisation du document avant affichage…',
];

export default function InterventionReportPage() {
  return (
    <AgentPage config={{
      agentId: 'compte-rendu-intervention',
      badge: 'CRI',
      storageKey: 'cr_intervention_draft',
      pageId: 'cr-page',
      formId: 'cr-form',
      resultId: 'cr-result',
      step1Subtitle: "Compte rendu d'intervention",
      step2Title: 'Transcription',
      step2Subtitle: "Dictez ou saisissez vos observations — l'IA détermine le type et structure le compte rendu",
      placeholder: "Dictez ou saisissez vos observations, le déroulement, les éléments d'analyse, les suites prévues… L'IA se charge du reste.",
      buttonLabel: 'Générer le compte rendu',
      resetLabel: '+ Nouveau rapport',
      resetConfirm: 'Commencer un nouveau rapport ? Le brouillon sera effacé.',
      resultTitle: 'Compte rendu généré',
      validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce compte rendu. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
      generateFn: generateInterventionReport,
      loadingMessages: LOADING_MESSAGES,
      interventionType: '',
      type: 'CRI',
      showAdminEducatorSelect: true,
    }} />
  );
}
