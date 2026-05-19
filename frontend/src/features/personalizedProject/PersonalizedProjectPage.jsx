import AgentPage from '../../components/AgentPage';
import { generatePersonalizedProject } from '../../services/aiService';

const LOADING_MESSAGES = [
  "L'IA structure votre projet personnalisé selon le référentiel SERAFIN-PH…",
  'Analyse des observations et identification des axes prioritaires…',
  "Formalisation des objectifs et modalités d'accompagnement…",
  'Organisation des données selon la trame PPA professionnelle…',
  'Vérification de la cohérence du projet personnalisé généré…',
  'Finalisation du document avant affichage…',
];

export default function PersonalizedProjectPage() {
  return (
    <AgentPage config={{
      agentId: 'ppa-medico-social',
      badge: 'PPAMS',
      storageKey: 'ppa_draft',
      pageId: 'ppa-page',
      formId: 'ppa-form',
      resultId: 'ppa-result',
      step1Subtitle: "Projet personnalisé d'accompagnement",
      step2Title: 'Observations',
      step2Subtitle: "Décrivez librement la situation, les besoins, les objectifs et les modalités d'accompagnement — l'IA structure le PPA",
      placeholder: "Décrivez la situation de la personne, ses besoins, ses capacités, les objectifs prioritaires, les modalités d'accompagnement prévues… L'IA se charge du reste.",
      buttonLabel: 'Générer le PPA',
      resetLabel: '+ Nouveau PPA',
      resetConfirm: 'Commencer un nouveau PPA ? Le brouillon sera effacé.',
      resultTitle: 'Projet personnalisé généré',
      validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce projet personnalisé d'accompagnement. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
      generateFn: generatePersonalizedProject,
      loadingMessages: LOADING_MESSAGES,
      interventionType: "Projet Personnalisé d'Accompagnement",
      type: 'PPAMS',
    }} />
  );
}
