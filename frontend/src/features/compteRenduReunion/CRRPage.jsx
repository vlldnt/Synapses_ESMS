import DirectionPage from '../../components/DirectionPage';
import { generateCompteRenduReunion } from '../../services/aiService';

const LOADING_MESSAGES = [
  'Structuration du compte rendu…',
  "Organisation des points abordés…",
  'Formalisation des décisions…',
  "Rédaction des actions à engager…",
  'Finalisation du document…',
];

const config = {
  agentId: 'compte-rendu-reunion',
  badge: 'CRR',
  storageKey: 'synapses_crr_draft',
  pageId: 'crr-page',
  formId: 'crr-form',
  resultId: 'crr-result',
  step1Subtitle: 'Compte Rendu de Réunion',
  step2Title: 'Notes de réunion',
  step2Subtitle: "Décrivez les participants, l'ordre du jour, les échanges, les décisions prises et les actions à engager - l'IA structure le compte rendu",
  placeholder: "Participants présents, points abordés, échanges importants, décisions prises, actions à mettre en place, prochaine réunion prévue…",
  buttonLabel: 'Générer le compte rendu',
  resetLabel: '+ Nouveau compte rendu',
  resultTitle: 'Compte Rendu de Réunion généré',
  validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce compte rendu de réunion. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
  generateFn: generateCompteRenduReunion,
  loadingMessages: LOADING_MESSAGES,
  interventionType: 'Compte Rendu de Réunion',
};

export default function CRRPage() {
  return <DirectionPage config={config} />;
}
