import { OpenRouter } from '@openrouter/sdk';

// ─── CONFIG ───────────────────────────────────────────────────────────────────

export const DEFAULT_MODEL = 'mistralai/voxtral-small-24b-2507';

const basename = import.meta.env.VITE_BASENAME || '/synapses';
const API_URL = `${basename}/api`;

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
if (!apiKey) console.error('❌ VITE_OPENROUTER_API_KEY not configured in .env.local');

const openrouter = new OpenRouter({ apiKey, dangerouslyAllowBrowser: true });

// ─── PROMPTS — fetch & cache depuis /api/prompts ──────────────────────────────

let promptsCache = [];

async function fetchPrompts() {
  try {
    const res = await fetch(`${API_URL}/prompts`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    promptsCache = await res.json();
  } catch (err) {
    console.warn('Error fetching prompts:', err);
  }
  return promptsCache;
}

async function getPrompt(name) {
  if (promptsCache.length === 0) await fetchPrompts();
  const prompt = promptsCache.find((p) => p.name === name);
  if (!prompt) console.warn(`Prompt "${name}" not found. Available:`, promptsCache.map((p) => p.name));
  return prompt;
}

// ─── CŒUR — OpenRouter + nettoyage ───────────────────────────────────────────

async function getChatResponse({ systemPrompt, userMessage, temperature = 0.4, model = DEFAULT_MODEL }) {
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

  return text
    .replace(/⚠️\s*Aide IA\s*--\s*Validation humaine obligatoire avant diffusion[^\n]*/gi, '')
    .replace(/Rédigé avec l'aide de l'IA\s*--\s*à relire et valider[^\n]*/gi, '')
    .replace(/Texte généré avec l'aide d'une intelligence artificielle[^\n]*/gi, '')
    .replace(/généré avec l'aide d'une intelligence artificielle[^\n]*/gi, '')
    .replace(/Assisté par IA[^\n]*/gi, '')
    .trim();
}

// Récupère le prompt JSON par nom, puis l'envoie au chat.
async function sendPrompt(promptName, userMessage, { temperature = 0.4, model = DEFAULT_MODEL } = {}) {
  const promptData = await getPrompt(promptName);
  try {
    return await getChatResponse({ systemPrompt: promptData?.content, userMessage, temperature, model });
  } catch (err) {
    console.error(`❌ sendPrompt("${promptName}") error:`, err.message);
    throw new Error(`Erreur OpenRouter: ${err.message}`);
  }
}

// ─── AGENTS ───────────────────────────────────────────────────────────────────

// Contexte commun injecté dans chaque message utilisateur.
function buildContext({ companyName, structureType, educatorName, educatorRole, date }) {
  return `--- CONTEXTE PROFESSIONNEL (données automatiques) ---
Établissement : ${companyName || 'Non précisé'}
Type de structure : ${structureType || 'Non précisé'}
Professionnel rédacteur : ${educatorName || 'Non renseigné'} — ${educatorRole || 'Non précisé'}
Date : ${date}`;
}

// CRI — Compte Rendu d'Intervention
export async function generateInterventionReport({
  interventionType, transcription, structureType, companyName, educatorName, educatorRole, date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}
Type d'intervention : ${interventionType || 'Non précisé'}

--- TRANSCRIPTION BRUTE DU PROFESSIONNEL ---
${transcription?.trim() || 'Aucune transcription fournie.'}

Extrais les informations pertinentes de cette transcription et rédige un compte rendu complet en 7 sections selon la structure définie. Pour toute information manquante, indique « À compléter par le professionnel ».
`.trim();

  const result = await sendPrompt('cr_intervention', userMessage, { temperature: 0.4, model });

  const typeMatch = result.match(/\[TYPE_INTERVENTION:\s*(.+?)\]/);
  const detectedType = typeMatch ? typeMatch[1].trim() : 'Intervention';
  if (typeof window !== 'undefined') sessionStorage.setItem('detectedInterventionType', detectedType);

  return result.replace(/\[TYPE_INTERVENTION:.+?\]\n?/g, '');
}

// PPAMS — Projet Personnalisé d'Accompagnement Médico-Social (SERAFIN-PH)
export async function generatePersonalizedProject({
  observations, structureType, companyName, educatorName, educatorRole, date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- OBSERVATIONS BRUTES DU PROFESSIONNEL ---
${observations?.trim() || 'Aucune observation fournie.'}

Analyse ces observations, identifie les besoins selon la nomenclature SERAFIN-PH et génère un PPA complet en 10 sections. Pour toute information absente, indique « À compléter par le professionnel référent ». Assure la cohérence : chaque besoin → prestation → objectif → ligne du tableau.
`.trim();

  return sendPrompt('ppa_medico_social', userMessage, { temperature: 0.35, model });
}

// PPAS — Projet Personnalisé d'Accompagnement Social (axes Séraphin)
export async function generatePpasSocial({
  observations, structureType, companyName, educatorName, educatorRole, date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- OBSERVATIONS BRUTES DU PROFESSIONNEL ---
${observations?.trim() || 'Aucune observation fournie.'}

Analyse ces observations, identifie les axes Séraphin concernés et génère un PPAS complet en 7 sections. Pour toute information absente, indique « À compléter par le professionnel référent ». Valorise les ressources et le pouvoir d'agir de la personne.
`.trim();

  return sendPrompt('ppa_social', userMessage, { temperature: 0.35, model });
}
