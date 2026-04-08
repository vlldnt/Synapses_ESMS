import promptData from '../data/prompt_CR_intervention.json';

const API_URL = '/ollama/v1/chat/completions';
const MODEL = 'qwen3:0.6b';

export async function generateInterventionReport({ structureType, interventionType, reference, date, notes, educatorName }) {
  const userMessage = `
Type de structure : ${structureType || 'Non précisé'}
Type d'intervention : ${interventionType || 'Non précisé'}
Référence dossier : ${reference || 'Non renseignée'}
Date de l'intervention : ${date || 'Non renseignée'}
Professionnel rédacteur : ${educatorName || 'Non renseigné'}

Notes de terrain anonymisées :
${notes}

Rédige un compte rendu complet selon la trame. Le nom du professionnel rédacteur doit apparaître dans la section d'identification.
`.trim();

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: promptData.content },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erreur Ollama : ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) throw new Error('Réponse Ollama vide ou inattendue.');

  return text;
}
