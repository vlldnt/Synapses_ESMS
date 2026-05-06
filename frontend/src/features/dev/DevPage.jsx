import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Save, AlertCircle, CheckCircle, Loader, ChevronDown } from 'lucide-react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { authFetch } from '../../services/authServices';
import { DEFAULT_MODEL, resetPromptsCache } from '../../services/aiService';
import { useModels } from '../../hooks/useModels';
import { AGENTS } from '../../constants/agents';

const DEV_USER_IDS = new Set([
  '09eca25d-d955-4136-93f2-4467f2df37eb',
  '3cc14d1c-591d-468b-bad4-bfa0e79b25f4',
  '1c38aaee-4a20-43b3-bb92-92cd4f898dc1',
  'b6f01e00-b5fc-4ad8-98fc-f1dda88f9edf',
]);

function isDevUser(user, role) {
  return (
    DEV_USER_IDS.has(user?.id) &&
    role === 'admin' &&
    user?.job === 'Administrateur'
  );
}

const basename = import.meta.env.VITE_BASENAME || '/synapses';
const API_URL = `${basename}/api`;

const PROMPT_TO_ROUTE = {
  cr_intervention:        '/compte_rendu_intervention',
  ppa_medico_social:      '/projet_personnalise_medico_social',
  ppa_social:             '/projet_personnalise_social',
  ecrit_educatif:         '/ecrit_educatif',
  bilan_evaluation:       '/bilan_evaluation',
  compte_rendu_reunion:   '/compte_rendu_reunion',
  veille_professionnelle: '/veille_professionnelle',
  reporting_mensuel:      '/reporting_mensuel',
  rapport_activite:       '/rapport_activite',
  bilan_activite:         '/bilan_activite',
  projet_etablissement:   '/projet_etablissement',
  projet_service:         '/projet_service',
};

const AGENT_BY_ROUTE = Object.fromEntries(AGENTS.filter((a) => a.to).map((a) => [a.to, a]));

function getAgentForPrompt(promptName) {
  const route = PROMPT_TO_ROUTE[promptName];
  return AGENT_BY_ROUTE[route] ?? { badge: promptName, color: '#6b7280', title: promptName };
}

export default function DevPage() {
  const { user } = useCurrentUser();
  const role = useSelector((state) => state.role.role);
  if (!isDevUser(user, role)) return <Navigate to="/" replace />;
  return <DevEditor />;
}

function DevEditor() {
  const [prompts, setPrompts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState('');
  const [draftModel, setDraftModel] = useState(DEFAULT_MODEL);
  const [status, setStatus] = useState('idle');
  const { models } = useModels();
  const mistralModels = models.filter((m) => m.id.startsWith('mistralai/'));

  const isDirty = selected && (
    draft !== selected.content ||
    draftModel !== (selected.model ?? DEFAULT_MODEL)
  );

  useEffect(() => {
    authFetch(`${API_URL}/prompts`)
      .then((r) => r.json())
      .then((data) => {
        setPrompts(data);
        if (data.length > 0) {
          setSelected(data[0]);
          setDraft(data[0].content);
          setDraftModel(data[0].model ?? DEFAULT_MODEL);
        }
      })
      .catch(console.error);
  }, []);

  const handleSelect = useCallback((p) => {
    setSelected(p);
    setDraft(p.content);
    setDraftModel(p.model ?? DEFAULT_MODEL);
    setStatus('idle');
  }, []);

  const handleSave = useCallback(async () => {
    if (!selected || !isDirty) return;
    setStatus('saving');
    try {
      const res = await authFetch(`${API_URL}/prompts/${selected.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft, model: draftModel }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPrompts((prev) => prev.map((p) => (p.name === updated.name ? updated : p)));
      setSelected(updated);
      resetPromptsCache();
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
    }
  }, [selected, draft, isDirty]);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSave]);

  const meta = selected ? getAgentForPrompt(selected.name) : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-(--bg-secondary) overflow-hidden">

      {/* Onglets horizontaux */}
      <div className="overflow-x-auto border-b border-(--border) bg-(--bg-primary) shrink-0">
        <div className="flex min-w-max">
          {prompts.map((p) => {
            const m = getAgentForPrompt(p.name);
            const isActive = selected?.name === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelect(p)}
                className="px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer"
                style={{
                  color: m.color,
                  borderBottomColor: isActive ? m.color : 'transparent',
                  backgroundColor: isActive ? `${m.color}18` : 'transparent',
                }}
              >
                {m.badge}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      {selected && (
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-(--border) bg-(--bg-primary) shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center justify-center px-2 h-5 rounded-full text-[10px] font-bold text-white shrink-0"
              style={{ background: meta.color }}
            >
              {meta.badge}
            </span>
            <div>
              <div className="text-xs font-semibold text-(--text-primary)">{meta.title}</div>
              <div className="text-[10px] text-(--text-muted) font-mono">{selected.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && <span className="text-[10px] text-amber-500">● non sauvegardé</span>}
            <StatusBadge status={status} />
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || status === 'saving'}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isDirty && status !== 'saving'
                  ? 'text-white hover:opacity-90 cursor-pointer'
                  : 'bg-(--bg-tertiary) text-(--text-muted) cursor-not-allowed',
              ].join(' ')}
              style={isDirty && status !== 'saving' ? { background: meta.color } : {}}
            >
              <Save size={12} />
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* Sélecteur de modèle par prompt */}
      {selected && (
        <div className="flex items-center gap-2 px-5 py-1.5 border-b border-(--border) bg-(--bg-secondary) shrink-0">
          <span className="text-[10px] text-(--text-muted) shrink-0">Modèle :</span>
          <div className="relative">
            <select
              value={draftModel}
              onChange={(e) => {
                setDraftModel(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              className="appearance-none text-[10px] font-mono bg-(--bg-primary) border border-(--border) rounded px-2 py-0.5 pr-5 text-(--text-primary) cursor-pointer outline-none focus:border-(--bleu-fonce)"
            >
              {mistralModels.length === 0 && (
                <option value={draftModel}>{draftModel}</option>
              )}
              {mistralModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name?.replace(/^[^:]+:\s*/, '') ?? m.id}
                </option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
          </div>
          {draftModel !== DEFAULT_MODEL && (
            <button
              type="button"
              onClick={() => setDraftModel(DEFAULT_MODEL)}
              className="text-[10px] text-(--bleu-fonce) hover:underline cursor-pointer"
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* Textarea */}
      {selected ? (
        <textarea
          className="flex-1 w-full resize-none p-5 font-mono bg-(--bg-secondary) text-(--text-primary) outline-none border-none focus:ring-0"
          style={{ fontSize: '11px', lineHeight: '1.4' }}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          spellCheck={false}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-(--text-muted) text-xs">
          Sélectionne un prompt
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'saving') return <Loader size={13} className="text-(--bleu-fonce) animate-spin" />;
  if (status === 'saved') return <CheckCircle size={13} className="text-green-500" />;
  if (status === 'error')
    return (
      <span className="flex items-center gap-1 text-[10px] text-red-500">
        <AlertCircle size={12} /> Erreur
      </span>
    );
  return null;
}
