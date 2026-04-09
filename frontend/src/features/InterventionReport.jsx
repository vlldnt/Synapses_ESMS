import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Lock,
  RefreshCw,
  ClipboardCopy,
  FileDown,
  CircleCheck,
  FilePlus,
} from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import WordPreview from '../components/WordPreview';
import structureTypes from '../data/structureTypes.json';
import { generateInterventionReport } from '../services/aiService';
import { downloadDocx } from '../utils/wordExport';

const cardClass =
  'rounded-2xl border border-(--border) bg-(--bg-primary) p-5 md:p-8 shadow-sm';

const NOTE_FIELDS = [
  { key: 'identification', label: "Identification de l'intervention", placeholder: "Ex : VAD par l'éducateur et la psychologue du SESSAD, domicile familial, 1h30" },
  { key: 'contexte',       label: 'Contexte et objectif',            placeholder: 'Ex : Faire le point sur la situation à domicile, suivi PPA en cours' },
  { key: 'deroulement',    label: 'Déroulement',                     placeholder: "Ex : Bilan psychométrique présenté aux parents, tensions évoquées autour de l'hygiène et du coucher" },
  { key: 'analyse',        label: 'Analyse professionnelle',          placeholder: "Ex : Difficultés liées à la dynamique familiale, non à une opposition généralisée de l'usager" },
  { key: 'plan',           label: "Plan d'actions",                  placeholder: 'Ex : Aide éducative via services sociaux, parents demandeurs, démarches à initier' },
  { key: 'suivi',          label: 'Suivi et indicateurs',            placeholder: 'Ex : Réévaluation dans 3 mois, dossier à transmettre aux services sociaux' },
  { key: 'conclusion',     label: 'Conclusion',                      placeholder: 'Ex : Prochaine VAD avec accompagnement aux démarches administratives' },
];

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

  const STORAGE_KEY = 'cr_intervention_draft';

  const loadDraft = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  };

  const draft = loadDraft();

  const [structureType, setStructureType] = useState(draft.structureType || '');
  const [interventionType, setInterventionType] = useState(
    draft.interventionType || '',
  );
  const [reference, setReference] = useState(draft.reference || '');
  const [date, setDate] = useState(
    draft.date || new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState(
    draft.notes || {
      identification: '',
      contexte: '',
      deroulement: '',
      analyse: '',
      plan: '',
      suivi: '',
      conclusion: '',
    },
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        structureType,
        interventionType,
        reference,
        date,
        notes,
      }),
    );
  }, [structureType, interventionType, reference, date, notes]);

  const handleReset = () => {
    if (
      !window.confirm(
        'Commencer un nouveau rapport ? Les données actuelles seront effacées.',
      )
    )
      return;
    localStorage.removeItem(STORAGE_KEY);
    setStructureType('');
    setInterventionType('');
    setReference('');
    setDate(new Date().toISOString().slice(0, 10));
    setNotes({
      identification: '',
      contexte: '',
      deroulement: '',
      analyse: '',
      plan: '',
      suivi: '',
      conclusion: '',
    });
    setResult('');
    setValidated(false);
    setElapsed(null);
  };

  const setNote = (key) => (e) =>
    setNotes((prev) => ({ ...prev, [key]: e.target.value }));

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
      const text = await generateInterventionReport({
        structureType,
        interventionType,
        reference,
        date,
        notes,
        educatorName: user?.name,
      });
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
    downloadDocx({
      text: result,
      reference,
      date,
      structureType,
      interventionType,
    });

  return (
    <div
      id="cr-page"
      className="h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8"
    >
      <div className="mx-auto flex w-full max-w-full flex-col gap-6">
        <form
          id="cr-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          {/* ── Étape 1 : Contexte ── */}
          <StepCard step="1" title="Contexte de l'intervention">
            <div id="context-fields" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                options={[
                  'Visite à domicile',
                  'Entretien individuel',
                  'Entretien famille',
                  'Accompagnement extérieur',
                  'Autre',
                ]}
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
            <p className="text-xs text-(--text-muted) mb-4">
              Ce qui s'est passé (saisie libre)
            </p>
            <div id="field-notes" className="rounded-xl bg-(--bg-secondary) border border-(--border) divide-y divide-(--border)/40 px-4">
              {NOTE_FIELDS.map(({ key, label, placeholder }) => (
                <div
                  key={key}
                  className="flex flex-col md:flex-row md:items-start md:gap-2 py-3"
                >
                  <span className="text-xs text-(--text-secondary) shrink-0 mb-1 md:mb-0 md:pt-1">
                    {label} :
                  </span>
                  <textarea
                    value={notes[key]}
                    onChange={setNote(key)}
                    rows={1}
                    className="w-full md:flex-1 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-muted) resize-none overflow-hidden min-w-0"
                    placeholder={placeholder}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Notice RGPD */}
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-(--bg-secondary) border border-(--border) px-4 py-3">
              <Lock size={16} className="text-(--text-muted) mt-0.5 shrink-0" />
              <p className="text-xs text-(--text-secondary) leading-5">
                <span className="font-semibold text-(--text-primary)">
                  Protection des données :{' '}
                </span>
                Vos notes sont anonymisées automatiquement avant d'être envoyées
                à l'IA. Aucun nom, prénom ou donnée nominative n'est transmis.
              </p>
            </div>
          </StepCard>

          {/* ── Boutons ── */}
          <div id="form-actions" className="flex flex-row items-center justify-between md:justify-start md:gap-4">
            <Button type="submit" color="blue" size="lg" disabled={loading}>
              {loading ? 'Génération en cours…' : '🤖 Générer le compte rendu'}
            </Button>
            {!loading && !result && (
              <span className="hidden md:inline text-xs text-(--text-muted)">Temps estimé : 5–10 secondes</span>
            )}
            {!loading && elapsed && (
              <span className="hidden md:inline text-xs text-(--text-muted)">Généré en {elapsed}s</span>
            )}
            <Button color="green" size="lg" icon={FilePlus} onClick={handleReset} className="md:ml-auto">
              Nouveau rapport
            </Button>
          </div>
        </form>

        {/* ── Loading ── */}
        {loading && (
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="w-5 h-5 rounded-full border-2 border-[#0D66D4] border-t-transparent animate-spin shrink-0" />
            <span className="text-sm text-(--text-secondary)">
              L'IA structure votre compte rendu…
            </span>
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
                <Button size="sm" color="ghost" icon={RefreshCw} onClick={() => handleSubmit({ preventDefault: () => {} })}>Régénérer</Button>
                <Button size="sm" color="ghost" icon={ClipboardCopy} onClick={handleCopy}>Copier</Button>
                <Button size="sm" color="ghost" icon={FileDown} onClick={handleWordDownload}>Word</Button>
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
                <span className="font-semibold text-(--text-primary)">
                  Validation obligatoire :{' '}
                </span>
                Je confirme avoir relu, vérifié et, si besoin, corrigé ce compte
                rendu. Je reste l'auteur et le responsable de ce document. L'IA
                est un outil d'assistance, non un substitut au jugement
                professionnel.
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterventionReport;
