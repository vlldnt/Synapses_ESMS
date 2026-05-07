import DirectionPage from '../../components/DirectionPage';
import { generateReportingMensuel } from '../../services/aiService';

const LOADING_MESSAGES = [
  'Analyse des données du mois…',
  "Calcul des indicateurs d'activité…",
  'Identification des faits marquants…',
  'Rédaction des points de vigilance…',
  'Finalisation du reporting…',
];

const config = {
  agentId: 'reporting-mensuel',
  badge: 'REPORT',
  storageKey: 'synapses_report_draft',
  pageId: 'report-page',
  formId: 'report-form',
  resultId: 'report-result',
  step1Subtitle: 'Reporting Mensuel',
  step2Title: 'Données du mois',
  step2Subtitle: "Renseignez les indicateurs, faits marquants, difficultés et perspectives du mois — l'IA structure le reporting",
  placeholder: "Nombre d'usagers suivis, actes réalisés, faits marquants, incidents, absences, partenariats, points de vigilance, perspectives du mois suivant…",
  buttonLabel: 'Générer le reporting',
  resetLabel: '+ Nouveau reporting',
  resultTitle: 'Reporting Mensuel généré',
  validationText: "Je confirme avoir relu, vérifié et, si besoin, corrigé ce reporting mensuel. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel.",
  generateFn: generateReportingMensuel,
  loadingMessages: LOADING_MESSAGES,
  interventionType: 'Reporting Mensuel',
};

export default function REPORTPage() {
  return <DirectionPage config={config} />;
}
