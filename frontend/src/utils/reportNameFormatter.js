/**
 * Génère le nom du rapport au format: TYPE Prenom Initial. JJ-MM-YYYY
 * Exemple: CRI Marie D. 16-04-2026
 * Utilise le nom de l'enfant si disponible, sinon le nom du professionnel
 */
export function formatReportName(entry) {
  const structureType = entry.reportType || 'Rapport';

  // Priorité au nom de l'enfant, sinon au nom du professionnel
  const nameToFormat = entry.childName || entry.educatorName || '';
  const nameParts = nameToFormat.split(/\s+/) || [];
  const firstName = nameParts[0] || '';
  const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : '';

  // Convertir la date en format français JJ-MM-YYYY
  const [year, month, day] = (entry.date || entry.createdAt).split('-');
  const dateFR = `${day}-${month}-${year.slice(0, 4)}`;

  return `${structureType} ${firstName} ${lastNameInitial}. ${dateFR}`;
}
