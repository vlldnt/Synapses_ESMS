import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FilePlus } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import RgpdNotice from '../components/RgpdNotice';
import GeneratedResult from '../components/GeneratedResult';
import structureTypes from '../data/structureTypes.json';
import StepCard from '../components/Dashboard/StepCard';
import { generateInterventionReport } from '../services/aiService';
import { downloadDocx } from '../utils/wordExport';

const cardClass =
  'rounded-2xl border border-(--border) bg-(--bg-primary) p-5 md:p-8 shadow-sm';

const STORAGE_KEY = 'cr_intervention_draft';

const NOTE_FIELDS = [
  {
    key: 'identification',
    label: "Identification de l'intervention",
    placeholder:
      "Ex : VAD par l'éducateur et la psychologue du SESSAD, domicile familial, 1h30",
  },
  {
    key: 'contexte',
    label: 'Contexte et objectif',
    placeholder:
      'Ex : Faire le point sur la situation à domicile, suivi PPA en cours',
  },
  {
    key: 'deroulement',
    label: 'Déroulement',
    placeholder:
      "Ex : Bilan psychométrique présenté aux parents, tensions évoquées autour de l'hygiène et du coucher",
  },
  {
    key: 'analyse',
    label: 'Analyse professionnelle',
    placeholder:
      "Ex : Difficultés liées à la dynamique familiale, non à une opposition généralisée de l'usager",
  },
  {
    key: 'plan',
    label: "Plan d'actions",
    placeholder:
      'Ex : Aide éducative via services sociaux, parents demandeurs, démarches à initier',
  },
  {
    key: 'suivi',
    label: 'Suivi et indicateurs',
    placeholder:
      'Ex : Réévaluation dans 3 mois, dossier à transmettre aux services sociaux',
  },
  {
    key: 'conclusion',
    label: 'Conclusion',
    placeholder:
      'Ex : Prochaine VAD avec accompagnement aux démarches administratives',
  },
];

const EMPTY_NOTES = {
  identification: '',
  contexte: '',
  deroulement: '',
  analyse: '',
  plan: '',
  suivi: '',
  conclusion: '',
};

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function InterventionReport() {
  const user = useSelector((state) => state.auth.user);
  const draft = loadDraft();

  const [structureType, setStructureType] = useState(draft.structureType || '');
  const [interventionType, setInterventionType] = useState(
    draft.interventionType || '',
  );
  const [reference, setReference] = useState(draft.reference || '');
  const [date, setDate] = useState(
    draft.date || new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState(draft.notes || EMPTY_NOTES);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [validated, setValidated] = useState(false);
  const [elapsed, setElapsed] = useState(null);

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

  const setNote = (key) => (e) =>
    setNotes((prev) => ({ ...prev, [key]: e.target.value }));

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
    setNotes(EMPTY_NOTES);
    setResult('');
    setValidated(false);
    setElapsed(null);
  };

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
            <div
              id="context-fields"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
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
            <div
              id="field-notes"
              className="rounded-xl bg-(--bg-secondary) border border-(--border) divide-y divide-(--border)/40 px-4"
            >
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
                    className="w-full md:flex-1 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-muted)/60 resize-none overflow-hidden min-w-0"
                    placeholder={placeholder}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                </div>
              ))}
            </div>
            <RgpdNotice message="Vos notes sont anonymisées automatiquement avant d'être envoyées à l'IA. Aucun nom, prénom ou donnée nominative n'est transmis." />
          </StepCard>

          {/* ── Boutons ── */}
          <div
            id="form-actions"
            className="flex flex-row items-center justify-around md:justify-start md:gap-4"
          >
            <Button type="submit" color="blue" size="lg" disabled={loading}>
              {loading ? 'Génération en cours…' : 'Générer le compte rendu'}
            </Button>
            {!loading && !result && (
              <span className="hidden md:inline text-xs text-(--text-muted)">
                Temps estimé : 5–10 secondes
              </span>
            )}
            {!loading && elapsed && (
              <span className="hidden md:inline text-xs text-(--text-muted)">
                Généré en {elapsed}s
              </span>
            )}
            <Button
              color="green"
              size="lg"
              icon={FilePlus}
              onClick={handleReset}
              className="md:ml-auto"
            >
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
          <GeneratedResult
            id="cr-result"
            title="Compte rendu généré"
            result={result}
            validated={validated}
            onValidatedChange={setValidated}
            onRegenerate={() => handleSubmit({ preventDefault: () => {} })}
            onCopy={handleCopy}
            onWordDownload={handleWordDownload}
            validationText="Je confirme avoir relu, vérifié et, si besoin, corrigé ce compte rendu. Je reste l'auteur et le responsable de ce document. L'IA est un outil d'assistance, non un substitut au jugement professionnel."
          />
        )}
      </div>
    </div>
  );
}

export default InterventionReport;
