import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  BorderStyle, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType,
} from 'docx';
import { saveToHistory } from '../services/historyService';

// ─── Constantes de style ────────────────────────────────────────────────────

// Largeur utile en twips pour A4 avec marges 2 cm de chaque côté
// A4 = 11906 twips, marges = 1134 twips × 2 → utile ≈ 9638 twips
const PAGE_WIDTH_TWIPS = 9638;

const BRAND_BLUE   = '0D66D4';
const BRAND_BLUE_BG = 'DBEAFE'; // fond en-tête tableau
const BORDER_COLOR = 'C8D9EF';
const ALT_ROW_BG   = 'F8FAFC';

const CELL_BORDER = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: BORDER_COLOR,
};
const CELL_BORDERS = {
  top: CELL_BORDER, bottom: CELL_BORDER,
  left: CELL_BORDER, right: CELL_BORDER,
};

// ─── Helpers inline (bold **…**) ────────────────────────────────────────────

function inlineRuns(text, baseSize = 20) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts
    .filter((p) => p !== '')
    .map((part) => {
      const m = part.match(/^\*\*(.+)\*\*$/);
      return m
        ? new TextRun({ text: m[1], bold: true, size: baseSize })
        : new TextRun({ text: part, size: baseSize });
    });
}

// ─── Parser Markdown → blocs sémantiques ─────────────────────────────────

/**
 * Convertit une chaîne Markdown en tableau de blocs typés.
 * Gère : titres (#/##/###), **gras**, ----, listes, tableaux GFM, paragraphes.
 */
function parseMarkdown(text) {
  const rawLines = text.split('\n');
  const blocks = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // ── Tableau Markdown (lignes | … |) ─────────────────────────────────
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      const tableLines = [];
      while (i < rawLines.length) {
        const t = rawLines[i].trim();
        if (t.startsWith('|') && t.endsWith('|')) {
          tableLines.push(t);
          i++;
        } else {
          break;
        }
      }
      // Filtrer la ligne séparateur (|---|---|)
      const contentLines = tableLines.filter(
        (l) => !/^\|[-:| ]+\|$/.test(l),
      );
      if (contentLines.length > 0) {
        const parseRow = (l) =>
          l
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());
        blocks.push({
          type: 'table',
          headers: parseRow(contentLines[0]),
          rows: contentLines.slice(1).map(parseRow),
        });
      }
      continue;
    }

    // ── Titres # / ## / ### ─────────────────────────────────────────────
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      blocks.push({
        type: `h${headingMatch[1].length}`,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // ── Titre **gras seul** ───────────────────────────────────────────────
    const boldTitle = trimmed.match(/^\*\*(.+)\*\*$/);
    if (boldTitle) {
      blocks.push({ type: 'h1', text: boldTitle[1] });
      i++;
      continue;
    }

    // ── Séparateur --- ────────────────────────────────────────────────────
    if (/^-{3,}$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // ── Bullet **label**: valeur ──────────────────────────────────────────
    const bulletBold = trimmed.match(/^[*-]\s+\*\*(.+?):\*\*\s*(.*)/);
    if (bulletBold) {
      blocks.push({ type: 'bullet-bold', label: bulletBold[1], value: bulletBold[2] });
      i++;
      continue;
    }

    // ── Bullet simple ─────────────────────────────────────────────────────
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({ type: 'bullet', text: trimmed.slice(2) });
      i++;
      continue;
    }

    // ── Ligne vide ────────────────────────────────────────────────────────
    if (trimmed === '') {
      blocks.push({ type: 'empty' });
      i++;
      continue;
    }

    // ── Paragraphe ───────────────────────────────────────────────────────
    blocks.push({ type: 'paragraph', text: trimmed });
    i++;
  }

  return blocks;
}

// ─── Rendu DOCX d'un tableau Markdown ────────────────────────────────────

function buildDocxTable({ headers, rows }) {
  const colCount = headers.length || 1;
  const colWidth = Math.floor(PAGE_WIDTH_TWIPS / colCount);

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h) =>
      new TableCell({
        width: { size: colWidth, type: WidthType.DXA },
        borders: CELL_BORDERS,
        shading: { type: ShadingType.SOLID, fill: BRAND_BLUE_BG, color: BRAND_BLUE_BG },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: h, bold: true, size: 18, color: BRAND_BLUE }),
            ],
          }),
        ],
      }),
    ),
  });

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell) =>
        new TableCell({
          width: { size: colWidth, type: WidthType.DXA },
          borders: CELL_BORDERS,
          shading:
            ri % 2 === 1
              ? { type: ShadingType.SOLID, fill: ALT_ROW_BG, color: ALT_ROW_BG }
              : undefined,
          children: [
            new Paragraph({
              spacing: { before: 80, after: 80 },
              children: inlineRuns(cell, 18),
            }),
          ],
        }),
      ),
    }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ─── Blocs Markdown → éléments DOCX ─────────────────────────────────────

function blocksToDocx(blocks) {
  return blocks.flatMap((block) => {
    switch (block.type) {
      case 'h1':
        return new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 320, after: 120 },
          children: [
            new TextRun({ text: block.text, bold: true, size: 28, color: BRAND_BLUE }),
          ],
        });

      case 'h2':
        return new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 80 },
          children: [
            new TextRun({ text: block.text, bold: true, size: 22 }),
          ],
        });

      case 'h3':
        return new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 60 },
          children: [
            new TextRun({ text: block.text, bold: true, size: 20 }),
          ],
        });

      case 'hr':
        return new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_BLUE },
          },
          spacing: { before: 120, after: 120 },
          text: '',
        });

      case 'bullet-bold':
        return new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({ text: `${block.label} : `, bold: true, size: 20 }),
            new TextRun({ text: block.value, size: 20 }),
          ],
        });

      case 'bullet':
        return new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 60, after: 60 },
          children: inlineRuns(block.text),
        });

      case 'table':
        return [
          new Paragraph({ text: '', spacing: { before: 160 } }),
          buildDocxTable({ headers: block.headers, rows: block.rows }),
          new Paragraph({ text: '', spacing: { after: 160 } }),
        ];

      case 'empty':
        return new Paragraph({ text: '', spacing: { before: 60 } });

      default:
        return new Paragraph({
          spacing: { before: 80, after: 80 },
          children: inlineRuns(block.text),
        });
    }
  });
}

// ─── En-tête professionnel du document ───────────────────────────────────

function buildDocumentHeader({ companyName, interventionType, educatorName, date }) {
  const formattedDate = date
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        .format(new Date(date))
    : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        .format(new Date());

  return [
    // Nom de l'établissement
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({ text: companyName || 'Établissement ESMS', bold: true, size: 28, color: BRAND_BLUE }),
      ],
    }),
    // Titre document
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 80 },
      children: [
        new TextRun({ text: 'COMPTE RENDU D\'INTERVENTION', bold: true, size: 24, color: '374151' }),
      ],
    }),
    // Métadonnées
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({ text: interventionType || '', size: 18, color: '6B7280' }),
        new TextRun({ text: '  ·  ', size: 18, color: 'D1D5DB' }),
        new TextRun({ text: formattedDate, size: 18, color: '6B7280' }),
        ...(educatorName ? [
          new TextRun({ text: '  ·  ', size: 18, color: 'D1D5DB' }),
          new TextRun({ text: educatorName, size: 18, color: '6B7280' }),
        ] : []),
      ],
    }),
    // Séparateur
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BRAND_BLUE } },
      spacing: { before: 80, after: 240 },
      text: '',
    }),
  ];
}

// ─── Export principal ─────────────────────────────────────────────────────

/**
 * Génère et télécharge le fichier .docx, puis sauvegarde dans l'historique.
 *
 * @param {object} params
 * @param {string} params.text           - Texte Markdown du compte rendu
 * @param {string} [params.date]         - Date de l'intervention (ISO)
 * @param {string} [params.interventionType]
 * @param {string} [params.structureType]
 * @param {string} [params.companyName]
 * @param {string} [params.educatorName]
 * @param {string} [params.modelId]
 * @param {string} [params.modelName]
 */
export async function downloadDocx({
  text,
  date,
  interventionType,
  structureType,
  companyName,
  educatorName,
  modelId,
  modelName,
}) {
  const today = date || new Date().toISOString().slice(0, 10);
  const blocks = parseMarkdown(text);

  const header = buildDocumentHeader({ companyName, interventionType, educatorName, date });
  const body = blocksToDocx(blocks);

  const usedModel = modelName || modelId || 'mistralai/voxtral-small-24b-2507';

  // Mention RGPD en pied de document
  const footer = [
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' } },
      spacing: { before: 320, after: 80 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Rédigé avec l\'aide de l\'IA · Validation humaine obligatoire avant diffusion · Conforme RGPD',
          size: 16,
          color: '9CA3AF',
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 20, after: 0 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Genere par modele : ', size: 16, color: '9CA3AF', italics: true }),
        new TextRun({ text: usedModel, size: 16, color: '6B7280', italics: true, bold: true }),
      ],
    }),
  ];

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: { font: 'Calibri', size: 20 },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          run: { bold: true, size: 28, color: BRAND_BLUE, font: 'Calibri' },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children: [...header, ...body, ...footer],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const slug = (companyName || 'CR').replace(/\s+/g, '-').slice(0, 30);
  const filename = `CR_${slug}_${today}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  saveToHistory({
    text,
    date: today,
    interventionType,
    structureType,
    companyName,
    educatorName,
    filename,
  });
}
