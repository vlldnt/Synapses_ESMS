import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TableLayoutType,
  ShadingType,
  AlignmentType,
} from 'docx';

// ───────────────────────────────────────────────────────────
// 🎨 Styles
// ───────────────────────────────────────────────────────────

const BRAND_BLUE = '0D66D4';
const BRAND_BLUE_BG = 'DBEAFE';
const BORDER_COLOR = 'C8D9EF';
const ALT_ROW_BG = 'F8FAFC';

const CELL_BORDER = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: BORDER_COLOR,
};

const CELL_BORDERS = {
  top: CELL_BORDER,
  bottom: CELL_BORDER,
  left: CELL_BORDER,
  right: CELL_BORDER,
};

// ───────────────────────────────────────────────────────────
// ✏️ Inline bold (**text**)
// ───────────────────────────────────────────────────────────

function inlineRuns(text, size = 20) {
  return text
    .split(/(\*\*.+?\*\*)/g)
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^\*\*(.+)\*\*$/);
      return new TextRun({
        text: match ? match[1] : part,
        bold: !!match,
        size,
      });
    });
}

// ───────────────────────────────────────────────────────────
// 🧠 Markdown Parser SAFE
// ───────────────────────────────────────────────────────────

function parseMarkdown(text) {
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // ── TABLE ─────────────────────────────
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines = [];

      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      const clean = tableLines.filter((l) => !/^\|[-:| ]+\|$/.test(l));

      const parseRow = (l) => {
        const cells = l
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim())
          .filter((c) => c !== '');

        // 🔥 sécurité anti PDF cassé
        if (cells.length > 10) {
          return [l.replace(/\|/g, '').trim()];
        }

        return cells;
      };

      if (clean.length) {
        // Convert table to structured list format instead of table
        blocks.push({
          type: 'table-as-list',
          headers: parseRow(clean[0]),
          rows: clean.slice(1).map(parseRow),
        });
      }

      continue;
    }

    // ── HEADINGS ──────────────────────────
    const h = line.match(/^(#{1,3})\s+(.+)/);
    if (h) {
      blocks.push({ type: `h${h[1].length}`, text: h[2] });
      i++;
      continue;
    }

    // ── HR ────────────────────────────────
    if (/^-{3,}$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // ── BULLET ───────────────────────────
    if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({ type: 'bullet', text: line.slice(2) });
      i++;
      continue;
    }

    // ── EMPTY ────────────────────────────
    if (!line) {
      blocks.push({ type: 'empty' });
      i++;
      continue;
    }

    // ── PARAGRAPH ────────────────────────
    blocks.push({ type: 'paragraph', text: line });
    i++;
  }

  return blocks;
}

// ───────────────────────────────────────────────────────────
// 📊 TABLE DOCX FULL WIDTH
// ───────────────────────────────────────────────────────────

function buildDocxTable({ headers, rows }) {
  const colCount = headers.length || 1;

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          width: { size: 100 / colCount, type: WidthType.PERCENTAGE },
          borders: CELL_BORDERS,
          shading: {
            type: ShadingType.SOLID,
            fill: BRAND_BLUE_BG,
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: h,
                  bold: true,
                  size: 20,
                  color: BRAND_BLUE,
                }),
              ],
            }),
          ],
        }),
    ),
  });

  const dataRows = rows.map(
    (row, i) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              width: { size: 100 / colCount, type: WidthType.PERCENTAGE },
              borders: CELL_BORDERS,
              shading:
                i % 2
                  ? { type: ShadingType.SOLID, fill: ALT_ROW_BG }
                  : undefined,
              children: [
                new Paragraph({
                  children: inlineRuns(cell, 20),
                }),
              ],
            }),
        ),
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, // ✅ FULL WIDTH
    layout: TableLayoutType.AUTOFIT,
    rows: [headerRow, ...dataRows],
  });
}

// ───────────────────────────────────────────────────────────
// 📋 TABLE AS LIST (structured paragraphs)
// ───────────────────────────────────────────────────────────

function buildDocxTableAsList({ headers, rows }) {
  const paragraphs = [];

  // Add header row as intro line
  if (headers && headers.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: headers.join(' • '),
            bold: true,
            size: 20,
            color: BRAND_BLUE,
          }),
        ],
        spacing: { line: 360, after: 200 },
      }),
    );
  }

  // Add data rows as structured paragraphs
  rows.forEach((row, idx) => {
    const rowText = row
      .map((cell, colIdx) => {
        const header = headers[colIdx] || '';
        return header ? `${header}: ${cell}` : cell;
      })
      .join('\n');

    paragraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        children: inlineRuns(rowText),
        spacing: { line: 360, after: 240 },
      }),
    );
  });

  return paragraphs;
}

// ───────────────────────────────────────────────────────────
// 📄 Blocks → DOCX
// ───────────────────────────────────────────────────────────

function blocksToDocx(blocks) {
  return blocks.flatMap((block) => {
    switch (block.type) {
      case 'h1':
        return new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: block.text, bold: true, size: 32 })],
        });

      case 'h2':
        return new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: block.text, bold: true, size: 26 })],
        });

      case 'h3':
        return new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: block.text, bold: true, size: 22 })],
        });

      case 'hr':
        return new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_BLUE },
          },
        });

      case 'bullet':
        return new Paragraph({
          bullet: { level: 0 },
          children: inlineRuns(block.text),
        });

      case 'table':
        return [
          new Paragraph({ text: '' }),
          buildDocxTable(block),
          new Paragraph({ text: '' }),
        ];

      case 'table-as-list':
        // Convert table to structured list format
        return [
          new Paragraph({ text: '' }),
          ...buildDocxTableAsList(block),
          new Paragraph({ text: '' }),
        ];

      case 'empty':
        return new Paragraph({ text: '' });

      default:
        return new Paragraph({
          children: inlineRuns(block.text),
        });
    }
  });
}

// ───────────────────────────────────────────────────────────
// 📦 EXPORT DOCX
// ───────────────────────────────────────────────────────────

export async function downloadDocx({ text }) {
  const blocks = parseMarkdown(text);
  const body = blocksToDocx(blocks);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: body,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  return {
    blob,
    filename: `document.docx`,
  };
}

// ───────────────────────────────────────────────────────────
// ⬇️ DOWNLOAD
// ───────────────────────────────────────────────────────────

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
