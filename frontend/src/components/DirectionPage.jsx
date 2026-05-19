import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
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
import { useCurrentUser } from '../hooks/useCurrentUser';
import { getHistory } from '../services/historyService';
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

export default function DirectionPage({ config }) {
  const {
    agentId, badge, storageKey, pageId, formId, resultId,
    step1Subtitle, step2Title, step2Subtitle, placeholder,
    buttonLabel, resetLabel, resultTitle, validationText,
    generateFn, loadingMessages, interventionType,
  } = config;

  const role = useSelector((s) => s.role.role);
  const { fullName, organization, user } = useCurrentUser();
  const accent = AGENTS.find((a) => a.id === agentId)?.color || '#F97316';
  const draft = loadDraft(storageKey);

  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

  const [observations, setObservations] = useState(draft.observations || '');
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
  const controllerRef = useRef(null);

  const handleModelChange = (model) => {
    setSelectedModelId(model.id);
    setSelectedModelName(model.name?.replace(/^[^:]+:\s*/, '') ?? model.id.split('/').pop() ?? model.id);
  };

  useEffect(() => {
    const nextStatus = inferStatus({ observations, result, isArchived });
    setReportStatus(nextStatus);
    localStorage.setItem(storageKey, JSON.stringify({
      observations, result, validated, elapsed, selectedModelId,
      selectedModelName, usedModel, isArchived, status: nextStatus,
      updatedAt: new Date().toISOString(), structureType: organization?.structure_type ?? '',
    }));
  }, [observations, result, validated, elapsed, selectedModelId, selectedModelName, usedModel, isArchived]);

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

  if (role !== 'direction' && role !== 'admin') return <Navigate to='/' replace />;

  const reset = () => {
    if (!window.confirm('Commencer un nouveau document ? Le brouillon sera effacé.')) return;
    localStorage.removeItem(storageKey);
    setObservations(''); setResult(''); setValidated(false);
    setElapsed(null); setUsedModel(null); setIsArchived(false);
    setReportStatus(REPORT_STATUS.DRAFT);
  };

  const handleArchived = async () => {
    localStorage.removeItem(storageKey);
    setObservations(''); setResult(''); setValidated(false);
    setElapsed(null); setUsedModel(null); setIsArchived(false);
    setReportStatus(REPORT_STATUS.DRAFT);
  };

  const handleCancelGeneration = () => {
    controllerRef.current?.abort();
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!observations.trim()) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true); setResult(''); setValidated(false); setElapsed(null);
    setUsedModel(null); setIsArchived(false); setReportStatus(REPORT_STATUS.IN_PROGRESS);
    const start = Date.now();
    try {
      const text = await generateFn({
        observations,
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

  return (
    <div id={pageId} className='h-full overflow-y-auto py-6 px-2 md:px-5 md:py-8'>
      <div className='mx-auto flex w-full max-w-full flex-col gap-6'>
        <form id={formId} onSubmit={handleSubmit} className='flex flex-col gap-6'>

          <StepCard step='1' title='Contexte' subtitle={step1Subtitle} accentColor={accent}>
            <div className='hidden md:flex md:flex-row md:items-center gap-6 text-sm'>
              <div className='flex flex-col'>
                <p className='text-(--text-muted) text-xs'>Professionnel</p>
                <p className='font-semibold text-(--text-primary)'>{fullName}</p>
                <p className='text-xs text-(--text-secondary)'>{ROLE_LABELS[role] ?? role}</p>
              </div>
              <div className='w-px h-10 bg-(--border)' />
              <div className='flex flex-col'>
                <p className='text-(--text-muted) text-xs'>Structure</p>
                <p className='font-semibold text-(--text-primary)'>{organization?.name ?? '—'}</p>
                <p className='text-xs text-(--text-secondary)'>{organization?.structure_type ?? '—'}</p>
              </div>
              <div className='w-px h-10 bg-(--border)' />
              <div className='flex flex-col'>
                <p className='text-(--text-muted) text-xs'>Date</p>
                <p className='font-semibold text-(--text-primary)'>{dateLabel}</p>
              </div>
            </div>
            <div className='flex md:hidden flex-row gap-2 text-[10px]'>
              <div className='flex flex-col flex-1'>
                <p className='text-(--text-muted) font-medium'>Professionnel</p>
                <p className='font-semibold text-(--text-primary)'>{fullName}</p>
                <p className='text-(--text-secondary)'>{ROLE_LABELS[role] ?? role}</p>
              </div>
              <div className='w-px bg-(--border)' />
              <div className='flex flex-col flex-1'>
                <p className='text-(--text-muted) font-medium'>Structure</p>
                <p className='font-semibold text-(--text-primary)'>{organization?.name ?? '—'}</p>
                <p className='text-(--text-secondary)'>{organization?.structure_type ?? '—'}</p>
              </div>
              <div className='w-px bg-(--border)' />
              <div className='flex flex-col flex-1'>
                <p className='text-(--text-muted) font-medium'>Date</p>
                <p className='font-semibold text-(--text-primary)'>{dateLabel}</p>
              </div>
            </div>
          </StepCard>

          <StepCard
            step='2'
            title={step2Title}
            subtitle={step2Subtitle}
            accentColor={accent}
            headerAction={
              <div className='md:hidden'>
                <TranscriptionInput value={observations} onChange={setObservations} disabled={loading} variant='header-button' />
              </div>
            }
          >
            <TranscriptionCard
              value={observations}
              onChange={setObservations}
              placeholder={placeholder}
              rows={8}
              disabled={loading}
            />
            <RgpdNotice message='Vos notes sont traitées de manière anonymisée — aucun nom, prénom ou donnée nominative ne doit être transmis.' />
          </StepCard>

          <div id='form-actions' className='flex flex-col gap-3'>
            <div className='flex flex-row gap-3'>
              <button
                type='submit'
                disabled={loading || !observations.trim()}
                className='flex-1 md:flex-none px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 cursor-pointer transition-opacity'
                style={{ background: accent }}
              >
                {loading ? 'Génération en cours…' : buttonLabel}
              </button>
              <button
                type='button'
                onClick={reset}
                className='flex-1 md:hidden px-5 py-2.5 rounded-xl bg-(--bg-secondary) text-(--text-primary) text-sm font-medium border border-(--border) cursor-pointer'
              >
                Nouveau
              </button>
            </div>
            <div className='flex items-center gap-3'>
              <ModelSelector value={selectedModelId} onChange={handleModelChange} />
              {!loading && !result && <span className='text-xs text-(--text-muted)'>Temps estimé : 10–15 s</span>}
              {!loading && elapsed && <span className='text-xs text-(--text-muted)'>Généré en {elapsed}s</span>}
              <button type='button' onClick={reset} className='hidden md:inline-flex ml-auto text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer'>
                {resetLabel}
              </button>
            </div>
          </div>
        </form>

        {loading && (
          <div className={`${CARD_CLASS} flex items-center gap-4`}>
            <div className='w-5 h-5 rounded-full border-2 border-t-transparent animate-spin shrink-0' style={{ borderColor: accent, borderTopColor: 'transparent' }} />
            <div className='flex flex-col gap-0.5'>
              <span key={loadingMessageIndex} className='text-sm text-(--text-secondary) animate-pulse'>{loadingMessages[loadingMessageIndex]}</span>
              <span className='text-[10px] text-(--text-muted) font-mono'>{selectedModelId}</span>
            </div>
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
              type: badge,
              interventionType,
              structureType: organization?.structure_type ?? '',
              companyName: organization?.name ?? '',
              educatorName: fullName,
              childName: '',
              date: today,
              modelId: usedModel?.id || selectedModelId,
              modelName: usedModel?.name || selectedModelName,
            }}
          />
        )}

        <GeneratingReportModal isOpen={showGeneratingModal} message={loadingMessages[loadingMessageIndex]} onCancel={handleCancelGeneration} />
      </div>
    </div>
  );
}
