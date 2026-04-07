import { useState } from 'react';
import { Lock, RefreshCw, ClipboardCopy, FileDown, CircleCheck } from 'lucide-react';
import Input from '../components/Input';
import structureTypes from '../data/structureTypes.json';

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

function CompteRendu() {
  const [typeStructure, setTypeStructure] = useState('');
  const [typeIntervention, setTypeIntervention] = useState('');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [validated, setValidated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setValidated(false);
    setTimeout(() => {
      setLoading(false);
      setResult('[ Résultat de l\'IA à venir ]');
    }, 1500);
  };

  const handleCopy = () => navigator.clipboard.writeText(result);

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
                value={typeStructure}
                onChange={setTypeStructure}
                placeholder="Rechercher ou sélectionner…"
                categories={structureTypes.categories}
                required
              />
              <Input
                id="cr-type-intervention"
                label="Type d'intervention"
                type="select"
                value={typeIntervention}
                onChange={setTypeIntervention}
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
            <Input
              id="cr-notes"
              label="Ce qui s'est passé (saisie libre)"
              type="textarea"
              value={notes}
              onChange={setNotes}
              placeholder="Notez librement ce que vous avez observé, ce qui a été dit, les difficultés rencontrées, les points positifs…"
              rows={7}
              required
            />

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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-xs text-(--text-secondary) hover:bg-(--bg-tertiary) transition-colors cursor-pointer"
                >
                  <FileDown size={13} /> Word
                </button>
              </div>
            </div>

            {/* Texte généré */}
            <div
              id="cr-output"
              className="whitespace-pre-wrap text-sm text-(--text-primary) leading-7 bg-(--bg-secondary) rounded-xl px-4 py-4 border border-(--border) min-h-32"
            >
              {result}
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

export default CompteRendu;
