import AgentPage from '../../components/AgentPage';
import { generatePpasSocial } from '../../services/aiService';

const LOADING_MESSAGES = [
  "L'IA structure votre PPA social selon les besoins identifiés…",
  "Analyse des éléments sociaux et identification des axes d'accompagnement…",
  'Formalisation des objectifs et des actions sociales prioritaires…',
  'Organisation du projet selon la trame PPAS professionnelle…',
  'Vérification de la cohérence du projet social généré…',
  'Finalisation du document avant affichage…',
];

export default function PpasSocialPage() {
  return (
    <AgentPage config={{
      agentId: 'ppa-social',
      badge: 'PPAS',
      storageKey: 'ppas_draft',
      pageId: 'ppas-page',
      formId: 'ppas-form',
      resultId: 'ppas-result',
      step1Subtitle: "Projet personnalisé d'accompagnement social",
      step2Title: 'Observations sociales',
      step2Subtitle: "Décrivez la situation sociale, les besoins identifiés, les ressources et les objectifs - l'IA structure le PPAS",
      placeholder: "Décrivez la situation sociale de la personne, ses conditions de vie, ses besoins d'accompagnement, les démarches engagées, les ressources mobilisables, les objectifs visés… L'IA se charge du reste.",
      buttonLabel: 'Générer le PPAS',
      resetLabel: '+ Nouveau PPAS',
      resetConfirm: 'Commencer un nouveau PPAS ? Le brouillon sera effacé.',
      resultTitle: 'PPAS généré',
      validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce projet personnalisé d'accompagnement social. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
      generateFn: generatePpasSocial,
      loadingMessages: LOADING_MESSAGES,
      interventionType: "Projet Personnalisé d'Accompagnement Social",
      type: 'PPAS',
    }} />
  );
}
