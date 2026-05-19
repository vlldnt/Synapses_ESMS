import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Button from './Button';
import RgpdNotice from './RgpdNotice';
import GeneratedResult from './GeneratedResult';
import GeneratingReportModal from './GeneratingReportModal';
import TranscriptionInput from './TranscriptionInput';
import TranscriptionCard from './TranscriptionCard';
import StepCard from './StepCard';
import ModelSelector from '../features/interventionReport/components/ModelSelector';
import { DEFAULT_MODEL, PROMPT_NOT_FOUND } from '../services/aiService';
import { getReferences, formatReferenceName } from '../services/referenceService';
import { getOrgUsers } from '../services/userService';
import { getHistory } from '../services/historyService';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { AGENTS } from '../constants/agents';
import { CARD_CLASS, ROLE_LABELS } from '../constants/shared';

const REPORT_STATUS = { DRAFT: 'draft', IN_PROGRESS: 'in_progress', ARCHIVED: 'archived' };

function inferStatus({ observations, result, isArchived }) {
  if (isArchived) return REPORT_STATUS.ARCHIVED;
  if (result?.trim()) return REPORT_STATUS.IN_PROGRESS;
  if (observations?.trim()) return REPORT_STATUS.DRAFT;
  return REPORT_STATUS.DRAFT;
}

function loadDraft(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
}

export default function AgentPage({ config }) {
  const {
    agentId, badge, storageKey, pageId, formId, resultId,
    step1Subtitle, step2Title, step2Subtitle, placeholder,
    buttonLabel, resetLabel, resetConfirm, resultTitle, validationText,
    generateFn, loadingMessages, interventionType, type,
    interventionTypeOptions,
    showAdminEducatorSelect,
  } = config;

  const role = useSelector((s) => s.role.role);
  const { fullName, organization, user } = useCurrentUser();
  const accent = AGENTS.find((a) => a.id === agentId)?.color ?? '#673DE6';
  const draft = loadDraft(storageKey);
  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

  const [selectedReferenceId, setSelectedReferenceId] = useState(draft.selectedReferenceId || '');
  const [references, setReferences] = useState([]);
  const [observations, setObservations] = useState(draft.observations || '');
  const [selectedInterventionType, setSelectedInterventionType] = useState(draft.selectedInterventionType || '');
  const [orgUsers, setOrgUsers] = useState([]);
  const [selectedEducatorId, setSelectedEducatorId] = useState(draft.selectedEducatorId || '');
  const controllerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [result, setResult] = useState(draft.result || '');
  const [validated, setValidated] = useState(Boolean(draft.validated));
  const [elapsed, setElapsed] = useState(draft.elapsed || null);
  const [isArchived, setIsArchived] = useState(Boolean(draft.isArchived));
  const [reportStatus, setReportStatus] = useState(
    draft.status || inferStatus({ observations: draft.observations, result: draft.result, isArchived: draft.isArchived }),
  );
  const [selectedModelId, setSelectedModelId] = useState(draft.selectedModelId || DEFAULT_MODEL);
  const [selectedModelName, setSelectedModelName] = useState(draft.selectedModelName || 'Voxtral Small 24B');
  const [usedModel, setUsedModel] = useState(draft.usedModel || null);

  useEffect(() => {
    const load = async () => {
      try {
        const [children] = await Promise.all([
          getReferences(),
          ...(showAdminEducatorSelect && role === 'admin'
            ? [getOrgUsers().then((users) => { setOrgUsers(users); if (!selectedEducatorId) setSelectedEducatorId(user?.id || ''); })]
            : []),
        ]);
        setReferences(children);
        const educatorId = showAdminEducatorSelect && role === 'admin' ? (selectedEducatorId || user?.id) : user?.id;
        await getHistory(educatorId);
      } catch (err) {
        console.error('AgentPage load error:', err);
      }
    };
    if (user?.id) load();
  }, [user?.id]);

  const handleModelChange = (model) => {
    setSelectedModelId(model.id);
    setSelectedModelName(model.name?.replace(/^[^:]+:\s*/, '') ?? model.id.split('/').pop() ?? model.id);
  };

  useEffect(() => {
    const nextStatus = inferStatus({ observations, result, isArchived });
    setReportStatus(nextStatus);
    const ref = references.find((c) => c.id === selectedReferenceId);
    localStorage.setItem(storageKey, JSON.stringify({
      selectedReferenceId, observations, result, validated, elapsed,
      selectedModelId, selectedModelName, usedModel, isArchived,
      status: nextStatus, updatedAt: new Date().toISOString(),
      structureType: organization?.structure_type ?? '',
      childName: ref ? formatReferenceName(ref) : '',
      selectedInterventionType, selectedEducatorId,
    }));
  }, [selectedReferenceId, observations, result, validated, elapsed, selectedModelId, selectedModelName, usedModel, isArchived, selectedInterventionType, selectedEducatorId]);

  useEffect(() => {
    if (!loading) { setShowGeneratingModal(false); return; }
    setShowGeneratingModal(true);
    setLoadingMessageIndex(Math.floor(Math.random() * loadingMessages.length));
    const id = window.setInterval(() => {
      setLoadingMessageIndex((prev) => {
        if (loadingMessages.length <= 1) return 0;
        let next = prev;
        while (next === prev) next = Math.floor(Math.random() * loadingMessages.length);
        return next;
      });
    }, 2000);
    return () => window.clearInterval(id);
  }, [loading]);

  const handleReset = () => {
    if (!window.confirm(resetConfirm || 'Commencer un nouveau document ? Le brouillon sera effacé.')) return;
    localStorage.removeItem(storageKey);
    setSelectedReferenceId(''); setObservations(''); setResult('');
    setValidated(false); setElapsed(null); setUsedModel(null); setIsArchived(false);
    setSelectedInterventionType('');
    setReportStatus(REPORT_STATUS.DRAFT);
  };

  const handleArchived = async () => {
    localStorage.removeItem(storageKey);
    setSelectedReferenceId(''); setObservations(''); setResult('');
    setValidated(false); setElapsed(null); setUsedModel(null); setIsArchived(false);
    setSelectedInterventionType('');
    setReportStatus(REPORT_STATUS.DRAFT);
  };

  const handleCancelGeneration = () => {
    controllerRef.current?.abort();
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!observations.trim() || !selectedReferenceId) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true); setResult(''); setValidated(false); setElapsed(null);
    setUsedModel(null); setIsArchived(false); setReportStatus(REPORT_STATUS.IN_PROGRESS);
    const start = Date.now();
    try {
      const text = await generateFn({
        observations,
        transcription: observations,
        interventionType: selectedInterventionType || interventionType,
        structureType: organization?.structure_type ?? '',
        companyName: organization?.name ?? '',
        educatorName: fullName,
        educatorRole: ROLE_LABELS[role] ?? role,
        date: today,
        model: selectedModelId,
        signal: controller.signal,
      });
      setResult(text);
      setUsedModel({ id: selectedModelId, name: selectedModelName });
      setElapsed(((Date.now() - start) / 1000).toFixed(1));
      setReportStatus(REPORT_STATUS.IN_PROGRESS);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setResult(err.message === PROMPT_NOT_FOUND
        ? "Cette fonctionnalité n'est pas disponible pour le moment."
        : `Erreur : ${err.message}`);
      setReportStatus(REPORT_STATUS.DRAFT);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const selectedRef = references.find((c) => c.id === selectedReferenceId);
  const childName = selectedRef ? formatReferenceName(selectedRef) : '';

  if (role !== 'agent' && role !== 'admin') {
    return (
      <div className="h-full flex items-center justify-center py-6 px-2 md:px-5 md:py-8">
        <p className="text-(--text-muted) text-lg">Accès non autorisé</p>
      </div>
    );
  }

  return (
    <div id={pageId} className="h-full overflow-y-auto py-6 px-2 md:px-5 md:py-8">
      <div className="mx-auto flex w-full max-w-full flex-col gap-6">
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-6">

          <StepCard step="1" title="Contexte" subtitle={step1Subtitle} accentColor={accent}>
            {/* Desktop */}
            <div className="hidden md:flex md:flex-row md:items-center gap-6 text-sm overflow-x-auto">
              {showAdminEducatorSelect && role === 'admin' && orgUsers.length > 0 ? (
                <div className="flex flex-col">
                  <label htmlFor="educator-select" className="text-xs font-medium text-(--text-muted)">Professionnel</label>
                  <select
                    id="educator-select"
                    value={selectedEducatorId}
                    onChange={(e) => setSelectedEducatorId(e.target.value)}
                    className="rounded-xl border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-4 py-2 text-base focus:outline-none focus:border-(--bleu-fonce) transition-colors"
                  >
                    {orgUsers.map((u) => (
                      <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col">
                  <p className="text-(--text-muted) text-xs">Professionnel</p>
                  <p className="font-semibold text-(--text-primary)">{fullName}</p>
                  <p className="text-xs text-(--text-secondary)">{ROLE_LABELS[role] ?? role}</p>
                </div>
              )}
              <div className="w-px h-10 bg-(--border)" />
              <div className="flex flex-col">
                <p className="text-(--text-muted) text-xs">Structure</p>
                <p className="font-semibold text-(--text-primary)">{organization?.name ?? '—'}</p>
                <p className="text-xs text-(--text-secondary)">{organization?.structure_type ?? '—'}</p>
              </div>
              <div className="w-px h-10 bg-(--border)" />
              <div className="flex flex-col">
                <p className="text-(--text-muted) text-xs">Date</p>
                <p className="font-semibold text-(--text-primary)">{dateLabel}</p>
              </div>
              <div className="w-px h-10 bg-(--border)" />
              {interventionTypeOptions && (
                <>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="intervention-type-select" className="text-xs font-medium text-(--text-primary)">Type d'intervention</label>
                    <select
                      id="intervention-type-select"
                      value={selectedInterventionType}
                      onChange={(e) => setSelectedInterventionType(e.target.value)}
                      className="rounded-xl border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-4 py-2 text-base focus:outline-none focus:border-(--bleu-fonce) transition-colors w-56"
                    >
                      <option value="">Type…</option>
                      {interventionTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="w-px h-10 bg-(--border)" />
                </>
              )}
              <div className="flex flex-col gap-2">
                <label htmlFor="reference-select" className="text-xs font-medium text-(--text-primary)">Référence :</label>
                <select
                  id="reference-select"
                  value={selectedReferenceId}
                  onChange={(e) => setSelectedReferenceId(e.target.value)}
                  className="rounded-xl border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-4 py-2 text-base focus:outline-none focus:border-(--bleu-fonce) transition-colors w-60"
                >
                  <option value="">Sélectionnez...</option>
                  {references.map((c) => <option key={c.id} value={c.id}>{formatReferenceName(c)}</option>)}
                </select>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden flex-col gap-4 text-[10px]">
              <div className="flex flex-row gap-2">
                {showAdminEducatorSelect && role === 'admin' && orgUsers.length > 0 ? (
                  <div className="flex flex-col flex-1">
                    <label htmlFor="educator-select-mobile" className="font-medium text-(--text-muted)">Professionnel</label>
                    <select
                      id="educator-select-mobile"
                      value={selectedEducatorId}
                      onChange={(e) => setSelectedEducatorId(e.target.value)}
                      className="rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-2 py-1 focus:outline-none"
                    >
                      {orgUsers.map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="flex flex-col flex-1">
                    <p className="text-(--text-muted) font-medium">Professionnel</p>
                    <p className="font-semibold text-(--text-primary)">{fullName}</p>
                    <p className="text-(--text-secondary)">{ROLE_LABELS[role] ?? role}</p>
                  </div>
                )}
                <div className="w-px bg-(--border)" />
                <div className="flex flex-col flex-1">
                  <p className="text-(--text-muted) font-medium">Structure</p>
                  <p className="font-semibold text-(--text-primary)">{organization?.name ?? '—'}</p>
                  <p className="text-(--text-secondary)">{organization?.structure_type ?? '—'}</p>
                </div>
                <div className="w-px bg-(--border)" />
                <div className="flex flex-col flex-1">
                  <p className="text-(--text-muted) font-medium">Date</p>
                  <p className="font-semibold text-(--text-primary)">{dateLabel}</p>
                </div>
              </div>
              {interventionTypeOptions && (
                <div className="flex flex-col gap-1 pt-2 border-t border-(--border)/50">
                  <label htmlFor="intervention-type-mobile" className="font-medium text-(--text-primary)">Type d'intervention</label>
                  <select
                    id="intervention-type-mobile"
                    value={selectedInterventionType}
                    onChange={(e) => setSelectedInterventionType(e.target.value)}
                    className="rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-3 py-1.5 focus:outline-none w-full"
                  >
                    <option value="">Type…</option>
                    {interventionTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1 pt-2 border-t border-(--border)/50">
                <label htmlFor="reference-select-mobile" className="font-medium text-(--text-primary)">Personne concernée</label>
                <select
                  id="reference-select-mobile"
                  value={selectedReferenceId}
                  onChange={(e) => setSelectedReferenceId(e.target.value)}
                  className="rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-3 py-1.5 focus:outline-none w-full"
                >
                  <option value="">Sélectionnez...</option>
                  {references.map((c) => <option key={c.id} value={c.id}>{formatReferenceName(c)}</option>)}
                </select>
              </div>
            </div>
          </StepCard>

          <StepCard
            step="2"
            title={step2Title}
            subtitle={step2Subtitle}
            accentColor={accent}
            headerAction={
              <div className="md:hidden">
                <TranscriptionInput value={observations} onChange={setObservations} disabled={loading} variant="header-button" />
              </div>
            }
          >
            <TranscriptionCard value={observations} onChange={setObservations} placeholder={placeholder} rows={8} disabled={loading} />
            <RgpdNotice message="Vos notes sont anonymisées — aucun nom, prénom ou donnée nominative ne doit être transmis." />
          </StepCard>

          <div id="form-actions" className="flex flex-col gap-3">
            <div className="flex flex-row items-center gap-3">
              <Button
                type="submit"
                color={accent}
                size="md"
                disabled={loading || !observations.trim() || !selectedReferenceId}
                className="flex-1 md:flex-none"
              >
                {loading ? 'Génération en cours…' : buttonLabel}
              </Button>
              {!loading && !result && <span className="text-xs text-(--text-muted)">Temps estimé : 5–15 s</span>}
              {!loading && elapsed && <span className="text-xs text-(--text-muted)">Généré en {elapsed}s</span>}
              <Button color={accent} size="md" onClick={handleReset} className="flex-1 md:hidden">
                Nouveau
              </Button>
            </div>
            <div className="flex items-center">
              <button type="button" onClick={handleReset} className="hidden md:inline-flex ml-auto text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer">
                {resetLabel}
              </button>
            </div>
          </div>
        </form>

        {loading && (
          <div className={`${CARD_CLASS} flex items-center gap-4`}>
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin shrink-0" style={{ borderColor: accent, borderTopColor: 'transparent' }} />
            <span key={loadingMessageIndex} className="text-sm text-(--text-secondary) animate-pulse transition-opacity duration-300">
              {loadingMessages[loadingMessageIndex]}
            </span>
          </div>
        )}

        {result && (
          <GeneratedResult
            id={resultId}
            title={resultTitle}
            result={result}
            validated={validated}
            onValidatedChange={setValidated}
            onRegenerate={() => handleSubmit({ preventDefault: () => {} })}
            onArchived={handleArchived}
            validationText={validationText}
            generatedByModel={usedModel || { id: selectedModelId, name: selectedModelName }}
            downloadMeta={{
              type: type || badge,
              interventionType: selectedInterventionType || interventionType,
              structureType: organization?.structure_type ?? '',
              companyName: organization?.name ?? '',
              educatorName: fullName,
              childName,
              date: today,
              modelId: usedModel?.id || selectedModelId,
              modelName: usedModel?.name || selectedModelName,
            }}
          />
        )}

        <GeneratingReportModal
          isOpen={showGeneratingModal}
          message={loadingMessages[loadingMessageIndex]}
          onCancel={handleCancelGeneration}
          badge={badge}
          color={accent}
          docTitle={step1Subtitle || badge}
        />
      </div>
    </div>
  );
}
