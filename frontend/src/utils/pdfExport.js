import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ── Dimensions A4 (mm) ────────────────────────────────────────────────────────
const A4_W = 210;
const A4_H = 297;
const MARGIN_X  = 12;   // marges gauche/droite
const MARGIN_TOP = 20;  // espace réservé au-dessus du contenu (header + séparateur)
const MARGIN_BOT = 18;  // espace réservé en bas (footer + séparateur)
const HEADER_Y   = 9;   // ligne de texte header
const HEADER_LINE_Y = 14; // trait séparateur header
const FOOTER_LINE_Y = A4_H - MARGIN_BOT + 3; // trait séparateur footer
const FOOTER_Y      = A4_H - MARGIN_BOT + 9; // ligne de texte footer

const CONTENT_W = A4_W - MARGIN_X * 2;
const CONTENT_H = A4_H - MARGIN_TOP - MARGIN_BOT;

// ── Utilitaires canvas ────────────────────────────────────────────────────────
function sliceCanvas(src, topPx, heightPx) {
  const c = document.createElement('canvas');
  c.width  = src.width;
  c.height = heightPx;
  c.getContext('2d').drawImage(src, 0, topPx, src.width, heightPx, 0, 0, src.width, heightPx);
  return c.toDataURL('image/png');
}

// ── Positions DOM → pixels canvas ────────────────────────────────────────────
function getBlockBoundaries(element, scale) {
  const containerTop = element.getBoundingClientRect().top;
  // Éléments "bloc" qu'on ne veut pas couper
  const selector = 'h1, h2, h3, h4, p, table, ul, ol, blockquote, hr';
  return Array.from(element.querySelectorAll(selector)).map((el) => {
    const r = el.getBoundingClientRect();
    return {
      top: (r.top - containerTop) * scale,
      bottom: (r.bottom - containerTop) * scale,
    };
  });
}

// ── Trouver le meilleur point de coupe ───────────────────────────────────────
function findCutPoint(boundaries, idealCutPx, pageHeightPx) {
  // Si un bloc chevauche la coupure idéale → couper juste avant ce bloc
  for (const b of boundaries) {
    if (b.top < idealCutPx && b.bottom > idealCutPx) {
      // Remonter au début du bloc ; si ça rend la page trop petite → laisser couper après
      const candidate = b.top - 8;
      if (candidate > idealCutPx - pageHeightPx * 0.5) return candidate;
    }
  }
  return idealCutPx;
}

// ── Dessin header / footer ────────────────────────────────────────────────────
function drawHeaderFooter(pdf, pageNum, totalPages, docLabel) {
  const gray = [140, 140, 140];

  // Header
  pdf.setFontSize(7.5);
  pdf.setTextColor(...gray);
  pdf.text('Synapses ESMS', MARGIN_X, HEADER_Y);
  if (docLabel) pdf.text(docLabel, A4_W / 2, HEADER_Y, { align: 'center' });
  pdf.text('Document confidentiel', A4_W - MARGIN_X, HEADER_Y, { align: 'right' });
  pdf.setDrawColor(210, 210, 210);
  pdf.setLineWidth(0.25);
  pdf.line(MARGIN_X, HEADER_LINE_Y, A4_W - MARGIN_X, HEADER_LINE_Y);

  // Footer
  pdf.line(MARGIN_X, FOOTER_LINE_Y, A4_W - MARGIN_X, FOOTER_LINE_Y);
  pdf.setFontSize(7.5);
  pdf.setTextColor(...gray);
  pdf.text('Aide IA — Validation professionnelle obligatoire avant diffusion', MARGIN_X, FOOTER_Y);
  pdf.text(`${pageNum} / ${totalPages}`, A4_W - MARGIN_X, FOOTER_Y, { align: 'right' });
}

// ── Export principal ──────────────────────────────────────────────────────────
export async function downloadPdf({ element, filename, docLabel = '' }) {
  const SCALE = 2;

  // Mesurer les blocs DOM AVANT le rendu canvas (positions encore valides)
  const boundaries = getBlockBoundaries(element, SCALE);

  const canvas = await html2canvas(element, {
    scale: SCALE,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    // Pas de bordures arrondies qui créent des artefacts
    onclone: (doc) => {
      const el = doc.querySelector('[data-pdf-root]') || doc.body.firstElementChild;
      if (el) {
        el.style.borderRadius = '0';
        el.style.boxShadow = 'none';
      }
    },
  });

  const pxPerMm = canvas.width / CONTENT_W;
  const pageHeightPx = Math.round(CONTENT_H * pxPerMm);
  const totalPages = Math.ceil(canvas.height / pageHeightPx);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  let topPx   = 0;
  let pageNum = 1;

  while (topPx < canvas.height) {
    const idealBottom = topPx + pageHeightPx;
    const cutPx = idealBottom >= canvas.height
      ? canvas.height
      : findCutPoint(boundaries, idealBottom, pageHeightPx);

    const sliceH = Math.max(1, cutPx - topPx);
    const sliceHmm = sliceH / pxPerMm;

    if (pageNum > 1) pdf.addPage();

    pdf.addImage(
      sliceCanvas(canvas, topPx, sliceH),
      'PNG',
      MARGIN_X,
      MARGIN_TOP,
      CONTENT_W,
      sliceHmm,
    );

    drawHeaderFooter(pdf, pageNum, totalPages, docLabel);

    topPx = cutPx;
    pageNum++;
  }

  pdf.save(filename);
}
