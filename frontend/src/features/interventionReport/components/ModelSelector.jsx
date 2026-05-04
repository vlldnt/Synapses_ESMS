import { useState, useEffect, useRef } from 'react';
import { Cpu, ChevronDown, Search, X } from 'lucide-react';
import { useModels } from '../../../hooks/useModels';
import { DEFAULT_MODEL } from '../../../services/aiService';

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
          'border border-(--border) bg-(--bg-primary) text-(--text-secondary)',
          'hover:bg-(--bg-tertiary) transition-colors cursor-pointer',
          'max-w-55',
        ].join(' ')}
        title="Changer de modèle IA"
      >
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
            <span className="text-[10px] text-(--text-muted) truncate font-mono max-w-45">
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

export default ModelSelector;
