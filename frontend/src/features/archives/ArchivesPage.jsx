import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, X, Clock3, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../../components/Button';
import WordPreview from '../../components/WordPreview';
import { getHistory } from '../../services/historyService';
import { authFetch } from '../../services/authServices';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { getEnrichedInfo } from '../../utils/documentEnricher';
import { useDocumentDownload } from '../../hooks/useDocumentDownload';
import DownloadLoadingModal from '../../components/DownloadLoadingModal';
import DownloadToast from '../../components/DownloadToast';
import { formatReportName } from '../../utils/reportNameFormatter';
import {
  getDocTypeLabel,
  getDocColorFromLabel,
} from '../../utils/docTypeBadge';
import { extractPreviewTextFromDocxBase64 } from '../../utils/docxPreview';
import { AGENTS } from '../../constants/agents';

const DRAFT_STORAGE_KEY = 'cr_intervention_draft';

function getDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function ArchivesPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [history, setHistory] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewText, setPreviewText] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [childFilter, setChildFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const previewRef = useRef(null);
  const { handleDownload, isLoading: isDownloading, toast: downloadToast, clearToast } = useDocumentDownload();

  const isAdmin = user?.role === 'admin';


  useEffect(() => {
    if (!user?.id) return;
    const basename = import.meta.env.VITE_BASENAME || '/synapses';
    (async () => {
      try {
        const [archives, orgData] = await Promise.all([
          getHistory(user.id),
          authFetch(`${basename}/api/organizations`).then((r) => r.json()),
        ]);
        setHistory(archives);
        setOrganization(Array.isArray(orgData) ? orgData[0] ?? null : null);
      } catch (err) {
        console.error('Failed to load history:', err);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedEntry) {
        setSelectedEntry(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedEntry]);

  const draft = getDraft();
  const hasDraft = Boolean(
    draft?.transcription?.trim() ||
    draft?.interventionType ||
    draft?.result?.trim(),
  );
  const draftStatus = draft?.result?.trim() ? 'En cours' : 'Brouillon';
  const childOptions = useMemo(() => {
    return Array.from(
      new Set(history.map((entry) => entry.reference_name?.trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [history]);

  const typeOptions = useMemo(() => {
    return Array.from(
      new Set(history.map((entry) => getDocTypeLabel(entry))),
    ).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const matchesChild =
        childFilter === 'all' || entry.reference_name?.trim() === childFilter;
      const matchesType =
        typeFilter === 'all' || getDocTypeLabel(entry) === typeFilter;
      return matchesChild && matchesType;
    });
  }, [history, childFilter, typeFilter]);

  const sortedHistory = useMemo(() => {
    const getEntryTimestamp = (entry) => {
      const rawDate = entry.date || entry.created_at;
      const time = rawDate ? new Date(rawDate).getTime() : 0;
      return Number.isNaN(time) ? 0 : time;
    };

    return [...filteredHistory].sort((a, b) => {
      const comparison = getEntryTimestamp(a) - getEntryTimestamp(b);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredHistory, sortOrder]);

  function findAgentForEntry(entry) {
    const direct = (entry.type || entry.reportType || '')
      .toString()
      .toLowerCase();
    const intervention = (entry.intervention_type || entry.interventionType || '')
      .toString()
      .toLowerCase();

    const byIdOrBadge = AGENTS.find((a) => {
      const id = a.id.toLowerCase();
      const badge = (a.badge || '').toLowerCase();
      if (direct && (direct === id || direct.includes(id))) return true;
      if (
        intervention &&
        (intervention.includes(id) ||
          intervention.includes(id.replace(/-/g, ' ')))
      )
        return true;
      if (direct && direct === badge) return true;
      return false;
    });
    if (byIdOrBadge) return byIdOrBadge;

    if (intervention.includes('ppa')) {
      if (intervention.includes('médico') || intervention.includes('medico')) {
        return AGENTS.find((a) => a.id === 'ppa-medico-social') || null;
      }
      return (
        AGENTS.find((a) => a.id === 'ppa-social') ||
        AGENTS.find((a) => a.id === 'ppa-medico-social') ||
        null
      );
    }

    if (
      intervention.includes('compte') ||
      intervention.includes('intervention') ||
      intervention.includes('compte rendu')
    ) {
      return AGENTS.find((a) => a.id === 'compte-rendu-intervention') || null;
    }

    return null;
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      if (!selectedEntry) {
        setPreviewText('');
        setIsPreviewLoading(false);
        return;
      }

      if (selectedEntry.text?.trim()) {
        setPreviewText(selectedEntry.text);
        setIsPreviewLoading(false);
        return;
      }

      if (!selectedEntry.docx_base_64) {
        setPreviewText('');
        setIsPreviewLoading(false);
        return;
      }

      setIsPreviewLoading(true);
      const extracted = await extractPreviewTextFromDocxBase64(
        selectedEntry.docx_base_64,
      );
      if (!cancelled) {
        setPreviewText(extracted);
        setIsPreviewLoading(false);
      }
    }

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [selectedEntry]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleteConfirm !== 'supprimer') return;
    setIsDeleting(true);
    const basename = import.meta.env.VITE_BASENAME || '/synapses';
    try {
      const res = await authFetch(`${basename}/api/archives/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setHistory((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      if (selectedEntry?.id === deleteTarget.id) setSelectedEntry(null);
    } catch (err) {
      console.error('Erreur suppression archive:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
      setDeleteConfirm('');
    }
  };


  return (
    <>
    <DownloadLoadingModal isOpen={isDownloading} />
    <DownloadToast filename={downloadToast} onClose={clearToast} />
    <div className='h-full overflow-y-auto py-6 px-2 md:px-5 md:py-8'>
      <div className='mx-auto w-full max-w-5xl flex flex-col gap-5'>
        <div>
          <h1 className='text-xl md:text-2xl font-semibold text-(--text-primary)'>
            Documents archivés
          </h1>
        </div>

        {hasDraft && (
          <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden'>
            <div className='px-5 py-3 border-b border-(--border)'>
              <h2 className='text-sm font-semibold text-(--text-primary)'>
                Rapport en cours
              </h2>
            </div>
            <div className='px-5 py-4 flex items-center gap-3'>
              <span className='w-9 h-9 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex items-center justify-center shrink-0'>
                <Clock3 size={16} />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-(--text-primary) truncate'>
                  {draft?.structureType && draft?.educatorName
                    ? formatReportName({
                        structureType: draft.structureType,
                        educatorName: draft.educatorName,
                        date: new Date().toISOString().slice(0, 10),
                      })
                    : draft?.interventionType || 'Compte rendu en preparation'}
                </p>
                <p className='text-xs text-(--text-muted) truncate'>
                  {draft?.interventionType} · Texte deja saisi conserve
                </p>
              </div>
              <span className='text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'>
                {draftStatus}
              </span>
              <Button
                color='blue'
                size='sm'
                onClick={() => navigate('/compte_rendu_intervention')}
              >
                Reprendre
              </Button>
            </div>
          </div>
        )}

        <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden'>
          <div className='px-3 py-2 md:px-5 md:py-4 border-b border-(--border) bg-(--bg-primary)'>
            <div className='grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:grid-cols-3 gap-2 md:gap-3'>
              <div className='flex flex-col gap-1'>
                <label
                  htmlFor='archive-filter-child'
                  className='text-[11px] md:text-xs font-medium text-(--text-primary)'
                >
                  Enfant
                </label>
                <select
                  id='archive-filter-child'
                  value={childFilter}
                  onChange={(e) => setChildFilter(e.target.value)}
                  className='w-full rounded-md md:rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm focus:outline-none'
                >
                  <option value='all'>Tous</option>
                  {childOptions.map((childName) => (
                    <option key={childName} value={childName}>
                      {childName}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex flex-col gap-1'>
                <label
                  htmlFor='archive-filter-type'
                  className='text-[11px] md:text-xs font-medium text-(--text-primary)'
                >
                  Type
                </label>
                <select
                  id='archive-filter-type'
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className='w-full rounded-md md:rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm focus:outline-none'
                >
                  <option value='all'>Tous</option>
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex flex-col gap-1 items-end'>
                <span className='text-[11px] md:text-xs font-medium text-(--text-primary) text-right'>
                  Date
                </span>
                <button
                  type='button'
                  onClick={() =>
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  className={`h-7.5 md:h-8.5 px-1 cursor-pointer text-(--text-primary) transition-transform duration-300 ${
                    sortOrder === 'desc' ? 'rotate-180' : ''
                  }`}
                  aria-label={`Inverser le tri par date (actuel: ${sortOrder === 'asc' ? 'croissant' : 'décroissant'})`}
                >
                  <span className='flex items-center leading-none text-lg md:text-xl'>
                    ↑
                  </span>
                </button>
              </div>
            </div>
          </div>

          {sortedHistory.length === 0 ? (
            <div className='px-6 py-12 text-center text-sm text-(--text-muted)'>
              {history.length === 0
                ? 'Aucun document archive.'
                : 'Aucun document ne correspond aux filtres sélectionnés.'}
            </div>
          ) : (
            <div className='divide-y divide-(--border)'>
              {sortedHistory.map((entry) => {
                const agentForEntry = findAgentForEntry(entry);
                const typeLabel = agentForEntry
                  ? agentForEntry.badge
                  : getDocTypeLabel(entry);
                const docColor = agentForEntry
                  ? agentForEntry.color
                  : getDocColorFromLabel(typeLabel);
                const enriched = getEnrichedInfo(entry, [], organization ? [organization] : []);
                return (
                  <div key={entry.id} className='flex items-center hover:bg-(--bg-secondary) transition-colors'>
                    <button
                      type='button'
                      onClick={() => setSelectedEntry(entry)}
                      className='flex-1 text-left px-5 py-4 flex items-center gap-3 cursor-pointer min-w-0'
                    >
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-semibold text-(--text-primary) truncate'>
                          {formatReportName(entry)}
                        </p>
                        <p className='text-xs text-(--text-muted) truncate'>
                          {entry.intervention_type}
                        </p>
                      </div>
                      <span
                        className='inline-flex items-center justify-center px-2.5 h-7 rounded-full text-[11px] font-bold shrink-0 min-w-11 text-white'
                        style={{ background: docColor }}
                      >
                        {typeLabel}
                      </span>
                      <div className='flex items-center gap-3 shrink-0'>
                        <div className='flex flex-col items-end gap-0.5'>
                          {entry.reference_name && (
                            <span className='text-xs text-(--text-muted)/70 font-medium'>
                              {entry.reference_name}
                            </span>
                          )}
                          {(entry.date || entry.created_at) && (
                            <span className='text-[11px] text-(--text-muted)/50'>
                              {new Intl.DateTimeFormat('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }).format(new Date(entry.date || entry.created_at))}
                            </span>
                          )}
                        </div>
                        <span className='text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'>
                          Archive
                        </span>
                      </div>
                    </button>
                    {isAdmin && (
                      <button
                        type='button'
                        onClick={() => { setDeleteTarget(entry); setDeleteConfirm(''); }}
                        className='mr-4 p-1.5 rounded-md text-(--text-muted) hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors shrink-0'
                        title='Supprimer'
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedEntry && (
        <div
          className='fixed inset-0 z-90 bg-black/55 backdrop-blur-[1px] p-3 md:p-6'
          onClick={(e) =>
            e.target === e.currentTarget && setSelectedEntry(null)
          }
        >
          <div className='mx-auto w-full max-w-5xl h-full flex flex-col rounded-2xl border border-(--border) bg-(--bg-primary) shadow-2xl overflow-hidden'>
            <div className='px-4 py-3 border-b border-(--border) flex items-center gap-3'>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-(--text-primary) truncate'>
                  {formatReportName(selectedEntry)}
                </p>
                <p className='text-xs text-(--text-muted) truncate'>
                  Apercu en lecture seule · telechargement uniquement
                </p>
              </div>
              <button
                type='button'
                onClick={() => handleDownload('word', selectedEntry)}
                disabled={isDownloading || !selectedEntry.docx_base_64}
                className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium disabled:opacity-50 cursor-pointer transition-opacity shrink-0'
                style={{ background: 'linear-gradient(135deg, #0B46DB, #3093F1)' }}
              >
                <Download size={12} />
                Word
              </button>
              <button
                type='button'
                onClick={() => handleDownload('pdf', selectedEntry, previewRef.current)}
                disabled={isDownloading || !selectedEntry.docx_base_64}
                className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium disabled:opacity-50 cursor-pointer transition-opacity shrink-0'
                style={{ background: '#EA0E00' }}
              >
                <Download size={12} />
                PDF
              </button>
              <button
                type='button'
                onClick={() => setSelectedEntry(null)}
                className='w-8 h-8 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) flex items-center justify-center cursor-pointer'
                aria-label='Fermer'
              >
                <X size={15} />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto p-4 md:p-6 bg-(--bg-secondary)'>
              <div ref={previewRef} className='rounded-xl border border-(--border) bg-(--bg-primary) p-4 md:p-6'>
                {isPreviewLoading ? (
                  <p className='text-(--text-muted)'>
                    Chargement de l'aperçu du document...
                  </p>
                ) : previewText ? (
                  <WordPreview text={previewText} />
                ) : (
                  <p className='text-(--text-muted)'>
                    Aucun contenu à afficher
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      {deleteTarget && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
          <div className='w-full max-w-md bg-(--bg-primary) rounded-2xl shadow-2xl border border-(--border) overflow-hidden'>
            <div className='px-5 py-4 border-b border-(--border) flex items-center gap-2'>
              <AlertTriangle size={16} className='text-red-500 shrink-0' />
              <h2 className='text-sm font-semibold text-(--text-primary)'>Supprimer l'archive</h2>
            </div>
            <div className='p-5 flex flex-col gap-4'>
              <p className='text-sm text-(--text-muted)'>
                Vous êtes sur le point de supprimer définitivement le document
                {' '}<span className='font-medium text-(--text-primary)'>{formatReportName(deleteTarget)}</span>.
              </p>
              <p className='text-xs font-semibold text-red-500'>
                ⚠ Cette action est irréversible. Le document et son archive seront supprimés.
              </p>
              <div className='flex flex-col gap-1.5'>
                <label className='text-xs text-(--text-muted)'>
                  Tapez <span className='font-mono font-bold text-(--text-primary)'>supprimer</span> pour confirmer
                </label>
                <input
                  type='text'
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && deleteConfirm === 'supprimer' && !isDeleting && handleDeleteConfirm()}
                  placeholder='supprimer'
                  className='w-full px-3 py-2 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border) text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40'
                  autoFocus
                />
              </div>
              <div className='flex gap-2 justify-end'>
                <button
                  type='button'
                  onClick={() => { setDeleteTarget(null); setDeleteConfirm(''); }}
                  className='px-4 py-2 rounded-lg border border-(--border) text-sm text-(--text-secondary) hover:bg-(--bg-secondary) cursor-pointer transition-colors'
                >
                  Annuler
                </button>
                <button
                  type='button'
                  disabled={deleteConfirm !== 'supprimer' || isDeleting}
                  onClick={handleDeleteConfirm}
                  className='px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors'
                >
                  {isDeleting ? 'Suppression…' : 'Supprimer définitivement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {downloadToast && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border) shadow-lg text-sm text-(--text-primary) flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200'>
          <span className='w-2 h-2 rounded-full bg-emerald-500 shrink-0' />
          {downloadToast}
        </div>
      )}
    </>
  );
}

export default ArchivesPage;
