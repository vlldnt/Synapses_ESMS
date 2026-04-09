import { useState } from 'react';

const STEPS = [
  { step: '', label: "Informations générales sur l'intervention" },
  { step: '', label: 'Contexte et objectifs visés' },
  { step: '', label: 'Déroulement et observations' },
  { step: '', label: 'Analyse professionnelle et enseignements' },
  { step: '', label: "Plan d'action immédiat" },
  { step: '', label: "Suivi et critères d'évaluation" },
  { step: '', label: 'Bilan et perspectives' },
];

function PersonalizedProject() {
  const [fields, setFields] = useState(
    Object.fromEntries(STEPS.map((s) => [s.step, '']))
  );

  const set = (step) => (e) => setFields((prev) => ({ ...prev, [step]: e.target.value }));

  return (
    <div className="h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-full flex-col gap-6">
        <form className="flex flex-col gap-6">

          <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-5 md:p-8 shadow-sm">
            {STEPS.map(({ step, label }) => (
              <div key={step} className="flex items-start gap-3 py-3">
                <span className="text-sm text-(--text-secondary) shrink-0 pt-1">
                {label} :
                </span>
                <input
                  type="text"
                  value={fields[step]}
                  onChange={set(step)}
                  className="flex-1 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-muted)"
                  placeholder="Saisissez ici…"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg bg-[#0D66D4] hover:bg-[#0B55B8] text-white font-medium text-sm md:text-base transition-colors duration-200 cursor-pointer"
            >
              Générer le PPA
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default PersonalizedProject;
