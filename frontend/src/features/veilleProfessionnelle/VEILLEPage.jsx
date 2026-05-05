import DirectionPage from '../../components/DirectionPage';
import { generateVeilleProfessionnelle } from '../../services/aiService';

const LOADING_MESSAGES = [
  "Analyse des éléments de veille…",
  'Contextualisation réglementaire…',
  "Synthèse des évolutions…",
  "Identification des impacts…",
  'Formulation des recommandations…',
];

const config = {
  agentId: 'veille-professionnelle',
  badge: 'VEILLE',
  storageKey: 'synapses_veille_draft',
  pageId: 'veille-page',
  formId: 'veille-form',
  resultId: 'veille-result',
  step1Subtitle: 'Veille Professionnelle',
  step2Title: 'Éléments de veille',
  step2Subtitle: "Décrivez le sujet, les sources consultées, les évolutions réglementaires ou thématiques — l'IA structure la note de veille",
  placeholder: 'Sujet de veille, textes réglementaires, articles, rapports, évolutions observées, impacts pour la structure, points de vigilance…',
  buttonLabel: 'Générer la note de veille',
  resetLabel: '+ Nouvelle veille',
  resultTitle: 'Note de Veille Professionnelle générée',
  validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé cette note de veille. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
  generateFn: generateVeilleProfessionnelle,
  loadingMessages: LOADING_MESSAGES,
  interventionType: 'Veille Professionnelle',
};

export default function VEILLEPage() {
  return <DirectionPage config={config} />;
}
