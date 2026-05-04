import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, X, Clock3 } from 'lucide-react';
import Button from '../../components/Button';
import WordPreview from '../../components/WordPreview';
import { getHistory } from '../../services/historyService';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { getEnrichedInfo } from '../../utils/documentEnricher';
import { downloadDocx, triggerDownload } from '../../utils/wordExport';
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewText, setPreviewText] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [childFilter, setChildFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    (async () => {
      try {
        const basename = import.meta.env.VITE_BASENAME || '/synapses';
        const [archives, usersData, orgsData] = await Promise.all([
          getHistory(user?.id),
          fetch(`${basename}/api/users`).then((r) => r.json()),
          fetch(`${basename}/api/organizations`).then((r) => r.json()),
        ]);
        setHistory(archives);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setOrganizations(Array.isArray(orgsData) ? orgsData : []);
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

  const handleDownload = async () => {
    if (!selectedEntry || !selectedEntry.docx_base_64) return;
    setIsDownloading(true);
    try {
      const binaryString = atob(selectedEntry.docx_base_64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      triggerDownload(blob, selectedEntry.filename);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
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
                const enriched = getEnrichedInfo(entry, users, organizations);
                return (
                  <button
                    key={entry.id}
                    type='button'
                    onClick={() => setSelectedEntry(entry)}
                    className='w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-(--bg-secondary) transition-colors cursor-pointer'
                  >
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-semibold text-(--text-primary) truncate'>
                        {formatReportName(entry)}
                      </p>
                      <p className='text-xs text-(--text-muted) truncate'>
                        {entry.intervention_type} · {enriched.companyName}
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
                            }).format(
                              new Date(
                                entry.date || entry.created_at,
                              ),
                            )}
                          </span>
                        )}
                      </div>
                      <span className='text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'>
                        Archive
                      </span>
                    </div>
                  </button>
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
              <Button
                color='blue'
                size='sm'
                icon={Download}
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? 'Generation...' : 'Telecharger'}
              </Button>
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
              <div className='rounded-xl border border-(--border) bg-(--bg-primary) p-4 md:p-6'>
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
  );
}

export default ArchivesPage;
