import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, X, Clock3 } from 'lucide-react';
import Button from '../components/Button';
import WordPreview from '../components/WordPreview';
import { getHistory } from '../services/historyService';
import { downloadDocx } from '../utils/wordExport';

const DRAFT_STORAGE_KEY = 'cr_intervention_draft';

function getDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function History() {
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const history = useMemo(() => getHistory(), []);
  const draft = useMemo(() => getDraft(), []);
  const hasDraft = Boolean(draft?.transcription?.trim() || draft?.interventionType || draft?.result?.trim());
  const draftStatus = draft?.result?.trim() ? 'En cours' : 'Brouillon';

  const handleDownload = async () => {
    if (!selectedEntry) return;
    setIsDownloading(true);
    try {
      await downloadDocx({
        text: selectedEntry.text,
        date: selectedEntry.date,
        interventionType: selectedEntry.interventionType,
        structureType: selectedEntry.structureType,
        companyName: selectedEntry.companyName,
        educatorName: selectedEntry.educatorName,
        modelId: selectedEntry.modelId,
        modelName: selectedEntry.modelName,
        addToHistory: false,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto py-6 px-2 md:px-5 md:py-8">
      <div className="mx-auto w-full max-w-5xl flex flex-col gap-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-(--text-primary)">Historique archive</h1>
          <p className="mt-1 text-sm text-(--text-muted)">
            Documents charges depuis un JSON simule (lecture seule).
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-(--border)">
            <h2 className="text-sm font-semibold text-(--text-primary)">Rapport en cours</h2>
          </div>
          {!hasDraft ? (
            <div className="px-6 py-8 text-sm text-(--text-muted)">Aucun brouillon disponible.</div>
          ) : (
            <div className="px-5 py-4 flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Clock3 size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-(--text-primary) truncate">
                  {draft?.interventionType || 'Compte rendu en preparation'}
                </p>
                <p className="text-xs text-(--text-muted) truncate">
                  Texte deja saisi conserve · reprise possible sans perte
                </p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {draftStatus}
              </span>
              <Button
                color="blue"
                size="sm"
                onClick={() => navigate('/agents/compte-rendu')}
              >
                Reprendre
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-(--text-muted)">
              Aucun document archive.
            </div>
          ) : (
            <div className="divide-y divide-(--border)">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedEntry(entry)}
                  className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-(--bg-secondary) transition-colors cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-xl bg-(--bleu-fonce)/10 text-(--bleu-fonce) flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-(--text-primary) truncate">
                      {entry.interventionType || 'Compte rendu'}
                    </p>
                    <p className="text-xs text-(--text-muted) truncate">
                      {entry.companyName} · {entry.structureType} · {new Intl.DateTimeFormat('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      }).format(new Date(entry.date || entry.createdAt))}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Archive
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 z-90 bg-black/55 backdrop-blur-[1px] p-3 md:p-6">
          <div className="mx-auto w-full max-w-5xl h-full flex flex-col rounded-2xl border border-(--border) bg-(--bg-primary) shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-(--border) flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-(--text-primary) truncate">
                  {selectedEntry.filename}
                </p>
                <p className="text-xs text-(--text-muted) truncate">
                  Apercu en lecture seule · telechargement uniquement
                </p>
              </div>
              <Button
                color="blue"
                size="sm"
                icon={Download}
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? 'Generation...' : 'Telecharger'}
              </Button>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) flex items-center justify-center cursor-pointer"
                aria-label="Fermer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-(--bg-secondary)">
              <div className="rounded-xl border border-(--border) bg-(--bg-primary) p-4 md:p-6">
                <WordPreview text={selectedEntry.text} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
