import AgentPage from '../../components/AgentPage';
import { generateEcritEducatif } from '../../services/aiService';

const LOADING_MESSAGES = [
  "L'IA rédige votre écrit éducatif à partir de vos observations…",
  "Structuration du contenu selon la trame de l'écrit éducatif…",
  'Mise en forme professionnelle du document…',
  'Organisation des faits, analyses et préconisations…',
  "Vérification de la cohérence de l'écrit généré…",
  'Finalisation du document avant affichage…',
];

export default function EcritEducatifPage() {
  return (
    <AgentPage config={{
      agentId: 'ecrit-educatif',
      badge: 'ECRIT',
      storageKey: 'ecrit_draft',
      pageId: 'ecrit-page',
      formId: 'ecrit-form',
      resultId: 'ecrit-result',
      step1Subtitle: 'Écrit éducatif',
      step2Title: 'Notes terrain',
      step2Subtitle: "Décrivez la situation, les observations et les éléments d'analyse - l'IA rédige l'écrit éducatif",
      placeholder: "Décrivez la situation de la personne, vos observations terrain, les éléments d'analyse, les ressources identifiées, les préconisations envisagées… L'IA se charge du reste.",
      buttonLabel: "Générer l'écrit éducatif",
      resetLabel: '+ Nouvel écrit',
      resetConfirm: 'Commencer un nouvel écrit ? Le brouillon sera effacé.',
      resultTitle: 'Écrit éducatif généré',
      validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé cet écrit éducatif. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
      generateFn: generateEcritEducatif,
      loadingMessages: LOADING_MESSAGES,
      interventionType: 'Écrit éducatif',
      type: 'ECRIT',
    }} />
  );
}
