import { useState, useEffect, useRef } from "react";
import Button from "../../components/Button";
import RgpdNotice from "../../components/RgpdNotice";
import GeneratedResult from "../../components/GeneratedResult";
import GeneratingReportModal from "../../components/GeneratingReportModal";
import TranscriptionInput from "../../components/TranscriptionInput.jsx";
import TranscriptionCard from "../../components/TranscriptionCard";
import StepCard from "../../components/StepCard";
import {
  generatePersonalizedProject,
  DEFAULT_MODEL,
  PROMPT_NOT_FOUND,
} from "../../services/aiService";
import {
  getReferences,
  formatReferenceName,
} from "../../services/referenceService";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useSelector } from "react-redux";
import { getHistory } from "../../services/historyService";
import ModelSelector from "../interventionReport/components/ModelSelector";
import {
  STORAGE_KEY,
  LOADING_MESSAGES,
  REPORT_STATUS,
} from "../../constants/ppa";
import { CARD_CLASS, ROLE_LABELS } from "../../constants/shared";
import { AGENTS } from "../../constants/agents";

const ACCENT = AGENTS.find((a) => a.id === 'ppa-medico-social')?.color ?? '#4F72FF';

function inferStatus({ observations, result, isArchived }) {
  if (isArchived) return REPORT_STATUS.ARCHIVED;
  if (result?.trim()) return REPORT_STATUS.IN_PROGRESS;
  if (observations?.trim()) return REPORT_STATUS.DRAFT;
  return REPORT_STATUS.DRAFT;
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function PersonalizedProjectPage() {
  const { fullName, organization, user } = useCurrentUser();
  const role = useSelector((state) => state.role.role);
  const draft = loadDraft();

  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const [selectedReferenceId, setSelectedReferenceId] = useState(
    draft.selectedReferenceId || "",
  );
  const [references, setReferences] = useState([]);
  const [observations, setObservations] = useState(draft.observations || "");
  const controllerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [result, setResult] = useState(draft.result || "");
  const [validated, setValidated] = useState(Boolean(draft.validated));
  const [elapsed, setElapsed] = useState(draft.elapsed || null);
  const [isArchived, setIsArchived] = useState(Boolean(draft.isArchived));
  const [lastSavedAt, setLastSavedAt] = useState(draft.updatedAt || null);
  const [reportStatus, setReportStatus] = useState(
    draft.status ||
      inferStatus({
        observations: draft.observations,
        result: draft.result,
        isArchived: draft.isArchived,
      }),
  );
  const [archivedCount, setArchivedCount] = useState(0);

  const [selectedModelId, setSelectedModelId] = useState(
    draft.selectedModelId || DEFAULT_MODEL,
  );
  const [selectedModelName, setSelectedModelName] = useState(
    draft.selectedModelName || "Voxtral Small 24B",
  );
  const [usedModel, setUsedModel] = useState(draft.usedModel || null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const children = await getReferences();
        setReferences(children);

        const archives = await getHistory(user?.id);
        setArchivedCount(archives.length);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleModelChange = (model) => {
    setSelectedModelId(model.id);
    setSelectedModelName(
      model.name?.replace(/^[^:]+:\s*/, "") ??
        model.id.split("/").pop() ??
        model.id,
    );
  };

  useEffect(() => {
    const nextStatus = inferStatus({ observations, result, isArchived });
    setReportStatus(nextStatus);

    const selectedReference = references.find(
      (c) => c.id === selectedReferenceId,
    );
    const childName = selectedReference
      ? formatReferenceName(selectedReference)
      : "";

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedReferenceId,
        observations,
        result,
        validated,
        elapsed,
        selectedModelId,
        selectedModelName,
        usedModel,
        isArchived,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
        structureType: organization?.structure_type ?? "",
        childName,
      }),
    );
    setLastSavedAt(new Date().toISOString());
  }, [
    selectedReferenceId,
    observations,
    result,
    validated,
    elapsed,
    selectedModelId,
    selectedModelName,
    usedModel,
    isArchived,
  ]);

  useEffect(() => {
    if (!loading) {
      setShowGeneratingModal(false);
      return undefined;
    }

    setShowGeneratingModal(true);
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
        "Commencer un nouveau PPA ? Le brouillon sera effacé.",
      )
    )
      return;
    localStorage.removeItem(STORAGE_KEY);
    setSelectedReferenceId("");
    setObservations("");
    setResult("");
    setValidated(false);
    setElapsed(null);
    setUsedModel(null);
    setIsArchived(false);
    setReportStatus(REPORT_STATUS.DRAFT);
  };

  const handleArchived = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setSelectedReferenceId("");
    setObservations("");
    setResult("");
    setValidated(false);
    setElapsed(null);
    setUsedModel(null);
    setIsArchived(false);
    setReportStatus(REPORT_STATUS.DRAFT);

    try {
      const archives = await getHistory(user?.id);
      setArchivedCount(archives.length);
    } catch (err) {
      console.error("Erreur lors du chargement des archives:", err);
    }
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
    setLoading(true);
    setResult("");
    setValidated(false);
    setElapsed(null);
    setUsedModel(null);
    setIsArchived(false);
    setReportStatus(REPORT_STATUS.IN_PROGRESS);
    const start = Date.now();
    try {
      const text = await generatePersonalizedProject({
        observations,
        structureType: organization?.structure_type ?? "",
        companyName: organization?.name ?? "",
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
    <div
      id="ppa-page"
      className="h-full overflow-y-auto py-6 px-2 md:px-5 md:py-8"
    >
      <div className="mx-auto flex w-full max-w-full flex-col gap-6">
        <form
          id="ppa-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          {/* ── Étape 1 : Contexte ── */}
          <StepCard
            step="1"
            title="Contexte"
            subtitle="Projet personnalisé d'accompagnement"
            accentColor={ACCENT}
          >
            {/* Desktop */}
            <div className="hidden md:flex md:flex-row md:items-center gap-6 text-sm">
              <div className="flex flex-col">
                <p className="text-(--text-muted) text-xs">Professionnel</p>
                <p className="font-semibold text-(--text-primary)">{fullName}</p>
                <p className="text-xs text-(--text-secondary)">{ROLE_LABELS[role] ?? role}</p>
              </div>
              <div className="w-px h-10 bg-(--border)" />
              <div className="flex flex-col">
                <p className="text-(--text-muted) text-xs">Structure</p>
                <p className="font-semibold text-(--text-primary)">{organization?.name ?? "—"}</p>
                <p className="text-xs text-(--text-secondary)">{organization?.structure_type ?? "—"}</p>
              </div>
              <div className="w-px h-10 bg-(--border)" />
              <div className="flex flex-col">
                <p className="text-(--text-muted) text-xs">Date</p>
                <p className="font-semibold text-(--text-primary)">{dateLabel}</p>
              </div>
              <div className="w-px h-10 bg-(--border)" />
              <div className="flex flex-col gap-2">
                <label htmlFor="reference-select" className="text-xs font-medium text-(--text-primary)">Référence :</label>
                <select
                  id="reference-select"
                  value={selectedReferenceId}
                  onChange={(e) => setSelectedReferenceId(e.target.value)}
                  className="rounded-xl border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-4 py-2 text-base focus:outline-none focus:border-(--bleu-fonce) transition-colors w-60"
                >
                  <option value="">Sélectionnez...</option>
                  {references.map((child) => (
                    <option key={child.id} value={child.id}>{formatReferenceName(child)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden flex-col gap-4 text-[10px]">
              <div className="flex flex-row gap-2">
                <div className="flex flex-col flex-1">
                  <p className="text-(--text-muted) font-medium">Professionnel</p>
                  <p className="font-semibold text-(--text-primary)">{fullName}</p>
                  <p className="text-(--text-secondary)">{ROLE_LABELS[role] ?? role}</p>
                </div>
                <div className="w-px bg-(--border)" />
                <div className="flex flex-col flex-1">
                  <p className="text-(--text-muted) font-medium">Structure</p>
                  <p className="font-semibold text-(--text-primary)">{organization?.name ?? "—"}</p>
                  <p className="text-(--text-secondary)">{organization?.structure_type ?? "—"}</p>
                </div>
                <div className="w-px bg-(--border)" />
                <div className="flex flex-col flex-1">
                  <p className="text-(--text-muted) font-medium">Date</p>
                  <p className="font-semibold text-(--text-primary)">{dateLabel}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 pt-2 border-t border-(--border)/50">
                <label htmlFor="reference-select-mobile" className="font-medium text-(--text-primary)">Personne concernée</label>
                <select
                  id="reference-select-mobile"
                  value={selectedReferenceId}
                  onChange={(e) => setSelectedReferenceId(e.target.value)}
                  className="rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-3 py-1.5 focus:outline-none focus:border-(--bleu-fonce) transition-colors w-full"
                >
                  <option value="">Sélectionnez un bénéficiaire…</option>
                  {references.map((child) => (
                    <option key={child.id} value={child.id}>{formatReferenceName(child)}</option>
                  ))}
                </select>
              </div>
            </div>
          </StepCard>

          {/* ── Étape 2 : Observations ── */}
          <StepCard
            step="2"
            title="Observations"
            subtitle="Décrivez librement la situation, les besoins, les objectifs et les modalités d'accompagnement — l'IA structure le PPA"
            accentColor={ACCENT}
            headerAction={
              <div className="md:hidden">
                <TranscriptionInput
                  value={observations}
                  onChange={setObservations}
                  disabled={loading}
                  variant="header-button"
                />
              </div>
            }
          >
            <TranscriptionCard
              value={observations}
              onChange={setObservations}
              placeholder="Décrivez la situation de la personne, ses besoins, ses capacités, les objectifs prioritaires, les modalités d'accompagnement prévues… L'IA se charge du reste."
              rows={8}
              disabled={loading}
            />
            <RgpdNotice message="Vos observations sont anonymisées — aucun nom, prénom ou donnée nominative ne doit être transmis." />
          </StepCard>

          {/* ── Actions ── */}
          <div id="form-actions" className="flex flex-col gap-3">
            <div className="flex flex-row gap-3">
              <Button
                type="submit"
                color={ACCENT}
                size="md"
                disabled={loading || !observations.trim() || !selectedReferenceId}
                className="flex-1 md:flex-none"
              >
                {loading ? "Génération en cours…" : "Générer le PPA"}
              </Button>
              <Button
                color={ACCENT}
                size="md"
                onClick={handleReset}
                className="flex-1 md:hidden"
              >
                Nouveau
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <ModelSelector
                value={selectedModelId}
                onChange={handleModelChange}
              />
              {!loading && !result && (
                <span className="text-xs text-(--text-muted)">Temps estimé : 10–15 s</span>
              )}
              {!loading && elapsed && (
                <span className="text-xs text-(--text-muted)">Généré en {elapsed}s</span>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="hidden md:inline-flex ml-auto text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
              >
                + Nouveau PPA
              </button>
            </div>
          </div>
        </form>

        {/* ── Loading ── */}
        {loading && (
          <div className={`${CARD_CLASS} flex items-center gap-4`}>
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin shrink-0" style={{ borderColor: ACCENT, borderTopColor: "transparent" }} />
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
            id="ppa-result"
            title="Projet personnalisé généré"
            result={result}
            validated={validated}
            onValidatedChange={setValidated}
            onRegenerate={() => handleSubmit({ preventDefault: () => {} })}
            onArchived={handleArchived}
            validationText="Je confirme avoir relu, vérifié et, si besoin, corrigé ce projet personnalisé d'accompagnement. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel."
            generatedByModel={
              usedModel || { id: selectedModelId, name: selectedModelName }
            }
            downloadMeta={{
              type: "PPAMS",
              interventionType: "Projet Personnalisé d'Accompagnement",
              structureType: organization?.structure_type ?? "",
              companyName: organization?.name ?? "",
              educatorName: fullName,
              childName: selectedReferenceId
                ? formatReferenceName(
                    references.find((c) => c.id === selectedReferenceId) || {},
                  )
                : "",
              date: today,
              modelId: usedModel?.id || selectedModelId,
              modelName: usedModel?.name || selectedModelName,
            }}
          />
        )}

        {/* Modal de génération */}
        <GeneratingReportModal
          isOpen={showGeneratingModal}
          message={LOADING_MESSAGES[loadingMessageIndex]}
          onCancel={handleCancelGeneration}
        />
      </div>
    </div>
  );
}

export default PersonalizedProjectPage;
