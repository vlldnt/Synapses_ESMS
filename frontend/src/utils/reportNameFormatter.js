import { AGENTS } from '../constants/agents';

function findAgentForEntry(entry) {
  const direct = (entry.type || entry.reportType || '').toString().toLowerCase();
  const intervention = (entry.intervention_type || entry.interventionType || '').toString().toLowerCase();

  const byIdOrBadge = AGENTS.find((a) => {
    const id = a.id.toLowerCase();
    const badge = (a.badge || '').toLowerCase();
    if (direct && (direct === id || direct.includes(id))) return true;
    if (intervention && (intervention.includes(id) || intervention.includes(id.replace(/-/g, ' ')))) return true;
    if (direct && direct === badge) return true;
    return false;
  });
  if (byIdOrBadge) return byIdOrBadge;

  if (intervention.includes('ppa')) {
    if (intervention.includes('médico') || intervention.includes('medico')) {
      return AGENTS.find((a) => a.id === 'ppa-medico-social') || null;
    }
    return AGENTS.find((a) => a.id === 'ppa-social') || AGENTS.find((a) => a.id === 'ppa-medico-social') || null;
  }

  if (intervention.includes('compte') || intervention.includes('intervention') || intervention.includes('compte rendu')) {
    return AGENTS.find((a) => a.id === 'compte-rendu-intervention') || null;
  }

  return null;
}

export function formatReportName(entry) {
  if (entry.display_name) return entry.display_name;
  if (entry.displayName) return entry.displayName;

  const agent = findAgentForEntry(entry);
  const type = agent ? agent.badge : (entry.type || entry.reportType || 'Rapport');

  const educatorName = entry.educator?.name || entry.educatorName || '';
  const nameToFormat = entry.reference_name || entry.childName || educatorName || '';
  const nameParts = nameToFormat.split(/\s+/) || [];
  const firstName = nameParts[0] || '';
  const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : '';

  const dateObj = new Date(entry.date || entry.created_at || entry.createdAt || Date.now());
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const dateFR = `${day}-${month}-${year}`;

  return `${type} ${firstName} ${lastNameInitial} ${dateFR}`.trim();
}
