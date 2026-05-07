import DirectionPage from '../../components/DirectionPage';
import { generateAppelProjet } from '../../services/aiService';

const LOADING_MESSAGES = [
  'Analyse du contexte territorial…',
  'Structuration du projet…',
  'Formulation des objectifs…',
  'Élaboration des moyens et du calendrier…',
  'Finalisation de la réponse…',
];

const config = {
  agentId: 'appel-projet',
  badge: 'AAP',
  storageKey: 'synapses_aap_draft',
  pageId: 'aap-page',
  formId: 'aap-form',
  resultId: 'aap-result',
  step1Subtitle: 'Appel à Projet',
  step2Title: 'Éléments du projet',
  step2Subtitle: "Décrivez le contexte, le public cible, les objectifs et les moyens envisagés — l'IA structure votre réponse à l'appel à projet",
  placeholder: 'Appel à projet ciblé, porteur de projet, diagnostic territorial, public visé, capacité d\'accueil, objectifs, moyens humains et financiers, partenaires, calendrier envisagé…',
  buttonLabel: 'Générer la réponse AAP',
  resetLabel: '+ Nouvel appel à projet',
  resultTitle: 'Réponse à l\'Appel à Projet générée',
  validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce document. Je reste l'auteur et le responsable de ce contenu. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
  generateFn: generateAppelProjet,
  loadingMessages: LOADING_MESSAGES,
  interventionType: 'Appel à Projet',
};

export default function AAPPage() {
  return <DirectionPage config={config} />;
}
