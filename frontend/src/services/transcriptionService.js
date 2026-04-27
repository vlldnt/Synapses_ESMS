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

const BASE = import.meta.env.VITE_BASENAME || '';

export function getWsUrl() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}/api/transcribe-ws`;
}

// Send a single audio chunk (webm blob) and get back transcribed text immediately.
export async function transcribeChunk(blob) {
  const res = await fetch(`${BASE}/api/transcribe-chunk`, {
    method: 'POST',
    body: blob,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.text || '';
}
