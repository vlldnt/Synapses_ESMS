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
  const prompt = promptsCache.find((p) => p.name === name);
  if (!prompt) {
    console.warn(`Prompt not found: ${name}. Available:`, promptsCache.map(p => p.name));
  }
  return prompt;
};

// Modèle par défaut - utilise Voxtral Small 24B
export const DEFAULT_MODEL = 'mistralai/voxtral-small-24b-2507';

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('❌ VITE_OPENROUTER_API_KEY not configured in .env.local');
}

const openrouter = new OpenRouter({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

async function getChatResponse({
  systemPrompt,
  userMessage,
  temperature = 0.4,
  model = DEFAULT_MODEL,
}) {
  try {
    if (!systemPrompt) throw new Error('Prompt système non trouvé');

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
  } catch (err) {
    console.error('❌ getChatResponse Error:');
    console.error('  Message:', err.message);
    console.error('  Full error:', err);

    // Si c'est une erreur OpenRouter, affiche les détails
    if (err.response) {
      console.error('  API Response:', err.response.status, err.response.statusText);
      console.error('  API Body:', err.response.data);
    }

    throw new Error(`Erreur OpenRouter: ${err.message}`);
  }
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
  const result = await getChatResponse({
    systemPrompt: promptData?.content,
    userMessage,
    temperature: 0.4,
    model,
  });

  // Extraire le type d'intervention généré par l'IA
  const typeMatch = result.match(/\[TYPE_INTERVENTION:\s*(.+?)\]/);
  const detectedType = typeMatch ? typeMatch[1].trim() : 'Intervention';

  // Retourner le résultat avec le type détecté (supprimer la ligne de métadonnée du texte affiché)
  const cleanedResult = result.replace(/\[TYPE_INTERVENTION:.+?\]\n?/g, '');

  // Stocker le type détecté pour utilisation ultérieure (sauvegarder dans le localStorage ou l'état)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('detectedInterventionType', detectedType);
  }

  return cleanedResult;
}
