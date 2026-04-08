import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  BorderStyle,
} from 'docx';
import { saveToHistory } from '../services/historyService';

function parseMarkdown(text) {
  return text.split('\n').map((line) => {
    const trimmed = line.trim();

    // H1 bold : **Titre**
    const h1Match = trimmed.match(/^\*\*(.+)\*\*$/);
    if (h1Match) {
      return { type: 'h1', text: h1Match[1] };
    }

    // Ligne de séparation ---
    if (/^-{3,}$/.test(trimmed)) {
      return { type: 'hr' };
    }

    // Bullet avec bold label : - **Label :** valeur
    const bulletBoldMatch = trimmed.match(/^- \*\*(.+?):\*\*\s*(.*)/);
    if (bulletBoldMatch) {
      return { type: 'bullet-bold', label: bulletBoldMatch[1], value: bulletBoldMatch[2] };
    }

    // Bullet simple : - texte
    if (trimmed.startsWith('- ')) {
      return { type: 'bullet', text: trimmed.slice(2) };
    }

    // Ligne vide
    if (trimmed === '') {
      return { type: 'empty' };
    }

    // Paragraphe avec bold inline **...**
    return { type: 'paragraph', text: trimmed };
  });
}

function inlineRuns(text) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part) => {
    const boldMatch = part.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) return new TextRun({ text: boldMatch[1], bold: true });
    return new TextRun({ text: part });
  });
}

export async function downloadDocx({ text, reference, date, structureType, interventionType }) {
  const lines = parseMarkdown(text);

  const children = lines.map((line) => {
    switch (line.type) {
      case 'h1':
        return new Paragraph({
          text: line.text,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        });

      case 'hr':
        return new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB' } },
          spacing: { before: 100, after: 100 },
        });

      case 'bullet-bold':
        return new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: `${line.label} : `, bold: true }),
            new TextRun({ text: line.value }),
          ],
          spacing: { before: 60, after: 60 },
        });

      case 'bullet':
        return new Paragraph({
          bullet: { level: 0 },
          children: inlineRuns(line.text),
          spacing: { before: 60, after: 60 },
        });

      case 'empty':
        return new Paragraph({ text: '' });

      default:
        return new Paragraph({
          children: inlineRuns(line.text),
          spacing: { before: 80, after: 80 },
        });
    }
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `CR_${reference || 'intervention'}_${date || new Date().toISOString().slice(0, 10)}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  saveToHistory({ text, reference, date, structureType, interventionType, filename });
}
