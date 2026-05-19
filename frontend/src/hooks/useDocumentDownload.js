import { useState } from 'react';
import { triggerDownload } from '../utils/wordExport';
import { downloadPdf } from '../utils/pdfExport';

export function useDocumentDownload() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(filename) {
    setToast(filename);
    setTimeout(() => setToast(null), 32000);
  }

  async function handleDownload(format = 'word', doc, previewElement = null) {
    if (!doc?.docx_base_64) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    try {
      if (format === 'pdf') {
        if (!previewElement) return;
        const baseName = (doc.filename || 'document').replace(/\.[^.]+$/, '');
        const filename = `${baseName}.pdf`;
        await downloadPdf({ element: previewElement, filename, docLabel: baseName });
        showToast(filename);
      } else {
        const binaryString = atob(doc.docx_base_64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const filename = doc.filename?.endsWith('.docx') ? doc.filename : `${doc.filename || 'document'}.docx`;
        triggerDownload(blob, filename);
        showToast(filename);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { handleDownload, isLoading, toast, clearToast: () => setToast(null) };
}
