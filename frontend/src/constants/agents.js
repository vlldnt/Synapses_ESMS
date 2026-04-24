export const AGENT_CARD_COLORS = {
  'compte-rendu-intervention':  '#0D66D4', // bleu-fonce
  'ppa-medico-social':          '#FCBE82', // orange
  'ppa-social':                 '#1294C3', // bleu-clair
  'ecrit-educatif':             '#F44E92', // rose-fonce
  'bilan-evaluation':           '#9B2CB6', // violet
  'compte-rendu-reunion':       '#0D66D4', // bleu-fonce
  'veille-professionnelle':     '#1294C3', // bleu-clair
  'reporting-mensuel':          '#42C4A1', // vert-fonce
  'rapport-activite':           '#9B2CB6', // violet
  'bilan-activite':             '#FCBE82', // orange
  'projet-etablissement':       '#F44E92', // rose-fonce
  'projet-service':             '#6CE4A8', // vert-clair
  'evaluation-interne-externe': '#FC89A3', // rose-clair
  'appel-projet':               '#FCBE82', // orange
};

export const AGENTS = [
  { id: 'compte-rendu-intervention', badge: 'CRI',    title: "Compte Rendu d'Intervention",  to: '/compte_rendu_intervention',            roles: ['agent', 'admin'] },
  { id: 'ppa-medico-social',         badge: 'PPAMS',  title: 'PPA Médico-Social',             to: '/projet_personnalise_medico_social',    roles: ['agent', 'admin'] },
  { id: 'ppa-social',                badge: 'PPAS',   title: 'PPA Social',                    to: '/projet_personnalise_social',           roles: ['agent', 'admin'] },
  { id: 'ecrit-educatif',            badge: 'ECRIT',  title: 'Écrit Éducatif',                to: '/ecrit_educatif',                       roles: ['agent', 'admin'] },
  { id: 'bilan-evaluation',          badge: 'BILAN',  title: "Bilan d'Évaluation",            to: '/bilan_evaluation',                     roles: ['agent', 'admin'] },
  { id: 'compte-rendu-reunion',      badge: 'CRR',    title: 'Compte Rendu de Réunion',       to: null,                           roles: ['direction', 'admin'] },
  { id: 'veille-professionnelle',    badge: 'VEILLE', title: 'Veille Professionnelle',        to: null,                           roles: ['direction', 'admin'] },
  { id: 'reporting-mensuel',         badge: 'REPORT', title: 'Reporting Mensuel',             to: null,                           roles: ['direction', 'admin'] },
  { id: 'rapport-activite',          badge: 'RA',     title: "Rapport d'Activité",            to: null,                           roles: ['direction', 'admin'] },
  { id: 'bilan-activite',            badge: 'BA',     title: "Bilan d'Activité",              to: null,                           roles: ['direction', 'admin'] },
  { id: 'projet-etablissement',      badge: 'PE',     title: "Projet d'Établissement",        to: null,                           roles: ['direction', 'admin'] },
  { id: 'projet-service',            badge: 'PS',     title: 'Projet de Service',             to: null,                           roles: ['direction', 'admin'] },
  { id: 'evaluation-interne-externe',badge: 'HAS',    title: 'Préparation Évaluation HAS',    to: null,                           roles: ['direction', 'admin'] },
  { id: 'appel-projet',              badge: 'AAP',    title: 'Appel à Projet',                to: null,                           roles: ['direction', 'admin'] },
];
