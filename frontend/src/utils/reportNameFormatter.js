/**
 * Génère le nom du rapport au format: TYPE Prenom Initial. JJ-MM-YYYY
 * Exemple: CRI Adrien V. 16-04-2026
 */
export function formatReportName(entry) {
  const structureType = entry.structureType || 'DOC';
  const nameParts = entry.educatorName?.split(/\s+/) || [];
  const firstName = nameParts[0] || '';
  const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : '';

  // Convertir la date en format français JJ-MM-YYYY
  const [year, month, day] = (entry.date || entry.createdAt).split('-');
  const dateFR = `${day}-${month}-${year.slice(0, 4)}`;

  return `${structureType} ${firstName} ${lastNameInitial}. ${dateFR}`;
}
