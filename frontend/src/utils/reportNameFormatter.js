/**
 * Génère le nom du rapport au format: TYPE Prenom Initial JJ-MM-YYYY
 * Exemple: CRI Marie D 16-04-2026
 *
 * Si entry.displayName existe, l'utilise directement (format standardisé)
 * Sinon, génère le format à partir des autres champs
 */
export function formatReportName(entry) {
  // Si displayName est disponible, l'utiliser directement (nouveau format)
  if (entry.displayName) {
    return entry.displayName;
  }

  // Fallback à l'ancien format pour les données existantes
  const type = entry.type || entry.reportType || 'Rapport';

  // Priorité au nom de l'enfant, sinon au nom du professionnel
  const nameToFormat = entry.childName || entry.educatorName || '';
  const nameParts = nameToFormat.split(/\s+/) || [];
  const firstName = nameParts[0] || '';
  const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : '';

  // Convertir la date en format français JJ-MM-YYYY
  const [year, month, day] = (entry.date || entry.createdAt).split('-');
  const dateFR = `${day}-${month}-${year.slice(0, 4)}`;

  return `${type} ${firstName} ${lastNameInitial}. ${dateFR}`;
}
