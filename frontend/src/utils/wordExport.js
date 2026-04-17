import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  Header,
} from 'docx';

const BRAND_BLUE = '0D66D4';

function inlineRuns(text, size = 20) {
  return String(text || '')
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

function decodeHtmlEntities(text) {
  if (!text) return '';

  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function cleanHtmlCellContent(raw = '') {
  return decodeHtmlEntities(
    raw
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function parseHtmlTable(tableHtml) {
  const rows = [];
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = [];
    const types = [];
    const cellRegex = /<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      types.push(cellMatch[1].toLowerCase());
      cells.push(cleanHtmlCellContent(cellMatch[2]));
    }

    if (cells.length > 0) {
      rows.push({ cells, hasHeaderCell: types.includes('th') });
    }
  }

  if (!rows.length) return null;

  const headerIndex = rows.findIndex((r) => r.hasHeaderCell);
  if (headerIndex >= 0) {
    return {
      headers: rows[headerIndex].cells,
      rows: rows.filter((_, idx) => idx !== headerIndex).map((r) => r.cells),
    };
  }

  return {
    headers: rows[0].cells,
    rows: rows.slice(1).map((r) => r.cells),
  };
}

function parseMarkdown(text) {
  const lines = String(text || '').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.includes('<table')) {
      let htmlChunk = lines[i];
      let openCount = (htmlChunk.match(/<table\b/gi) || []).length;
      let closeCount = (htmlChunk.match(/<\/table>/gi) || []).length;
      i++;

      while (i < lines.length && closeCount < openCount) {
        htmlChunk += `\n${lines[i]}`;
        openCount += (lines[i].match(/<table\b/gi) || []).length;
        closeCount += (lines[i].match(/<\/table>/gi) || []).length;
        i++;
      }

      const tableMatch = htmlChunk.match(/<table\b[\s\S]*?<\/table>/i);
      if (tableMatch) {
        const parsedTable = parseHtmlTable(tableMatch[0]);
        if (parsedTable && parsedTable.headers.length) {
          blocks.push({ type: 'table', headers: parsedTable.headers, rows: parsedTable.rows });
          continue;
        }
      }

      blocks.push({ type: 'paragraph', text: cleanHtmlCellContent(htmlChunk) });
      continue;
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines = [];

      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      const clean = tableLines.filter((l) => !/^\|[-:| ]+\|$/.test(l));
      const parseRow = (l) => l.slice(1, -1).split('|').map((c) => c.trim());

      if (clean.length) {
        blocks.push({
          type: 'table',
          headers: parseRow(clean[0]),
          rows: clean.slice(1).map(parseRow),
        });
      }

      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.+)/);
    if (h) {
      blocks.push({ type: `h${h[1].length}`, text: h[2] });
      i++;
      continue;
    }

    if (/^-{3,}$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({ type: 'bullet', text: line.slice(2) });
      i++;
      continue;
    }

    if (!line) {
      blocks.push({ type: 'empty' });
      i++;
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
    i++;
  }

  return blocks;
}

function buildDocxTableAsList({ headers, rows }) {
  const paragraphs = [];

  rows.forEach((row, idx) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Action ${idx + 1}`,
            bold: true,
            color: BRAND_BLUE,
            size: 22,
          }),
        ],
        spacing: { before: 160, after: 80 },
      }),
    );

    row.forEach((cell, colIdx) => {
      const header = headers[colIdx] || `Champ ${colIdx + 1}`;
      const value = cell || 'Non renseigne';
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${header}: `, bold: true, size: 20 }),
            new TextRun({ text: value, size: 20 }),
          ],
          spacing: { line: 320, after: 60 },
        }),
      );
    });
  });

  return paragraphs;
}

function blocksToDocx(blocks) {
  const docxBlocks = [];

  blocks.forEach((block) => {
    switch (block.type) {
      case 'h1':
        docxBlocks.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: block.text, bold: true, size: 32 })],
          }),
        );
        break;

      case 'h2':
        docxBlocks.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: block.text, bold: true, size: 26 })],
          }),
        );
        break;

      case 'h3':
        docxBlocks.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun({ text: block.text, bold: true, size: 22 })],
          }),
        );
        break;

      case 'hr':
        docxBlocks.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_BLUE },
            },
          }),
        );
        break;

      case 'bullet':
        docxBlocks.push(
          new Paragraph({
            bullet: { level: 0 },
            children: inlineRuns(block.text),
          }),
        );
        break;

      case 'table':
      case 'table-as-list':
        docxBlocks.push(new Paragraph({ text: '' }));
        docxBlocks.push(...buildDocxTableAsList(block));
        docxBlocks.push(new Paragraph({ text: '' }));
        break;

      case 'empty':
        docxBlocks.push(new Paragraph({ text: '' }));
        break;

      default:
        docxBlocks.push(
          new Paragraph({
            children: inlineRuns(block.text),
          }),
        );
        break;
    }
  });

  return docxBlocks;
}

function generateReportFilename(childName, educatorName, date) {
  const nameToUse = childName || educatorName || 'Document';
  const parts = (nameToUse || '').trim().split(/\s+/);
  const firstName = parts[0] || 'Document';
  const lastName = parts[parts.length - 1] || '';
  const firstLetterLastName = lastName[0]?.toUpperCase() || 'X';

  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  const type = 'CRI';
  const filename = `${type}_${firstName}_${firstLetterLastName}-${formattedDate}.docx`;
  const displayName = `${type} ${firstName} ${firstLetterLastName} ${formattedDate}`;

  return { filename, displayName };
}

export async function downloadDocx({ text, childName, educatorName, date, ...rest }) {
  const cleanText = String(text || '')
    .replace(
      /Aide IA – Validation humaine obligatoire avant diffusion\. Aucune donnée personnelle identifiable ne doit être utilisée\.\n*/gi,
      '',
    )
    .replace(/Redige avec l'aide de l'IA – a relire et valider par un·e professionnel·le\./gi, '')
    .replace(/Rédigé avec l'aide de l'IA – à relire et valider par un·e professionnel·le\./gi, '')
    .replace(/TABLEAU\s+R[EÉ]CAPITULATIF\s+OBLIGATOIRE\s+DES\s+OBJECTIFS\s*\n*/gi, '')
    .replace(/^\s*\|?\s*Objectif opérationnel\s*\|\s*Action prévue\s*\|\s*Responsable\s*\|\s*Modalités\s*\|\s*Fréquence\s*\|\s*Échéance\s*\(.*?\)\s*\|\s*Indicateur d['’]évaluation\s*\|?\s*$/gim, '')
    .replace(/^\s*\|[-:| ]+\|\s*$/gim, '')
    .replace(/^\s*Structure des actions\s*:\s*.*$/gim, '')
    .replace(/\n{3,}/g, '\n\n');

  const blocks = parseMarkdown(cleanText);
  const body = blocksToDocx(blocks);

  const educatorInfo = educatorName
    ? `${educatorName}${rest.educatorRole ? ` - ${rest.educatorRole}` : ''}`
    : '';

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margins: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: `Référence: ${childName || '—'} | Professionnel: ${educatorInfo || '—'}`,
                style: 'header',
                spacing: { before: 100, after: 100 },
                border: {
                  bottom: {
                    color: 'CCCCCC',
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              }),
            ],
          }),
        },
        children: body,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const { filename, displayName } = generateReportFilename(childName, educatorName, date);

  return {
    blob,
    filename,
    displayName,
    date,
    interventionType: rest.interventionType,
    companyName: rest.companyName,
    educatorName,
    modelId: rest.modelId,
    modelName: rest.modelName,
  };
}

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
