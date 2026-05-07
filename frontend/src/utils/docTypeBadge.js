import { AGENTS } from '../constants/agents';

const BADGE_TO_AGENT_ID = {
  CRI:    'compte-rendu-intervention',
  PPAMS:  'ppa-medico-social',
  PPAS:   'ppa-social',
  ECRIT:  'ecrit-educatif',
  BILAN:  'bilan-evaluation',
  CRR:    'compte-rendu-reunion',
  VEILLE: 'veille-professionnelle',
  REPORT: 'reporting-mensuel',
  RA:     'rapport-activite',
  BA:     'bilan-activite',
  PE:     'projet-etablissement',
  PS:     'projet-service',
  HAS:    'evaluation-interne-externe',
  AAP:    'appel-projet',
};

export function getDocTypeLabel(entry) {
  const direct = entry.type || entry.reportType;
  if (direct) return direct.toUpperCase().slice(0, 6);
  const t = (entry.interventionType || '').toLowerCase();
  if (t.includes('ppa') && (t.includes('médico') || t.includes('medico'))) return 'PPAMS';
  if (t.includes('ppa')) return 'PPA';
  if (t.includes('compte rendu') || t.includes('intervention')) return 'CRI';
  const words = (entry.interventionType || 'DOC').trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 5).toUpperCase();
  return words.map((w) => w[0]).join('').toUpperCase().slice(0, 5);
}

export function getDocColorFromLabel(label) {
  const agentId = BADGE_TO_AGENT_ID[label];
  if (agentId) {
    const agent = AGENTS.find((a) => a.id === agentId);
    if (agent) return agent.color;
  }
  return '#94a3b8';
}
