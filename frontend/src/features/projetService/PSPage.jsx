import DirectionPage from '../../components/DirectionPage';
import { generateProjetService } from '../../services/aiService';

const LOADING_MESSAGES = [
  'Analyse des éléments du service…',
  'Structuration des missions…',
  'Formalisation des objectifs opérationnels…',
  "Rédaction des modalités d'organisation…",
  'Finalisation du projet de service…',
];

const config = {
  agentId: 'projet-service',
  badge: 'PS',
  storageKey: 'synapses_ps_draft',
  pageId: 'ps-page',
  formId: 'ps-form',
  resultId: 'ps-result',
  step1Subtitle: 'Projet de Service',
  step2Title: 'Éléments et orientations du service',
  step2Subtitle: "Décrivez les missions, l'organisation, les objectifs et les modalités d'intervention du service — l'IA structure le projet",
  placeholder: "Missions du service, public visé, organisation interne, ressources humaines, objectifs opérationnels, modalités d'intervention, partenariats, indicateurs de suivi…",
  buttonLabel: 'Générer le projet de service',
  resetLabel: '+ Nouveau projet',
  resultTitle: 'Projet de Service généré',
  validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce projet de service. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
  generateFn: generateProjetService,
  loadingMessages: LOADING_MESSAGES,
  interventionType: 'Projet de Service',
};

export default function PSPage() {
  return <DirectionPage config={config} />;
}
