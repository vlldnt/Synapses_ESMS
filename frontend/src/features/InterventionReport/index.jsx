import { useState, useEffect } from 'react';
import { FilePlus, Building2, User, CalendarDays } from 'lucide-react';
import Button from '../../components/Button';
import RgpdNotice from '../../components/RgpdNotice';
import GeneratedResult from '../../components/GeneratedResult';
import VoiceTextarea from '../../components/VoiceTextarea';
import StepCard from '../../components/Dashboard/StepCard';
import {
  generateInterventionReport,
  DEFAULT_MODEL,
} from '../../services/aiService';
import { getReferences, formatReferenceName } from '../../services/reference.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useSelector } from 'react-redux';
import { getHistory } from '../../services/historyService';
import ContextBadge from './components/ContextBadge';
import ModelSelector from './components/ModelSelector';

const STORAGE_KEY = 'cr_intervention_draft';

const INTERVENTION_TYPES = [
  'Visite à domicile',
  'Entretien individuel',
  'Entretien famille',
  'Accompagnement extérieur',
  'Autre',
];

const LOADING_MESSAGES = [
  "L'IA analyse votre transcription et structure le compte rendu…",
  'Analyse en cours : extraction des informations essentielles…',
  'Mise en forme du compte rendu selon la trame professionnelle…',
  'Organisation des faits, observations et actions de suivi…',
  'Verification de la coherence du contenu genere…',
  'Finalisation du document avant affichage…',
];

const cardClass =
  'rounded-2xl border border-(--border) bg-(--bg-primary) p-5 md:p-8 shadow-sm';

const ROLE_LABELS = {
  agent: 'Agent éducatif',
  direction: 'Directeur / Directrice',
  admin: 'Administrateur',
};

const REPORT_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  ARCHIVED: 'archived',
};

const STATUS_META = {
  [REPORT_STATUS.DRAFT]: {
    label: 'Brouillon',
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  [REPORT_STATUS.IN_PROGRESS]: {
    label: 'En cours',
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  [REPORT_STATUS.ARCHIVED]: {
    label: 'Archive',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
};

function inferStatus({ interventionType, transcription, result, isArchived }) {
  if (isArchived) return REPORT_STATUS.ARCHIVED;
  if (result?.trim()) return REPORT_STATUS.IN_PROGRESS;
  if (interventionType || transcription?.trim()) return REPORT_STATUS.DRAFT;
  return REPORT_STATUS.DRAFT;
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function InterventionReport() {
  const { fullName, organization } = useCurrentUser();
  const role = useSelector((state) => state.role.role);
  const draft = loadDraft();

  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const [interventionType, setInterventionType] = useState(
    draft.interventionType || '',
  );
  const [selectedReferenceId, setSelectedChildId] = useState(
    draft.selectedReferenceId || '',
  );
  const [references, setReferences] = useState([]);
  const [transcription, setTranscription] = useState(draft.transcription || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(draft.result || '');
  const [validated, setValidated] = useState(Boolean(draft.validated));
  const [elapsed, setElapsed] = useState(draft.elapsed || null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isArchived, setIsArchived] = useState(Boolean(draft.isArchived));
  const [lastSavedAt, setLastSavedAt] = useState(draft.updatedAt || null);
  const [reportStatus, setReportStatus] = useState(
    draft.status ||
      inferStatus({
        interventionType: draft.interventionType,
        transcription: draft.transcription,
        result: draft.result,
        isArchived: draft.isArchived,
      }),
  );
  const [archivedCount, setArchivedCount] = useState(getHistory().length);

  // Modèle sélectionné pour la génération
  const [selectedModelId, setSelectedModelId] = useState(
    draft.selectedModelId || DEFAULT_MODEL,
  );
  const [selectedModelName, setSelectedModelName] = useState(
    draft.selectedModelName || 'Voxtral Small 24B',
  );
  // Modèle effectivement utilisé pour la dernière génération
  const [usedModel, setUsedModel] = useState(draft.usedModel || null);

  // Charger les enfants à charge
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await getReferences();
        setReferences(data);
      } catch (err) {
        console.error('Erreur lors du chargement des enfants:', err);
      }
    };
    fetchChildren();
  }, []);

  const handleModelChange = (model) => {
    setSelectedModelId(model.id);
    setSelectedModelName(
      model.name?.replace(/^[^:]+:\s*/, '') ??
        model.id.split('/').pop() ??
        model.id,
    );
  };

  // Persistance du rapport en local pour reprise après refresh/fermeture
  useEffect(() => {
    const nextStatus = inferStatus({
      interventionType,
      transcription,
      result,
      isArchived,
    });
    setReportStatus(nextStatus);

    // Récupérer le nom de l'enfant sélectionné
    const selectedReference = references.find((c) => c.id === selectedReferenceId);
    const childName = selectedReference ? formatReferenceName(selectedReference) : '';

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        interventionType,
        selectedReferenceId,
        transcription,
        result,
        validated,
        elapsed,
        selectedModelId,
        selectedModelName,
        usedModel,
        isArchived,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
        // Ajouter les infos de contexte pour l'affichage du brouillon
        structureType: organization?.type ?? '',
        childName: childName, // Nom de l'enfant au lieu du professionnel
      }),
    );
    setLastSavedAt(new Date().toISOString());
  }, [
    interventionType,
    selectedReferenceId,
    transcription,
    result,
    validated,
    elapsed,
    selectedModelId,
    selectedModelName,
    usedModel,
    isArchived,
  ]);

  // Pendant le chargement, alterne un message aléatoire toutes les 2 secondes.
  useEffect(() => {
    if (!loading) return undefined;

    setLoadingMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));

    const intervalId = window.setInterval(() => {
      setLoadingMessageIndex((prev) => {
        if (LOADING_MESSAGES.length <= 1) return 0;
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * LOADING_MESSAGES.length);
        }
        return next;
      });
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [loading]);

  const handleReset = () => {
    if (
      !window.confirm(
        'Commencer un nouveau rapport ? Le brouillon sera effacé.',
      )
    )
      return;
    localStorage.removeItem(STORAGE_KEY);
    setInterventionType('');
    setSelectedChildId('');
    setTranscription('');
    setResult('');
    setValidated(false);
    setElapsed(null);
    setUsedModel(null);
    setIsArchived(false);
    setReportStatus(REPORT_STATUS.DRAFT);
  };

  const handleArchived = () => {
    // Nettoyer le brouillon du localStorage IMMÉDIATEMENT
    localStorage.removeItem(STORAGE_KEY);

    // Vider tous les states du rapport IMMÉDIATEMENT
    setInterventionType('');
    setSelectedChildId('');
    setTranscription('');
    setResult('');
    setValidated(false);
    setElapsed(null);
    setUsedModel(null);
    setIsArchived(false);
    setReportStatus(REPORT_STATUS.DRAFT);
    setArchivedCount(getHistory().length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!interventionType || !transcription.trim()) return;
    setLoading(true);
    setResult('');
    setValidated(false);
    setElapsed(null);
    setUsedModel(null);
    setIsArchived(false);
    setReportStatus(REPORT_STATUS.IN_PROGRESS);
    const start = Date.now();
    try {
      const text = await generateInterventionReport({
        interventionType,
        transcription,
        structureType: organization?.type ?? '',
        companyName: organization?.name ?? '',
        educatorName: fullName,
        educatorRole: ROLE_LABELS[role] ?? role,
        date: today,
        model: selectedModelId,
      });
      setResult(text);
      setUsedModel({ id: selectedModelId, name: selectedModelName });
      setElapsed(((Date.now() - start) / 1000).toFixed(1));
      setReportStatus(REPORT_STATUS.IN_PROGRESS);
    } catch (err) {
      setResult(`Erreur : ${err.message}`);
      setReportStatus(REPORT_STATUS.DRAFT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="cr-page"
      className="h-full overflow-y-auto py-6 px-2 md:px-5 md:py-8"
    >
      <div className="mx-auto flex w-full max-w-full flex-col gap-6">
        <div className={`${cardClass} py-4 md:py-5`}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-(--text-secondary)">
              Statut du rapport :
            </span>
            <span
              className={[
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                STATUS_META[reportStatus]?.className,
              ].join(' ')}
            >
              {STATUS_META[reportStatus]?.label}
            </span>
            <span className="text-xs text-(--text-muted)">
              Archives: {archivedCount}
            </span>
            {lastSavedAt && (
              <span className="text-xs text-(--text-muted)">
                Derniere reprise locale:{' '}
                {new Intl.DateTimeFormat('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(lastSavedAt))}
              </span>
            )}
          </div>
        </div>

        <form
          id="cr-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          {/* ── Étape 1 : Contexte automatique ── */}
          <StepCard
            step="1"
            title="Contexte automatique"
            subtitle="Rempli depuis votre profil — aucune saisie requise"
          >
            {/* Desktop: Grid layout with badges */}
            <div className="hidden sm:grid grid-cols-3 gap-3">
              <ContextBadge
                icon={Building2}
                label="Établissement"
                value={organization?.name ?? '—'}
              />
              <ContextBadge
                icon={User}
                label="Professionnel"
                value={`${fullName} · ${ROLE_LABELS[role] ?? role}`}
              />
              <ContextBadge
                icon={CalendarDays}
                label="Date"
                value={dateLabel}
              />
            </div>

            {/* Mobile: Compact single-line layout */}
            <div className="sm:hidden flex flex-col gap-2 text-xs">
              <div className="flex flex-wrap gap-3 items-baseline">
                <span>
                  <span className="font-bold text-(--text-primary)">
                    {fullName}
                  </span>
                </span>
                <span className="text-(--text-secondary)">
                  {organization?.type ?? '—'} - {organization?.name ?? '—'}
                </span>
                <span className="text-(--text-muted)">
                  {ROLE_LABELS[role] ?? role}
                </span>
                <span className="text-(--text-muted)">{dateLabel}</span>
              </div>
            </div>
          </StepCard>

          {/* ── Étape 2 : Type d'intervention ── */}
          <StepCard
            step="2"
            title="Type d'intervention"
            subtitle="Sélectionnez la nature de l'intervention"
          >
            <div className="flex flex-col gap-4">
              {/* Sélection de l'enfant à charge */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="reference-select"
                  className="text-[10px] md:text-sm font-medium text-(--text-primary)"
                >
                  Enfant concerné
                </label>
                <select
                  id="reference-select"
                  value={selectedReferenceId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="rounded-xl border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-4 py-2 md:text-base text-[10px] focus:outline-none focus:border-(--bleu-fonce) transition-colors w-full md:w-60"
                >
                  <option className="text-[10px]" value="">
                    Sélectionnez un enfant…
                  </option>
                  {references.map((child) => (
                    <option
                      key={child.id}
                      value={child.id}
                      className="text-[10px]"
                    >
                      {formatReferenceName(child)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {INTERVENTION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInterventionType(type)}
                    className={[
                      'px-4 py-2 rounded-xl text-[10px] md:text-sm font-medium border transition-all duration-150 cursor-pointer',
                      interventionType === type
                        ? 'bg-(--bleu-fonce) text-white border-(--bleu-fonce) shadow-sm'
                        : 'bg-(--bg-secondary) text-(--text-secondary) border-(--border) hover:border-(--bleu-fonce)/50 hover:text-(--text-primary)',
                    ].join(' ')}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </StepCard>

          {/* ── Étape 3 : Transcription ── */}
          <StepCard
            step="3"
            title="Transcription"
            subtitle="Dictez ou saisissez vos notes — l'IA extrait et structure les 7 sections"
          >
            <div className="rounded-xl border border-(--border) bg-(--bg-secondary) px-4 py-3 min-h-32">
              <VoiceTextarea
                value={transcription}
                onChange={setTranscription}
                placeholder="Dictez ou saisissez vos observations, le déroulement, les éléments d'analyse, les suites prévues… L'IA se charge du reste."
                rows={6}
                disabled={loading}
              />
            </div>
            <RgpdNotice message="Vos notes sont anonymisées automatiquement avant d'être envoyées à l'IA. Aucun nom, prénom ou donnée nominative n'est transmis." />
          </StepCard>

          {/* ── Actions ── */}
          <div id="form-actions" className="flex flex-col gap-4">
            {/* Ligne 1: Boutons d'actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="submit"
                color="blue"
                size="lg"
                disabled={loading || !interventionType || !transcription.trim()}
                className="flex-1"
              >
                {loading ? 'Génération en cours…' : 'Générer le compte rendu'}
              </Button>

              <Button
                color="green"
                size="lg"
                icon={FilePlus}
                onClick={handleReset}
                className="flex-1"
              >
                Nouveau rapport
              </Button>
            </div>

            {/* Ligne 2: Sélecteur de modèle et infos */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Sélecteur de modèle */}
              <ModelSelector
                value={selectedModelId}
                onChange={handleModelChange}
              />

              {/* Feedback timing */}
              {!loading && !result && (
                <span className="text-xs text-(--text-muted)">
                  Temps estimé : 5–10 s
                </span>
              )}
              {!loading && elapsed && (
                <span className="text-xs text-(--text-muted)">
                  Généré en {elapsed}s
                </span>
              )}
            </div>
          </div>
        </form>

        {/* ── Loading ── */}
        {loading && (
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="w-5 h-5 rounded-full border-2 border-[#0D66D4] border-t-transparent animate-spin shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span
                key={loadingMessageIndex}
                className="text-sm text-(--text-secondary) animate-pulse transition-opacity duration-300"
              >
                {LOADING_MESSAGES[loadingMessageIndex]}
              </span>
              <span className="text-[10px] text-(--text-muted) font-mono">
                {selectedModelId}
              </span>
            </div>
          </div>
        )}

        {/* ── Résultat ── */}
        {result && (
          <GeneratedResult
            id="cr-result"
            title="Compte rendu généré"
            result={result}
            validated={validated}
            onValidatedChange={setValidated}
            onRegenerate={() => handleSubmit({ preventDefault: () => {} })}
            onArchived={handleArchived}
            validationText="Je confirme avoir relu, vérifié et, si besoin, corrigé ce compte rendu. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel."
            generatedByModel={usedModel}
            downloadMeta={{
              interventionType,
              structureType: organization?.type ?? '',
              companyName: organization?.name ?? '',
              educatorName: fullName,
              childName: selectedReferenceId
                ? formatReferenceName(references.find((c) => c.id === selectedReferenceId) || {})
                : '',
              date: today,
              modelId: usedModel?.id,
              modelName: usedModel?.name,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default InterventionReport;
