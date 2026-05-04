import * as mammoth from 'mammoth/mammoth.browser';

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function extractPreviewTextFromDocxBase64(base64) {
  if (!base64) return '';

  try {
    const arrayBuffer = base64ToArrayBuffer(base64);
    const result = await mammoth.extractRawText({ arrayBuffer });
    return (result.value || '').trim();
  } catch (error) {
    console.error('Failed to extract preview from DOCX base64:', error);
    return '';
  }
}
