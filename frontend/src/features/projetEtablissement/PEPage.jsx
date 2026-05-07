import DirectionPage from '../../components/DirectionPage';
import { generateProjetEtablissement } from '../../services/aiService';

const LOADING_MESSAGES = [
  'Analyse des orientations stratégiques…',
  'Structuration du diagnostic…',
  'Formalisation des axes prioritaires…',
  "Rédaction du plan d'action…",
  "Finalisation du projet d'établissement…",
];

const config = {
  agentId: 'projet-etablissement',
  badge: 'PE',
  storageKey: 'synapses_pe_draft',
  pageId: 'pe-page',
  formId: 'pe-form',
  resultId: 'pe-result',
  step1Subtitle: "Projet d'Établissement",
  step2Title: 'Orientations et éléments de contexte',
  step2Subtitle: "Décrivez les valeurs, le diagnostic, les orientations stratégiques et les objectifs à 5 ans — l'IA structure le projet d'établissement",
  placeholder: "Valeurs de la structure, public accueilli, diagnostic de situation, forces et faiblesses, orientations stratégiques, objectifs à 5 ans, moyens humains et matériels, partenariats…",
  buttonLabel: "Générer le projet d'établissement",
  resetLabel: '+ Nouveau projet',
  resultTitle: "Projet d'Établissement généré",
  validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce projet d'établissement. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
  generateFn: generateProjetEtablissement,
  loadingMessages: LOADING_MESSAGES,
  interventionType: "Projet d'Établissement",
};

export default function PEPage() {
  return <DirectionPage config={config} />;
}
