import { OpenRouter } from '@openrouter/sdk';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let promptsCache = [];

/**
 * Fetch prompts from API
 */
async function fetchPrompts() {
  try {
    const response = await fetch(`${API_URL}/api/prompts`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    promptsCache = await response.json();
    return promptsCache;
  } catch (err) {
    console.warn('Error fetching prompts:', err);
    return promptsCache;
  }
}

const getPrompt = async (name) => {
  if (promptsCache.length === 0) {
    await fetchPrompts();
  }
  return promptsCache.find((p) => p.name === name);
};

export const DEFAULT_MODEL = 'mistralai/voxtral-small-24b-2507';

const openrouter = new OpenRouter({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
});

async function getChatResponse({
  systemPrompt,
  userMessage,
  temperature = 0.4,
  model = DEFAULT_MODEL,
}) {
  const completion = await openrouter.chat.send({
    chatRequest: {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
    },
  });

  let text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error('Réponse OpenRouter vide ou inattendue.');

  // Nettoyer les mentions d'IA qu'on ne veut pas
  text = text
    .replace(/⚠️\s*Aide IA\s*--\s*Validation humaine obligatoire avant diffusion[^\n]*/gi, '')
    .replace(/Rédigé avec l'aide de l'IA\s*--\s*à relire et valider[^\n]*/gi, '')
    .replace(/Texte généré avec l'aide d'une intelligence artificielle[^\n]*/gi, '')
    .replace(/généré avec l'aide d'une intelligence artificielle[^\n]*/gi, '')
    .replace(/Assisté par IA[^\n]*/gi, '')
    .trim();

  return text;
}

export async function generatePPA({
  reference,
  structureType,
  ageGroup,
  period,
  selectedAxes = [],
  notes,
  educatorName,
}) {
  const userMessage = `
--- CONTEXTE (généré automatiquement) ---
Référence / Code usager : ${reference || 'Non renseignée'}
Type de structure : ${structureType || 'Non précisé'}
Tranche d'âge : ${ageGroup || 'Non précisée'}
Période du PPA : ${period || 'Non précisée'}
Professionnel rédacteur : ${educatorName || 'Non renseigné'}
Axes SERAFIN-PH prioritaires : ${selectedAxes.length ? selectedAxes.join(', ') : 'Non précisés'}

--- OBSERVATIONS ANONYMISÉES ---

1. PRÉSENTATION DE LA SITUATION
${notes.situation || 'Non renseigné'}

2. BESOINS – SANTÉ SOMATIQUE & PSYCHIQUE
${notes.besoins_sante || 'Non renseigné'}

3. BESOINS – AUTONOMIE
${notes.besoins_autonomie || 'Non renseigné'}

4. BESOINS – PARTICIPATION SOCIALE
${notes.besoins_participation || 'Non renseigné'}

5. OBJECTIFS PRIORITAIRES
${notes.objectifs || 'Non renseigné'}

6. MODALITÉS D'ACCOMPAGNEMENT
${notes.modalites || 'Non renseigné'}

7. PARTICIPATION & CHOIX DE LA PERSONNE
${notes.participation_personne || 'Non renseigné'}

8. SUIVI ET RÉÉVALUATION
${notes.suivi || 'Non renseigné'}

Rédige un PPA complet en 10 sections selon la trame. Utilise les codes SERAFIN-PH officiels. Appuie-toi sur les observations pour chaque section.
`.trim();

  const promptData = await getPrompt('ppa_medico_social');
  return getChatResponse({
    systemPrompt: promptData?.content,
    userMessage,
    temperature: 0.4,
  });
}

/**
 * Génère un compte rendu d'intervention à partir d'une transcription brute.
 *
 * Le contexte utilisateur (structure, nom, rôle) est injecté automatiquement
 * depuis les données JSON / API — aucun champ n'est saisi manuellement sauf
 * le type d'intervention et la transcription libre.
 *
 * @param {object} params
 * @param {string} params.interventionType  - Sélection dropdown (ex: "Visite à domicile")
 * @param {string} params.transcription     - Texte brut dicté ou saisi par le professionnel
 * @param {string} params.structureType     - Déduit du company.type (JSON)
 * @param {string} params.companyName       - Déduit du company.name (JSON)
 * @param {string} params.educatorName      - Déduit du user.firstName + lastName (JSON)
 * @param {string} params.educatorRole      - Déduit du user.role (JSON)
 * @param {string} params.date              - Date automatique (now)
 * @param {string} [params.model]           - ID modèle OpenRouter (défaut : DEFAULT_MODEL)
 */
export async function generateInterventionReport({
  interventionType,
  transcription,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
--- CONTEXTE PROFESSIONNEL (données automatiques, non saisies par l'utilisateur) ---
Établissement : ${companyName || 'Non précisé'}
Type de structure : ${structureType || 'Non précisé'}
Professionnel rédacteur : ${educatorName || 'Non renseigné'} — ${educatorRole || 'Non précisé'}
Type d'intervention : ${interventionType || 'Non précisé'}
Date : ${date}

--- TRANSCRIPTION BRUTE DU PROFESSIONNEL ---
${transcription?.trim() || 'Aucune transcription fournie.'}

Extrais les informations pertinentes de cette transcription et rédige un compte rendu complet en 7 sections selon la structure définie. Pour toute information manquante, indique « À compléter par le professionnel ».
`.trim();

  const promptData = await getPrompt('cr_intervention');
  return getChatResponse({
    systemPrompt: promptData?.content,
    userMessage,
    temperature: 0.4,
    model,
  });
}
