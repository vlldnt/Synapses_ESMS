import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Lock, RefreshCw, ClipboardCopy, FileDown, CircleCheck } from 'lucide-react';
import Input from '../components/Input';
import WordPreview from '../components/WordPreview';
import structureTypes from '../data/structureTypes.json';
import { generateInterventionReport } from '../services/aiService';
import { downloadDocx } from '../utils/wordExport';

const cardClass = 'rounded-2xl border border-(--border) bg-(--bg-primary) p-5 md:p-8 shadow-sm';

function StepCard({ step, title, children }) {
  return (
    <div className={cardClass}>
      <h2 className="flex items-center gap-3 text-base md:text-lg font-semibold text-(--text-primary) mb-5">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0D66D4] text-white text-sm font-bold shrink-0">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function InterventionReport() {
  const user = useSelector((state) => state.auth.user);

  const [structureType, setStructureType] = useState('');
  const [interventionType, setInterventionType] = useState('');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState({
    identification: '',
    contexte: '',
    deroulement: '',
    analyse: '',
    plan: '',
    suivi: '',
    conclusion: '',
  });

  const setNote = (key) => (e) => setNotes((prev) => ({ ...prev, [key]: e.target.value }));

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [validated, setValidated] = useState(false);
  const [elapsed, setElapsed] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setValidated(false);
    setElapsed(null);
    const start = Date.now();
    try {
      const text = await generateInterventionReport({ structureType, interventionType, reference, date, notes, educatorName: user?.name  });
      setResult(text);
      setElapsed(((Date.now() - start) / 1000).toFixed(1));
    } catch (err) {
      setResult(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => navigator.clipboard.writeText(result);

  const handleWordDownload = () =>
    downloadDocx({ text: result, reference, date, structureType, interventionType });

  return (
    <div id="cr-page" className="h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-full flex-col gap-6">

        <form id="cr-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Étape 1 : Contexte ── */}
          <StepCard step="1" title="Contexte de l'intervention">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="cr-type-structure"
                label="Type de structure"
                type="combobox"
                value={structureType}
                onChange={setStructureType}
                placeholder="Rechercher ou sélectionner…"
                categories={structureTypes.categories}
                required
              />
              <Input
                id="cr-type-intervention"
                label="Type d'intervention"
                type="select"
                value={interventionType}
                onChange={setInterventionType}
                placeholder="Choisir..."
                options={['Visite à domicile', 'Entretien individuel', 'Entretien famille', 'Accompagnement extérieur', 'Autre']}
                required
              />
              <Input
                id="cr-reference"
                label="Référence dossier (anonymisé)"
                type="text"
                value={reference}
                onChange={setReference}
                placeholder="Ex : Réf. 2024-047 ou initiales B.L."
                hint="⚠️ Pas de nom complet — utilisez une référence ou des initiales."
              />
              <Input
                id="cr-date"
                label="Date de l'intervention"
                type="date"
                value={date}
                onChange={setDate}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </StepCard>

          {/* ── Étape 2 : Notes brutes ── */}
          <StepCard step="2" title="Vos notes brutes">
            <p className="text-xs text-(--text-muted) mb-4">Ce qui s'est passé (saisie libre)</p>
            <div className="rounded-xl bg-(--bg-secondary) border border-(--border) divide-y divide-(--border)/40 px-4">
              {[
                { key: 'identification', label: "Identification de l'intervention" },
                { key: 'contexte',       label: 'Contexte et objectif' },
                { key: 'deroulement',    label: 'Déroulement' },
                { key: 'analyse',        label: 'Analyse professionnelle' },
                { key: 'plan',           label: "Plan d'actions" },
                { key: 'suivi',          label: 'Suivi et indicateurs' },
                { key: 'conclusion',     label: 'Conclusion' },
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col md:flex-row md:items-start md:gap-2 py-3">
                  <span className="text-xs text-(--text-secondary) shrink-0 mb-1 md:mb-0 md:pt-1">{label} :</span>
                  <textarea
                    value={notes[key]}
                    onChange={setNote(key)}
                    rows={1}
                    className="w-full md:flex-1 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-muted) resize-none overflow-hidden min-w-0"
                    placeholder="Saisissez ici…"
                    onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                  />
                </div>
              ))}
            </div>

            {/* Notice RGPD */}
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-(--bg-secondary) border border-(--border) px-4 py-3">
              <Lock size={16} className="text-(--text-muted) mt-0.5 shrink-0" />
              <p className="text-xs text-(--text-secondary) leading-5">
                <span className="font-semibold text-(--text-primary)">Protection des données : </span>
                Vos notes sont anonymisées automatiquement avant d'être envoyées à l'IA.
                Aucun nom, prénom ou donnée nominative n'est transmis.
              </p>
            </div>
          </StepCard>

          {/* ── Bouton générer ── */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-lg bg-[#0D66D4] hover:bg-[#0B55B8] text-white font-medium text-sm md:text-base transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {loading ? 'Génération en cours…' : '🤖 Générer le compte rendu'}
            </button>
            {!loading && !result && (
              <span className="text-xs text-(--text-muted)">Temps estimé : 5–10 secondes</span>
            )}
            {!loading && elapsed && (
              <span className="text-xs text-(--text-muted)">Généré en {elapsed}s</span>
            )}
          </div>

        </form>

        {/* ── Loading ── */}
        {loading && (
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="w-5 h-5 rounded-full border-2 border-[#0D66D4] border-t-transparent animate-spin shrink-0" />
            <span className="text-sm text-(--text-secondary)">L'IA structure votre compte rendu…</span>
          </div>
        )}

        {/* ── Résultat ── */}
        {result && (
          <div id="cr-result" className={cardClass}>

            {/* Header résultat */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-(--text-primary) font-semibold">
                <CircleCheck size={20} className="text-[#42C4A1]" />
                Compte rendu généré
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit({ preventDefault: () => {} })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-xs text-(--text-secondary) hover:bg-(--bg-tertiary) transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} /> Régénérer
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-xs text-(--text-secondary) hover:bg-(--bg-tertiary) transition-colors cursor-pointer"
                >
                  <ClipboardCopy size={13} /> Copier
                </button>
                <button
                  type="button"
                  onClick={handleWordDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-xs text-(--text-secondary) hover:bg-(--bg-tertiary) transition-colors cursor-pointer"
                >
                  <FileDown size={13} /> Word
                </button>
              </div>
            </div>

            {/* Texte généré — rendu Word */}
            <div id="cr-output">
              <WordPreview text={result} />
            </div>

            {/* Validation obligatoire */}
            <label className="mt-5 flex items-start gap-3 cursor-pointer">
              <input
                id="cr-validation"
                type="checkbox"
                checked={validated}
                onChange={(e) => setValidated(e.target.checked)}
                className="mt-0.5 accent-[#0D66D4] shrink-0"
              />
              <span className="text-xs text-(--text-secondary) leading-5">
                <span className="font-semibold text-(--text-primary)">Validation obligatoire : </span>
                Je confirme avoir relu, vérifié et, si besoin, corrigé ce compte rendu.
                Je reste l'auteur et le responsable de ce document.
                L'IA est un outil d'assistance, non un substitut au jugement professionnel.
              </span>
            </label>

          </div>
        )}

      </div>
    </div>
  );
}

export default InterventionReport;
