export function detectDevice() {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

export function detectBrowser() {
  const ua = navigator.userAgent;
  if (/Safari/.test(ua) && !/Chrome|Chromium|OPR/.test(ua)) return 'Safari';
  if (/Chrome|Chromium|CriOS/.test(ua)) return 'Chrome';
  if (/OPR|Opera/.test(ua)) return 'Opera';
  if (/Edg/.test(ua)) return 'Edge';
  if (/Firefox|FxiOS/.test(ua)) return 'Firefox';
  if (/Brave/.test(ua)) return 'Brave';
  return 'Unknown';
}

const BROWSERS_WITHOUT_NATIVE_SPEECH = ['Brave', 'Edge', 'Firefox'];

export function shouldUseGoogleSpeech() {
  return BROWSERS_WITHOUT_NATIVE_SPEECH.includes(detectBrowser());
}

export async function streamTranscription(blob, onChunk) {
  const res = await fetch('/api/transcribe-stream', {
    method: 'POST',
    body: blob,
  });

  if (!res.body) throw new Error('Pas de réponse du serveur');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;

    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;

      const parsed = JSON.parse(payload);
      if (parsed?.error) throw new Error(parsed.error);
      if (parsed?.text) onChunk(parsed.text);
    }
  }
}
