import { useState, useEffect } from "react";
import Button from "../../components/Button";
import RgpdNotice from "../../components/RgpdNotice";
import GeneratedResult from "../../components/GeneratedResult";
import GeneratingReportModal from "../../components/GeneratingReportModal";
import TranscriptionInput from "../../components/TranscriptionInput.jsx";
import TranscriptionCard from "../../components/TranscriptionCard";
import StepCard from "../../components/StepCard";
import {
  generateInterventionReport,
  DEFAULT_MODEL,
} from "../../services/aiService";
import {
  getReferences,
  formatReferenceName,
} from "../../services/referenceService";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useSelector } from "react-redux";
import { getHistory } from "../../services/historyService";
import { getOrgUsers } from "../../services/userService";
import ModelSelector from "./components/ModelSelector";
import {
  STORAGE_KEY,
  LOADING_MESSAGES,
  REPORT_STATUS,
} from "../../constants/intervention";
import { CARD_CLASS, ROLE_LABELS } from "../../constants/shared";

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

function InterventionReportPage() {
  const { fullName, organization, user } = useCurrentUser();
  const role = useSelector((state) => state.role.role);
  const draft = loadDraft();

  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const [interventionType, setInterventionType] = useState(
    draft.interventionType || "",
  );
  const [selectedReferenceId, setSelectedChildId] = useState(
    draft.selectedReferenceId || "",
  );
  const [references, setReferences] = useState([]);
  const [transcription, setTranscription] = useState(draft.transcription || "");
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
        interventionType: draft.interventionType,
        transcription: draft.transcription,
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
  const [orgUsers, setOrgUsers] = useState([]);
  const [selectedEducatorId, setSelectedEducatorId] = useState(
    draft.selectedEducatorId || user?.id,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "admin") {
          const users = await getOrgUsers();
          setOrgUsers(users);
          if (!selectedEducatorId) {
            setSelectedEducatorId(user?.id);
          }
        }

        const children = await getReferences();
        setReferences(children);

        const educatorId = role === "admin" ? selectedEducatorId : user?.id;
        const archives = await getHistory(educatorId);
        setArchivedCount(archives.length);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
      }
    };
    fetchData();
  }, [user?.id, role, selectedEducatorId]);

  const handleModelChange = (model) => {
    setSelectedModelId(model.id);
    setSelectedModelName(
      model.name?.replace(/^[^:]+:\s*/, "") ??
        model.id.split("/").pop() ??
        model.id,
    );
  };

  useEffect(() => {
    const nextStatus = inferStatus({
      interventionType,
      transcription,
      result,
      isArchived,
    });
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
        structureType: organization?.type ?? "",
        childName: childName,
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
        "Commencer un nouveau rapport ? Le brouillon sera effacé.",
      )
    )
      return;
    localStorage.removeItem(STORAGE_KEY);
    setInterventionType("");
    setSelectedChildId("");
    setTranscription("");
    setResult("");
    setValidated(false);
    setElapsed(null);
    setUsedModel(null);
    setIsArchived(false);
    setReportStatus(REPORT_STATUS.DRAFT);
  };

  const handleArchived = async () => {
    localStorage.removeItem(STORAGE_KEY);

    setInterventionType("");
    setSelectedChildId("");
    setTranscription("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transcription.trim()) return;
    setLoading(true);
    setResult("");
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
        structureType: organization?.type ?? "",
        companyName: organization?.name ?? "",
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

  if (role !== "agent" && role !== "admin") {
    return (
      <div className="h-full flex items-center justify-center py-6 px-2 md:px-5 md:py-8">
        <div className="text-center">
          <p className="text-(--text-muted) text-lg">Aucun agent disponible pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="cr-page"
      className="h-full overflow-y-auto py-6 px-2 md:px-5 md:py-8"
    >
      <div className="mx-auto flex w-full max-w-full flex-col gap-6">
        <form
          id="cr-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          {/* ── Étape 1 : Contexte ── */}
          <StepCard
            step="1"
            title="Contexte"
            subtitle="Compte rendu d'intervention"
          >
            {/* Desktop */}
            <div className="hidden md:flex md:flex-row md:items-center gap-6 text-sm overflow-x-auto">
              {role === "admin" && orgUsers.length > 0 ? (
                <div className="flex flex-col">
                  <label
                    htmlFor="educator-select"
                    className="text-xs font-medium text-(--text-muted)"
                  >
                    Professionnel
                  </label>
                  <select
                    id="educator-select"
                    value={selectedEducatorId}
                    onChange={(e) => setSelectedEducatorId(e.target.value)}
                    className="rounded-xl border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-4 py-2 text-base focus:outline-none focus:border-(--bleu-fonce) transition-colors"
                  >
                    {orgUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col">
                  <p className="text-(--text-muted) text-xs">Professionnel</p>
                  <p className="font-semibold text-(--text-primary)">
                    {fullName}
                  </p>
                  <p className="text-xs text-(--text-secondary)">
                    {ROLE_LABELS[role] ?? role}
                  </p>
                </div>
              )}
              <div className="w-px h-10 bg-(--border)" />
              <div className="flex flex-col">
                <p className="text-(--text-muted) text-xs">Structure</p>
                <p className="font-semibold text-(--text-primary)">
                  {organization?.name ?? "—"}
                </p>
                <p className="text-xs text-(--text-secondary)">
                  {organization?.type ?? "—"}
                </p>
              </div>
              <div className="w-px h-10 bg-(--border)" />
              <div className="flex flex-col">
                <p className="text-(--text-muted) text-xs">Date</p>
                <p className="font-semibold text-(--text-primary)">
                  {dateLabel}
                </p>
              </div>
              <div className="w-px h-10 bg-(--border)" />
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="reference-select"
                  className="text-xs font-medium text-(--text-primary)"
                >
                  Référence:{" "}
                </label>
                <select
                  id="reference-select"
                  value={selectedReferenceId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="rounded-xl border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-4 py-2 text-base focus:outline-none focus:border-(--bleu-fonce) transition-colors w-60"
                >
                  <option value="">Sélectionnez un enfant…</option>
                  {references.map((child) => (
                    <option key={child.id} value={child.id}>
                      {formatReferenceName(child)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden flex-col gap-4 text-[10px]">
              <div className="flex flex-row gap-2">
                {role === "admin" && orgUsers.length > 0 ? (
                  <div className="flex flex-col flex-1">
                    <label
                      htmlFor="educator-select-mobile"
                      className="font-medium text-(--text-muted)"
                    >
                      Professionnel
                    </label>
                    <select
                      id="educator-select-mobile"
                      value={selectedEducatorId}
                      onChange={(e) => setSelectedEducatorId(e.target.value)}
                      className="rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-2 py-1 focus:outline-none focus:border-(--bleu-fonce) transition-colors"
                    >
                      {orgUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.first_name} {u.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex flex-col flex-1">
                    <p className="text-(--text-muted) font-medium">
                      Professionnel
                    </p>
                    <p className="font-semibold text-(--text-primary)">
                      {fullName}
                    </p>
                    <p className="text-(--text-secondary)">
                      {ROLE_LABELS[role] ?? role}
                    </p>
                  </div>
                )}
                <div className="w-px bg-(--border)" />
                <div className="flex flex-col flex-1">
                  <p className="text-(--text-muted) font-medium">Structure</p>
                  <p className="font-semibold text-(--text-primary)">
                    {organization?.name ?? "—"}
                  </p>
                  <p className="text-(--text-secondary)">
                    {organization?.type ?? "—"}
                  </p>
                </div>
                <div className="w-px bg-(--border)" />
                <div className="flex flex-col flex-1">
                  <p className="text-(--text-muted) font-medium">Date</p>
                  <p className="font-semibold text-(--text-primary)">
                    {dateLabel}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1 pt-2 border-t border-(--border)/50">
                <label
                  htmlFor="reference-select"
                  className="font-medium text-(--text-primary)"
                >
                  Enfant concerné
                </label>
                <select
                  id="reference-select"
                  value={selectedReferenceId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-3 py-1.5 focus:outline-none focus:border-(--bleu-fonce) transition-colors w-full"
                >
                  <option value="">Sélectionnez un enfant…</option>
                  {references.map((child) => (
                    <option key={child.id} value={child.id}>
                      {formatReferenceName(child)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </StepCard>

          {/* ── Étape 2 : Transcription ── */}
          <StepCard
            step="2"
            title="Transcription"
            subtitle="Dictez ou saisissez vos observations — l'IA détermine le type et structure le compte rendu"
            headerAction={
              <div className="md:hidden">
                <TranscriptionInput
                  value={transcription}
                  onChange={setTranscription}
                  disabled={loading}
                  variant="header-button"
                />
              </div>
            }
          >
            <TranscriptionCard
              value={transcription}
              onChange={setTranscription}
              placeholder="Dictez ou saisissez vos observations, le déroulement, les éléments d'analyse, les suites prévues… L'IA se charge du reste."
              rows={8}
              disabled={loading}
            />
            <RgpdNotice message="Vos notes sont anonymisées aucun nom, prénom ou donnée nominative ne doit être transmis." />
          </StepCard>

          {/* ── Actions ── */}
          <div id="form-actions" className="flex flex-col gap-3">
            <div className="flex flex-row gap-3">
              <Button
                type="submit"
                color="blue"
                size="md"
                disabled={loading || !transcription.trim()}
                className="flex-1 md:flex-none"
              >
                {loading ? "Génération en cours…" : "Générer le compte rendu"}
              </Button>
              <Button
                color="green"
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
                <span className="text-xs text-(--text-muted)">
                  Temps estimé : 5–10 s
                </span>
              )}
              {!loading && elapsed && (
                <span className="text-xs text-(--text-muted)">
                  Généré en {elapsed}s
                </span>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="hidden md:inline-flex ml-auto text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
              >
                + Nouveau rapport
              </button>
            </div>
          </div>
        </form>

        {/* ── Loading ── */}
        {loading && (
          <div className={`${CARD_CLASS} flex items-center gap-4`}>
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
            generatedByModel={
              usedModel || { id: selectedModelId, name: selectedModelName }
            }
            downloadMeta={{
              type: "CRI",
              interventionType,
              structureType: organization?.type ?? "",
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
        />
      </div>
    </div>
  );
}

export default InterventionReportPage;
