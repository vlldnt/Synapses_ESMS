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
  if (label === 'PPAMS') return '#42C4A1'; // vert-fonce
  if (label === 'PPA')   return '#6CE4A8'; // vert-clair
  if (label === 'CRI')   return '#0D66D4'; // bleu-fonce
  return '#94a3b8';
}
