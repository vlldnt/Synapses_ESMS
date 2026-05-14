import { authFetch } from './authServices';

// ─── CONFIG ───────────────────────────────────────────────────────────────────

export const DEFAULT_MODEL = 'mistralai/voxtral-small-24b-2507';

const basename = import.meta.env.VITE_BASENAME || '/synapses';
const API_URL = `${basename}/api`;

// ─── PROMPTS — fetch & cache depuis /api/prompts ──────────────────────────────

let promptsCache = [];

export function resetPromptsCache() {
  promptsCache = [];
}

async function fetchPrompts() {
  try {
    const res = await authFetch(`${API_URL}/prompts`);
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
  if (!prompt)
    console.warn(
      `Prompt "${name}" not found. Available:`,
      promptsCache.map((p) => p.name),
    );
  return prompt;
}

// ─── CŒUR — OpenRouter + nettoyage ───────────────────────────────────────────

async function getChatResponse({
  systemPrompt,
  userMessage,
  temperature = 0.4,
  model = DEFAULT_MODEL,
}) {
  if (!systemPrompt) throw new Error('Prompt système non trouvé');

  const resp = await authFetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Erreur API ${resp.status}`);
  }

  const completion = await resp.json();
  const text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error('Réponse OpenRouter vide ou inattendue.');

  return text.trim();
}

// Récupère le prompt JSON par nom, puis l'envoie au chat.
export const PROMPT_NOT_FOUND = 'PROMPT_NOT_FOUND';

async function sendPrompt(
  promptName,
  userMessage,
  { temperature = 0.4, model } = {},
) {
  const promptData = await getPrompt(promptName);
  if (!promptData) throw new Error(PROMPT_NOT_FOUND);
  try {
    return await getChatResponse({
      systemPrompt: promptData.content,
      userMessage,
      temperature,
      model: model ?? promptData.model ?? DEFAULT_MODEL,
    });
  } catch (err) {
    console.error(`❌ sendPrompt("${promptName}") error:`, err.message);
    throw err;
  }
}

// ─── AGENTS ───────────────────────────────────────────────────────────────────

// Contexte commun injecté dans chaque message utilisateur.
function buildContext({
  companyName,
  structureType,
  educatorName,
  educatorRole,
  date,
}) {
  return `--- CONTEXTE PROFESSIONNEL (données automatiques) ---
Établissement : ${companyName || 'Non précisé'}
Type de structure : ${structureType || 'Non précisé'}
Professionnel rédacteur : ${educatorName || 'Non renseigné'} — ${educatorRole || 'Non précisé'}
Date : ${date}`;
}

// CRI — Compte Rendu d'Intervention
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
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}
Type d'intervention : ${interventionType || 'Non précisé'}

--- TRANSCRIPTION BRUTE DU PROFESSIONNEL ---
${transcription?.trim() || 'Aucune transcription fournie.'}

Extrais les informations pertinentes de cette transcription et rédige un compte rendu complet en 7 sections selon la structure définie. Pour toute information manquante, indique « À compléter par le professionnel ».
`.trim();

  const result = await sendPrompt('cr_intervention', userMessage, {
    temperature: 0.4,
    model,
  });

  const typeMatch = result.match(/\[TYPE_INTERVENTION:\s*(.+?)\]/);
  const detectedType = typeMatch ? typeMatch[1].trim() : 'Intervention';
  if (typeof window !== 'undefined')
    sessionStorage.setItem('detectedInterventionType', detectedType);

  return result.replace(/\[TYPE_INTERVENTION:.+?\]\n?/g, '');
}

// PPAMS — Projet Personnalisé d'Accompagnement Médico-Social (SERAFIN-PH)
export async function generatePersonalizedProject({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- OBSERVATIONS BRUTES DU PROFESSIONNEL ---
${observations?.trim() || 'Aucune observation fournie.'}

Analyse ces observations, identifie les besoins selon la nomenclature SERAFIN-PH et génère un PPA complet en 10 sections. Pour toute information absente, indique « À compléter par le professionnel référent ». Assure la cohérence : chaque besoin → prestation → objectif → ligne du tableau.
`.trim();

  return sendPrompt('ppa_medico_social', userMessage, {
    temperature: 0.35,
    model,
  });
}

// Bilan d'évaluation
export async function generateBilanEvaluation({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- OBSERVATIONS ET ÉLÉMENTS DU BILAN ---
${observations?.trim() || 'Aucune observation fournie.'}

Analyse ces éléments et génère un bilan d'évaluation professionnel structuré, avec des titres adaptés au contenu réel. Valorise les acquis et les progrès avant les difficultés. Formule des objectifs éducatifs si le contexte le justifie.
`.trim();

  return sendPrompt('bilan_evaluation', userMessage, { temperature: 0.35, model });
}

// Écrit éducatif
export async function generateEcritEducatif({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- NOTES TERRAIN DU PROFESSIONNEL ---
${observations?.trim() || 'Aucune observation fournie.'}

Analyse ces notes et génère un écrit éducatif professionnel structuré, avec des titres adaptés au contexte réel. Ne force aucune section inutile. Valorise les ressources et points d'appui avant les difficultés.
`.trim();

  return sendPrompt('ecrit_educatif', userMessage, { temperature: 0.35, model });
}

// CRR — Compte Rendu de Réunion
export async function generateCompteRenduReunion({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- NOTES DE RÉUNION DU PROFESSIONNEL ---
${observations?.trim() || 'Aucune note fournie.'}

Analyse ces notes et génère un compte rendu de réunion professionnel structuré avec ordre du jour, participants (par fonction), points abordés, décisions prises et actions à engager.
`.trim();
  return sendPrompt('compte_rendu_reunion', userMessage, { temperature: 0.35, model });
}

// VEILLE — Veille Professionnelle
export async function generateVeilleProfessionnelle({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- ÉLÉMENTS DE VEILLE DU PROFESSIONNEL ---
${observations?.trim() || 'Aucun élément fourni.'}

Analyse ces éléments et génère une note de veille professionnelle structurée : contexte réglementaire ou thématique, synthèse des évolutions, impacts pour la structure et recommandations pratiques.
`.trim();
  return sendPrompt('veille_professionnelle', userMessage, { temperature: 0.4, model });
}

// RM — Reporting Mensuel
export async function generateReportingMensuel({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- DONNÉES ET OBSERVATIONS DU MOIS ---
${observations?.trim() || 'Aucune donnée fournie.'}

Analyse ces données et génère un reporting mensuel structuré : indicateurs d'activité, faits marquants, points de vigilance, perspectives pour le mois suivant.
`.trim();
  return sendPrompt('reporting_mensuel', userMessage, { temperature: 0.35, model });
}

// RA — Rapport d'Activité
export async function generateRapportActivite({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- ÉLÉMENTS DU RAPPORT D'ACTIVITÉ ---
${observations?.trim() || 'Aucun élément fourni.'}

Analyse ces éléments et génère un rapport d'activité professionnel structuré : présentation de la structure, bilan quantitatif et qualitatif des actions, points forts, axes d'amélioration et perspectives.
`.trim();
  return sendPrompt('rapport_activite', userMessage, { temperature: 0.35, model });
}

// BA — Bilan d'Activité
export async function generateBilanActivite({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- ÉLÉMENTS DU BILAN D'ACTIVITÉ ---
${observations?.trim() || 'Aucun élément fourni.'}

Analyse ces éléments et génère un bilan d'activité structuré : évaluation des objectifs fixés, réalisations, indicateurs clés, enseignements tirés et orientations pour la prochaine période.
`.trim();
  return sendPrompt('bilan_activite', userMessage, { temperature: 0.35, model });
}

// PE — Projet d'Établissement
export async function generateProjetEtablissement({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- ÉLÉMENTS ET ORIENTATIONS STRATÉGIQUES ---
${observations?.trim() || 'Aucun élément fourni.'}

Analyse ces éléments et génère un projet d'établissement structuré : présentation et valeurs, diagnostic de la situation, orientations stratégiques, objectifs à 5 ans, plan d'action et modalités d'évaluation.
`.trim();
  return sendPrompt('projet_etablissement', userMessage, { temperature: 0.4, model });
}

// PS — Projet de Service
export async function generateProjetService({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model = DEFAULT_MODEL,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- ÉLÉMENTS ET ORIENTATIONS DU SERVICE ---
${observations?.trim() || 'Aucun élément fourni.'}

Analyse ces éléments et génère un projet de service structuré : missions et périmètre du service, diagnostic, objectifs opérationnels, organisation et ressources, modalités de suivi et d'évaluation.
`.trim();
  return sendPrompt('projet_service', userMessage, { temperature: 0.4, model });
}

// PPAS — Projet Personnalisé d'Accompagnement Social (axes Séraphin)
export async function generatePpasSocial({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
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

// HAS — Préparation Évaluation HAS
export async function generateEvaluationHas({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- ÉLÉMENTS DE LA DÉMARCHE QUALITÉ ---
${observations?.trim() || 'Aucun élément fourni.'}

Analyse ces éléments et génère une préparation structurée à l'évaluation HAS : identification des thématiques concernées, points forts, axes d'amélioration, recommandations concrètes et plan d'action priorisé.
`.trim();
  return sendPrompt('evaluation_has', userMessage, { temperature: 0.4, model });
}

// AAP — Appel à Projet
export async function generateAppelProjet({
  observations,
  structureType,
  companyName,
  educatorName,
  educatorRole,
  date,
  model,
}) {
  const userMessage = `
${buildContext({ companyName, structureType, educatorName, educatorRole, date })}

--- ÉLÉMENTS DU PROJET ---
${observations?.trim() || 'Aucun élément fourni.'}

Analyse ces éléments et génère une réponse structurée à l'appel à projet : présentation du porteur, diagnostic territorial, description du projet, public cible, moyens humains et organisationnels, plan de financement indicatif, démarche qualité et calendrier de mise en œuvre.
`.trim();
  return sendPrompt('appel_projet', userMessage, { temperature: 0.4, model });
}
