import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FilePlus } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import RgpdNotice from '../components/RgpdNotice';
import GeneratedResult from '../components/GeneratedResult';
import structureTypes from '../data/structureTypes.json';
import StepCard from '../components/Dashboard/StepCard';
import { generatePPA } from '../services/aiService';
import { downloadDocx } from '../utils/wordExport';

const cardClass =
  'rounded-2xl border border-(--border) bg-(--bg-primary) p-5 md:p-8 shadow-sm';

const STORAGE_KEY = 'ppa_draft';

const AGE_GROUPS = [
  'Enfant (0-12 ans)',
  'Adolescent (12-18 ans)',
  'Jeune adulte (18-25 ans)',
  'Adulte (25+ ans)',
];
const PERIODS = ['6 mois', '1 an', '2 ans'];

const AXES = [
  { key: 'communication', label: 'Communication' },
  { key: 'mobilite',      label: 'Mobilité & déplacements' },
  { key: 'autonomie',     label: 'Autonomie quotidienne' },
  { key: 'socialisation', label: 'Socialisation' },
  { key: 'scolarite',     label: 'Scolarité / Formation' },
  { key: 'emploi',        label: 'Emploi & activité' },
  { key: 'sante',         label: 'Santé & soins' },
  { key: 'logement',      label: 'Logement & cadre de vie' },
];

const PPA_FIELDS = [
  {
    key: 'situation',
    label: 'Présentation de la situation',
    placeholder: "Ex : Enfant 8 ans, TSA léger, SESSAD depuis 2 ans, ULIS",
  },
  {
    key: 'besoins_sante',
    label: 'Besoins – Santé somatique & psychique',
    placeholder: "Ex : Anxiété lors des transitions, sensibilité sensorielle, besoin de cadre",
  },
  {
    key: 'besoins_autonomie',
    label: 'Besoins – Autonomie',
    placeholder: "Ex : Aide séquence habillage, motricité fine, communication orale limitée",
  },
  {
    key: 'besoins_participation',
    label: 'Besoins – Participation sociale',
    placeholder: "Ex : Jeu solitaire, peu d'interactions en groupe, intérêts spécifiques lego",
  },
  {
    key: 'objectifs',
    label: 'Objectifs prioritaires',
    placeholder: "Ex : Améliorer communication, réduire anxiété aux transitions, autonomie hygiène",
  },
  {
    key: 'modalites',
    label: "Modalités d'accompagnement",
    placeholder: "Ex : Éducateur + psychologue, 2 séances/semaine domicile, supports visuels",
  },
  {
    key: 'participation_personne',
    label: 'Participation & choix de la personne',
    placeholder: "Ex : Préférences par pointage, apprécie lego et animaux, parents impliqués",
  },
  {
    key: 'suivi',
    label: 'Suivi et réévaluation',
    placeholder: "Ex : Bilan à 3 mois, révision complète à 6 mois, famille",
  },
];

const EMPTY_NOTES = {
  situation: '',
  besoins_sante: '',
  besoins_autonomie: '',
  besoins_participation: '',
  objectifs: '',
  modalites: '',
  participation_personne: '',
  suivi: '',
};

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function PersonalizedProject() {
  const user = useSelector((state) => state.auth.user);
  const draft = loadDraft();

  const [reference,     setReference]     = useState(draft.reference     || '');
  const [structureType, setStructureType] = useState(draft.structureType || '');
  const [ageGroup,      setAgeGroup]      = useState(draft.ageGroup      || '');
  const [period,        setPeriod]        = useState(draft.period        || '');
  const [selectedAxes,  setSelectedAxes]  = useState(draft.selectedAxes  || []);
  const [notes,         setNotes]         = useState(draft.notes         || EMPTY_NOTES);
  const [loading,       setLoading]       = useState(false);
  const [result,        setResult]        = useState('');
  const [validated,     setValidated]     = useState(false);
  const [elapsed,       setElapsed]       = useState(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ reference, structureType, ageGroup, period, selectedAxes, notes }),
    );
  }, [reference, structureType, ageGroup, period, selectedAxes, notes]);

  const toggleAxe = (key) =>
    setSelectedAxes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const setNote = (key) => (e) =>
    setNotes((prev) => ({ ...prev, [key]: e.target.value }));

  const handleReset = () => {
    if (
      !window.confirm(
        'Commencer un nouveau PPA ? Les données actuelles seront effacées.',
      )
    )
      return;
    localStorage.removeItem(STORAGE_KEY);
    setReference('');
    setStructureType('');
    setAgeGroup('');
    setPeriod('');
    setSelectedAxes([]);
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
      const text = await generatePPA({
        reference,
        structureType,
        ageGroup,
        period,
        selectedAxes,
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
      date: new Date().toISOString().slice(0, 10),
      structureType,
      interventionType: `PPA — ${period}`,
    });

  return (
    <div
      id="ppa-page"
      className="h-full overflow-y-auto py-6 px-2 md:px-5 md:py-8"
    >
      <div className="mx-auto flex w-full max-w-full flex-col gap-6">
        <form
          id="ppa-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          {/* ── Étape 1 : Identification anonymisée ── */}
          <StepCard step="1" title="Identification anonymisée" subtitle="Aucune donnée nominative — utilisez une référence ou des initiales">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="ppa-reference"
                label="Référence / Code usager"
                type="text"
                value={reference}
                onChange={setReference}
                placeholder="Ex : T.M. ou Réf. 2024-031"
                hint="⚠️ Pas de nom complet — utilisez une référence ou des initiales."
              />
              <Input
                id="ppa-structure"
                label="Type de structure"
                type="combobox"
                value={structureType}
                onChange={setStructureType}
                placeholder="Rechercher ou sélectionner…"
                categories={structureTypes.categories}
                required
              />
              <Input
                id="ppa-age"
                label="Tranche d'âge"
                type="select"
                value={ageGroup}
                onChange={setAgeGroup}
                placeholder="Sélectionner…"
                options={AGE_GROUPS}
              />
              <Input
                id="ppa-period"
                label="Période du PPA"
                type="select"
                value={period}
                onChange={setPeriod}
                placeholder="Sélectionner…"
                options={PERIODS}
              />
            </div>
          </StepCard>

          {/* ── Étape 2 : Axes SERAFIN-PH ── */}
          <StepCard step="2" title="Axes SERAFIN-PH à travailler" subtitle="Sélectionnez les axes prioritaires pour ce PPA">
            <div className="flex items-center justify-between mb-3">
              {selectedAxes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedAxes([])}
                  className="text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
                >
                  Tout désélectionner
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AXES.map(({ key, label }) => {
                const active = selectedAxes.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAxe(key)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer w-full overflow-hidden
                      ${active
                        ? 'bg-(--bleu-fonce) border-(--bleu-fonce) text-white'
                        : 'bg-(--bg-secondary) border-(--border) text-(--text-secondary) hover:bg-(--bg-tertiary)'
                      }`}
                  >
                    <span className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 transition-colors
                      ${active ? 'border-white/60 text-white' : 'border-(--border) text-transparent'}`}>
                      ✓
                    </span>
                    <span className="truncate whitespace-nowrap">{label}</span>
                  </button>
                );
              })}
            </div>
          </StepCard>

          {/* ── Étape 3 : Observations ── */}
          <StepCard step="3" title="Vos observations" subtitle="Situation de la personne accompagnée (saisie libre)">
            <div className="rounded-xl bg-(--bg-secondary) border border-(--border) divide-y divide-(--border)/40 px-2">
              {PPA_FIELDS.map(({ key, label, placeholder }) => (
                <div
                  key={key}
                  className="flex flex-col md:flex-row md:items-center md:gap-2 py-3"
                >
                  <span className="text-[10px] md:text-xs text-(--text-secondary) shrink-0 mb-1 md:mb-0">
                    {label} :
                  </span>
                  <textarea
                    value={notes[key]}
                    onChange={setNote(key)}
                    rows={1}
                    className="w-full md:flex-1 bg-transparent outline-none text-[12px]! md:text-[14px]! text-(--text-primary) placeholder:text-[10px]! md:placeholder:text-[12px]! placeholder:text-(--text-muted)/60 placeholder:overflow-hidden resize-none overflow-hidden min-w-0 leading-tight italic"
                    placeholder={placeholder}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                </div>
              ))}
            </div>
            <RgpdNotice message="Toutes les données envoyées à l'IA sont anonymisées. Aucune donnée nominative ne quitte cet outil." />
          </StepCard>

          {/* ── Boutons ── */}
          <div className="flex flex-row items-center justify-around md:justify-start md:gap-4">
            <Button type="submit" color="orange" size="lg" disabled={loading}>
              {loading ? 'Génération en cours…' : 'Générer le PPA'}
            </Button>
            {!loading && !result && (
              <span className="hidden md:inline text-xs text-(--text-muted)">
                Génération en 10–15 secondes
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
              Nouveau PPA
            </Button>
          </div>
        </form>

        {/* ── Loading ── */}
        {loading && (
          <div className={`${cardClass} flex items-center gap-4`}>
            <div className="w-5 h-5 rounded-full border-2 border-(--orange) border-t-transparent animate-spin shrink-0" />
            <span className="text-sm text-(--text-secondary)">
              L'IA structure votre PPA selon le référentiel SERAFIN-PH…
            </span>
          </div>
        )}

        {/* ── Résultat ── */}
        {result && (
          <GeneratedResult
            id="ppa-result"
            title="PPA généré"
            result={result}
            validated={validated}
            onValidatedChange={setValidated}
            onRegenerate={() => handleSubmit({ preventDefault: () => {} })}
            onCopy={handleCopy}
            onWordDownload={handleWordDownload}
            validationText="Je confirme avoir relu et validé ce PPA avec le professionnel référent. Ce document engage ma responsabilité professionnelle. L'IA propose, le professionnel décide."
          />
        )}
      </div>
    </div>
  );
}

export default PersonalizedProject;
