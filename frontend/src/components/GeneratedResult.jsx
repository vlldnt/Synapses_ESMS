import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  RefreshCw, Pencil, Check, X,
  ClipboardCopy, ClipboardCheck,
  FileDown, Loader2,
  ShieldCheck, LockKeyhole, RotateCcw,
} from 'lucide-react';
import WordPreview from './WordPreview';
import DownloadSuccessModal from './DownloadSuccessModal';
import { downloadDocx, triggerDownload } from '../utils/wordExport';
import { saveToHistory } from '../services/historyService';
import { useCurrentUser } from '../hooks/useCurrentUser';

// ─── Sous-composants ────────────────────────────────────────────────────────

function ActionButton({ onClick, disabled, loading, icon: Icon, loadingIcon: LoadIcon, label, variant, title }) {
  const VARIANTS = {
    ghost:    'border border-(--border) bg-(--bg-primary) text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)',
    blue:     'border border-(--bleu-fonce) bg-(--bleu-fonce) text-white hover:opacity-90',
    green:    'border border-(--vert-fonce) bg-(--vert-fonce) text-white hover:opacity-90',
    orange:   'border border-(--orange) bg-(--orange) text-(--text-primary) hover:opacity-90',
    success:  'border border-emerald-500 bg-emerald-500 text-white cursor-default',
    danger:   'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/40',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
        'transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant] ?? VARIANTS.ghost,
      ].join(' ')}
    >
      {loading && LoadIcon ? <LoadIcon size={13} className="animate-spin" /> : <Icon size={13} />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ValidatedBadge({ onUnvalidate }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold dark:bg-emerald-900/30 dark:text-emerald-400">
      <ShieldCheck size={13} />
      Validé
      <button
        type="button"
        onClick={onUnvalidate}
        title="Annuler la validation"
        className="ml-1 text-emerald-600 hover:text-red-500 transition-colors cursor-pointer"
      >
        <X size={11} />
      </button>
    </span>
  );
}

// ─── Composant principal ────────────────────────────────────────────────────

/**
 * Bloc de résultat IA : aperçu, édition, validation, copie, téléchargement Word.
 *
 * Props :
 *  - result         : texte Markdown initial généré par l'IA
 *  - validated      : bool (état de validation géré par le parent)
 *  - onValidatedChange : (bool) => void
 *  - onRegenerate   : () => void
 *  - validationText : string — mention légale sous la checkbox
 *  - downloadMeta   : { interventionType, structureType, companyName, educatorName, date }
 */
export default function GeneratedResult({
  id,
  title,
  result,
  validated,
  onValidatedChange,
  onRegenerate,
  onArchived,
  validationText,
  generatedByModel,
  downloadMeta = {},
}) {
  const { user } = useCurrentUser();
  // ── État local ─────────────────────────────────────────────────────────
  const [editedText, setEditedText] = useState(result);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText]  = useState(result);   // tampon pendant l'édition
  const [copyState, setCopyState]  = useState('idle');   // idle | copied
  const [dlState, setDlState]      = useState('idle');   // idle | loading | done
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const textareaRef = useRef(null);

  // Sync quand l'IA génère un nouveau résultat (régénération)
  useEffect(() => {
    setEditedText(result);
    setDraftText(result);
    setIsEditing(false);
  }, [result]);

  // Auto-resize textarea en mode édition
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, draftText]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleStartEdit = () => {
    setDraftText(editedText);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setEditedText(draftText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setDraftText(editedText);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedText);
    setCopyState('copied');
    setTimeout(() => setCopyState('idle'), 2000);
  };

  const handleDownload = async (skipArchive = false) => {
    setDlState('loading');

    // Montrer le modal AVANT la conversion
    setShowSuccessModal(true);

    try {
      // Attendre 1 seconde avant de faire la conversion
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Récupérer le type d'intervention détecté par l'IA si disponible
      const detectedType = typeof window !== 'undefined'
        ? sessionStorage.getItem('detectedInterventionType')
        : null;

      const finalInterventionType = (downloadMeta.interventionType && downloadMeta.interventionType !== '—' && downloadMeta.interventionType !== '')
        ? downloadMeta.interventionType
        : (detectedType || 'Intervention');

      const result = await downloadDocx({
        text: editedText,
        ...downloadMeta,
        interventionType: finalInterventionType,
        modelId: downloadMeta.modelId ?? generatedByModel?.id,
        modelName: downloadMeta.modelName ?? generatedByModel?.name,
      });

      // Convertir le blob en base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result.split(',')[1];

          // Sauvegarder aux archives si ce n'est pas depuis le modal
          if (!skipArchive) {
            const reportType = downloadMeta.reportType || downloadMeta.type || 'CRI';

            const archiveData = {
              id: Date.now(),
              status: 'archived',
              filename: result.filename,
              displayName: result.displayName,
              date: result.date,
              interventionType: result.interventionType,
              type: reportType,
              modelId: result.modelId,
              modelName: result.modelName,
              docxBase64: base64String,
              creatorId: user?.id,
              userId: user?.id,
              childName: downloadMeta.childName || '',
              createdAt: new Date().toISOString(),
              created_at: new Date().toISOString(),
            };

            // Sauvegarder en localStorage
            saveToHistory(archiveData);

            onArchived?.();
          }

          // Télécharger le fichier
          triggerDownload(result.blob, result.filename);

          // Fermer le modal et réinitialiser l'état
          setShowSuccessModal(false);
          setDlState('idle');
          resolve();
        };
        reader.readAsDataURL(result.blob);
      });
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      setShowSuccessModal(false);
      setDlState('idle');
    }
  };

  const handleValidate = () => {
    onValidatedChange(true);
    setIsEditing(false);
  };

  const handleUnvalidate = () => {
    onValidatedChange(false);
  };

  const handleRegenerate = () => {
    if (validated) {
      if (!window.confirm('Régénérer effacera le document validé. Continuer ?')) return;
      onValidatedChange(false);
    }
    onRegenerate();
  };

  // ── Rendu ─────────────────────────────────────────────────────────────
  return (
    <div
      id={id}
      className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden"
    >
      {/* ── Barre d'actions ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-(--border) flex-wrap gap-2">
        {/* Titre + badge */}
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm text-(--text-primary)">{title}</span>
          {validated && <ValidatedBadge onUnvalidate={handleUnvalidate} />}
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Régénérer */}
          <ActionButton
            onClick={handleRegenerate}
            icon={RefreshCw}
            label="Régénérer"
            variant="ghost"
            title="Relancer la génération IA"
          />

          {/* Modifier / Sauvegarder / Annuler */}
          {!validated && (
            isEditing ? (
              <>
                <ActionButton
                  onClick={handleCancelEdit}
                  icon={X}
                  label="Annuler"
                  variant="danger"
                  title="Annuler les modifications"
                />
                <ActionButton
                  onClick={handleSaveEdit}
                  icon={Check}
                  label="Sauvegarder"
                  variant="blue"
                  title="Enregistrer les modifications"
                />
              </>
            ) : (
              <ActionButton
                onClick={handleStartEdit}
                icon={Pencil}
                label="Modifier"
                variant="ghost"
                title="Éditer le compte rendu"
              />
            )
          )}

          {/* Séparateur visuel */}
          <div className="w-px h-5 bg-(--border) mx-0.5" />

          {/* Copier */}
          <ActionButton
            onClick={handleCopy}
            icon={copyState === 'copied' ? ClipboardCheck : ClipboardCopy}
            label={copyState === 'copied' ? 'Copié !' : 'Copier'}
            variant={copyState === 'copied' ? 'success' : 'ghost'}
            title="Copier le texte dans le presse-papier"
          />

          {/* Télécharger Word */}
          {validated && (
            <ActionButton
              onClick={() => handleDownload()}
              loading={dlState === 'loading'}
              icon={dlState === 'done' ? Check : FileDown}
              loadingIcon={Loader2}
              label={dlState === 'loading' ? 'Génération…' : dlState === 'done' ? 'Téléchargé !' : 'Word'}
              variant={dlState === 'done' ? 'success' : 'blue'}
              title="Télécharger en format Word (.docx)"
            />
          )}
        </div>
      </div>

      {/* ── Contenu : aperçu ou édition ── */}
      <div
        className={[
          'transition-all duration-200',
          validated ? 'opacity-60 pointer-events-none select-none' : '',
        ].join(' ')}
      >
        {isEditing ? (
          /* Mode édition */
          <div className="p-4 md:p-6 bg-(--bg-secondary)">
            <div className="flex items-center gap-2 mb-3 text-xs text-(--text-muted)">
              <Pencil size={12} />
              Mode édition — modifiez librement le texte ci-dessous
            </div>
            <textarea
              ref={textareaRef}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className={[
                'w-full bg-white dark:bg-[#1a2233] text-(--text-primary)',
                'border border-(--border) rounded-xl p-4 md:p-6',
                'font-mono text-[13px] md:text-[14px] leading-6',
                'outline-none focus:ring-2 focus:ring-(--bleu-fonce)/30',
                'resize-none overflow-hidden min-h-64',
                'shadow-inner',
              ].join(' ')}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              spellCheck={false}
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-(--text-muted) hover:text-red-500 transition-colors cursor-pointer px-3 py-1"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="text-xs font-medium text-(--bleu-fonce) hover:underline cursor-pointer px-3 py-1"
              >
                Sauvegarder les modifications →
              </button>
            </div>
          </div>
        ) : (
          /* Mode aperçu */
          <div className="p-4 md:p-6">
            {validated && (
              <div className="flex items-center gap-2 mb-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <LockKeyhole size={12} />
                Document validé — lecture seule
              </div>
            )}
            <WordPreview text={editedText} />
            {generatedByModel?.id && (
              <p className="mt-4 text-xs text-(--text-muted) italic">
                Genere par modele : <strong>{generatedByModel.name || generatedByModel.id}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Zone de validation ── */}
      <div className="px-5 pb-5 pt-3 border-t border-(--border)">
        {!validated ? (
          /* Pas encore validé */
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-xs text-(--text-secondary) leading-5 flex-1">
              <span className="font-semibold text-(--text-primary)">Validation requise : </span>
              {validationText}
            </p>
            <button
              type="button"
              onClick={handleValidate}
              className={[
                'shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl',
                'text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600',
                'transition-colors duration-150 cursor-pointer shadow-sm',
              ].join(' ')}
            >
              <ShieldCheck size={15} />
              Valider le document
            </button>
          </div>
        ) : (
          /* Document validé */
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 flex items-start gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={14} className="shrink-0 mt-0.5" />
              <span>
                Document validé le{' '}
                <strong>
                  {new Intl.DateTimeFormat('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  }).format(new Date())}
                </strong>
                . Téléchargez le fichier Word pour l'intégrer dans le dossier.
              </span>
            </div>
            <div className="shrink-0 flex items-center gap-1.5">
              <ActionButton
                onClick={() => handleDownload()}
                loading={dlState === 'loading'}
                icon={dlState === 'done' ? Check : FileDown}
                loadingIcon={Loader2}
                label={dlState === 'loading' ? 'Génération…' : dlState === 'done' ? 'Téléchargé !' : 'Télécharger'}
                variant={dlState === 'done' ? 'success' : 'green'}
                title="Télécharger en format Word (.docx)"
              />
              <button
                type="button"
                onClick={handleUnvalidate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-(--text-muted) hover:text-red-500 border border-(--border) hover:border-red-300 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                Annuler la validation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de succès */}
      <DownloadSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
}
