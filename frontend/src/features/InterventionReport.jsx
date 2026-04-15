import { useState, useEffect, useRef } from 'react';
import {
  FilePlus, Building2, User, CalendarDays,
  Cpu, ChevronDown, Search, X,
} from 'lucide-react';
import Button from '../components/Button';
import RgpdNotice from '../components/RgpdNotice';
import GeneratedResult from '../components/GeneratedResult';
import VoiceTextarea from '../components/VoiceTextarea';
import StepCard from '../components/Dashboard/StepCard';
import { generateInterventionReport, DEFAULT_MODEL } from '../services/aiService';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useModels } from '../hooks/useModels';
import { useSelector } from 'react-redux';

const STORAGE_KEY = 'cr_intervention_draft';

const INTERVENTION_TYPES = [
  'Visite à domicile',
  'Entretien individuel',
  'Entretien famille',
  'Accompagnement extérieur',
  'Autre',
];

const cardClass =
  'rounded-2xl border border-(--border) bg-(--bg-primary) p-5 md:p-8 shadow-sm';

const ROLE_LABELS = {
  agent: 'Agent éducatif',
  direction: 'Directeur / Directrice',
  admin: 'Administrateur',
};

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

// ─── ContextBadge ─────────────────────────────────────────────────────────

function ContextBadge({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-(--bg-tertiary) border border-(--border)">
      <Icon size={13} className="text-(--text-muted) shrink-0" />
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] text-(--text-muted) uppercase tracking-wide">{label}</span>
        <span className="text-xs font-medium text-(--text-primary)">{value}</span>
      </div>
    </div>
  );
}

// ─── ModelSelector (DEV uniquement) ───────────────────────────────────────

function ModelSelector({ value, onChange }) {
  const { models, isLoading, getModelName } = useModels();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Fermeture au clic extérieur
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!import.meta.env.DEV) return null;

  const filtered = search.trim()
    ? models.filter(
        (m) =>
          m.id.toLowerCase().includes(search.toLowerCase()) ||
          (m.name ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : models;

  const currentName = getModelName(value);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
          'border border-amber-300 bg-amber-50 text-amber-800',
          'dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
          'hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer',
          'max-w-[220px]',
        ].join(' ')}
        title="Changer de modèle IA (mode DEV uniquement)"
      >
        <span className="shrink-0 text-[9px] font-bold tracking-wide bg-amber-300 dark:bg-amber-700 text-amber-900 dark:text-amber-200 rounded px-1 py-0.5">
          DEV
        </span>
        <Cpu size={12} className="shrink-0" />
        <span className="truncate">
          {isLoading ? 'Chargement…' : currentName}
        </span>
        <ChevronDown
          size={11}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={[
            'absolute bottom-full mb-2 left-0 z-50',
            'w-80 bg-(--bg-primary) border border-(--border) rounded-xl shadow-xl',
            'overflow-hidden',
          ].join(' ')}
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-(--border)">
            <Search size={13} className="text-(--text-muted) shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un modèle…"
              className="flex-1 bg-transparent text-xs text-(--text-primary) placeholder:text-(--text-muted) outline-none"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Model list */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading && (
              <p className="text-xs text-(--text-muted) px-4 py-6 text-center">
                Chargement des modèles…
              </p>
            )}
            {!isLoading && filtered.length === 0 && (
              <p className="text-xs text-(--text-muted) px-4 py-6 text-center">
                Aucun modèle trouvé
              </p>
            )}
            {filtered.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onChange(model);
                  setOpen(false);
                  setSearch('');
                }}
                className={[
                  'w-full text-left px-4 py-2.5 flex flex-col gap-0.5',
                  'hover:bg-(--bg-tertiary) transition-colors cursor-pointer',
                  value === model.id
                    ? 'bg-(--bleu-fonce)/8 border-l-2 border-(--bleu-fonce)'
                    : 'border-l-2 border-transparent',
                ].join(' ')}
              >
                <span className="text-xs font-medium text-(--text-primary) truncate">
                  {model.name?.replace(/^[^:]+:\s*/, '') ?? model.id}
                </span>
                <span className="text-[10px] text-(--text-muted) font-mono truncate">
                  {model.id}
                </span>
              </button>
            ))}
          </div>

          {/* Footer: modèle actuel */}
          <div className="border-t border-(--border) px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] text-(--text-muted) truncate font-mono max-w-[180px]">
              {value}
            </span>
            {value !== DEFAULT_MODEL && (
              <button
                type="button"
                onClick={() => {
                  onChange({ id: DEFAULT_MODEL, name: 'Voxtral Small 24B' });
                  setOpen(false);
                }}
                className="text-[10px] text-(--bleu-fonce) hover:underline cursor-pointer shrink-0 ml-2"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────

function InterventionReport() {
  const { fullName, company } = useCurrentUser();
  const role = useSelector((state) => state.role.role);
  const draft = loadDraft();

  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const [interventionType, setInterventionType] = useState(draft.interventionType || '');
  const [transcription, setTranscription] = useState(draft.transcription || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [validated, setValidated] = useState(false);
  const [elapsed, setElapsed] = useState(null);

  // Modèle sélectionné (DEV only — toujours DEFAULT_MODEL en prod)
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL);
  const [selectedModelName, setSelectedModelName] = useState('Voxtral Small 24B');
  // Modèle effectivement utilisé pour la dernière génération
  const [usedModel, setUsedModel] = useState(null);

  const handleModelChange = (model) => {
    setSelectedModelId(model.id);
    setSelectedModelName(model.name?.replace(/^[^:]+:\s*/, '') ?? model.id.split('/').pop() ?? model.id);
  };

  // Persistance brouillon
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ interventionType, transcription }),
    );
  }, [interventionType, transcription]);

  const handleReset = () => {
    if (!window.confirm('Commencer un nouveau rapport ? Le brouillon sera effacé.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setInterventionType('');
    setTranscription('');
    setResult('');
    setValidated(false);
    setElapsed(null);
    setUsedModel(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!interventionType || !transcription.trim()) return;
    setLoading(true);
    setResult('');
    setValidated(false);
    setElapsed(null);
    setUsedModel(null);
    const start = Date.now();
    try {
      const text = await generateInterventionReport({
        interventionType,
        transcription,
        structureType: company?.type ?? '',
        companyName: company?.name ?? '',
        educatorName: fullName,
        educatorRole: ROLE_LABELS[role] ?? role,
        date: today,
        model: selectedModelId,
      });
      setResult(text);
      setUsedModel({ id: selectedModelId, name: selectedModelName });
      setElapsed(((Date.now() - start) / 1000).toFixed(1));
    } catch (err) {
      setResult(`Erreur : ${err.message}`);
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
        <form id="cr-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Étape 1 : Contexte automatique ── */}
          <StepCard
            step="1"
            title="Contexte automatique"
            subtitle="Rempli depuis votre profil — aucune saisie requise"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ContextBadge
                icon={Building2}
                label="Établissement"
                value={company?.name ?? '—'}
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
          </StepCard>

          {/* ── Étape 2 : Type d'intervention ── */}
          <StepCard
            step="2"
            title="Type d'intervention"
            subtitle="Sélectionnez la nature de l'intervention"
          >
            <div className="flex flex-wrap gap-2">
              {INTERVENTION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInterventionType(type)}
                  className={[
                    'px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 cursor-pointer',
                    interventionType === type
                      ? 'bg-(--bleu-fonce) text-white border-(--bleu-fonce) shadow-sm'
                      : 'bg-(--bg-secondary) text-(--text-secondary) border-(--border) hover:border-(--bleu-fonce)/50 hover:text-(--text-primary)',
                  ].join(' ')}
                >
                  {type}
                </button>
              ))}
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
          <div
            id="form-actions"
            className="flex flex-row items-center flex-wrap gap-3"
          >
            <Button
              type="submit"
              color="blue"
              size="lg"
              disabled={loading || !interventionType || !transcription.trim()}
            >
              {loading ? 'Génération en cours…' : 'Générer le compte rendu'}
            </Button>

            {/* Sélecteur de modèle — DEV uniquement */}
            <ModelSelector value={selectedModelId} onChange={handleModelChange} />

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

            <Button
              color="green"
              size="lg"
              icon={FilePlus}
              onClick={handleReset}
              className="ml-auto"
            >
              Nouveau rapport
            </Button>
          </div>
        </form>

        {/* ── Loading ── */}
        {loading && (
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="w-5 h-5 rounded-full border-2 border-[#0D66D4] border-t-transparent animate-spin shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-(--text-secondary)">
                L'IA analyse votre transcription et structure le compte rendu…
              </span>
              {import.meta.env.DEV && (
                <span className="text-[10px] text-(--text-muted) font-mono">
                  {selectedModelId}
                </span>
              )}
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
            validationText="Je confirme avoir relu, vérifié et, si besoin, corrigé ce compte rendu. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel."
            generatedByModel={usedModel}
            downloadMeta={{
              interventionType,
              structureType: company?.type ?? '',
              companyName: company?.name ?? '',
              educatorName: fullName,
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
