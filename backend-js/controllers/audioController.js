import { Router } from 'express';
import speech from '@google-cloud/speech';
import multer from 'multer';
import { WebSocketServer } from 'ws';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

let speechClient;

export function initializeSpeechClient(keyFilename) {
  try {
    speechClient = new speech.SpeechClient({ keyFilename });
    console.log(`✅ Google Cloud Speech client initialized`);
  } catch (err) {
    console.error(`❌ Failed to initialize Google Cloud Speech client:`, err.message);
  }
}

// POST /api/transcribe-chunk
router.post('/transcribe-chunk', (req, res) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', async () => {
    try {
      const buffer = Buffer.concat(chunks);
      if (buffer.length === 0) return res.json({ text: '' });
      const [response] = await speechClient.recognize({
        config: { encoding: 'WEBM_OPUS', sampleRateHertz: 48000, languageCode: 'fr-FR', enableAutomaticPunctuation: true },
        audio: { content: buffer.toString('base64') },
      });
      const text = response.results?.map((r) => r.alternatives?.[0]?.transcript)?.filter(Boolean)?.join(' ') || '';
      res.json({ text });
    } catch (err) {
      console.error('❌ Chunk transcription error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
  req.on('error', () => res.status(500).json({ error: 'Request error' }));
});

// POST /api/transcribe-stream
router.post('/transcribe-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const audioChunks = [];
  req.on('data', (chunk) => audioChunks.push(chunk));
  req.on('end', async () => {
    try {
      const audioBuffer = Buffer.concat(audioChunks);
      if (audioBuffer.length === 0) {
        res.write(`data: ${JSON.stringify({ error: 'No audio' })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }
      const [response] = await speechClient.recognize({
        config: { encoding: 'WEBM_OPUS', sampleRateHertz: 48000, languageCode: 'fr-FR' },
        audio: { content: audioBuffer.toString('base64') },
      });
      if (response.results?.length > 0) {
        for (const result of response.results) {
          const transcript = result.alternatives?.[0]?.transcript || '';
          if (transcript) res.write(`data: ${JSON.stringify({ text: transcript, isFinal: result.isFinal })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      console.error('❌ Stream transcription error:', err.message || err);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  });
  req.on('error', () => res.end());
});

// POST /api/transcribe-audio
router.post('/transcribe-audio', (req, res) => {
  let audioChunks = [];
  req.on('data', (chunk) => audioChunks.push(chunk));
  req.on('end', async () => {
    try {
      const audioBuffer = Buffer.concat(audioChunks);
      if (audioBuffer.length === 0) return res.json({ transcript: '' });
      const [response] = await speechClient.recognize({
        config: { encoding: 'WEBM_OPUS', sampleRateHertz: 16000, languageCode: 'fr-FR' },
        audio: { content: audioBuffer.toString('base64') },
      });
      const transcription = response.results?.map((r) => r.alternatives?.[0]?.transcript)?.filter(Boolean)?.join(' ') || '';
      res.json({ transcript: transcription });
    } catch (err) {
      console.error('❌ Transcription error:', err.message);
      res.status(500).json({ error: 'Transcription failed', message: err.message });
    }
  });
  req.on('error', () => res.status(500).json({ error: 'Request failed' }));
});

// POST /api/transcribe-audio-upload
router.post('/transcribe-audio-upload', upload.single('file'), async (req, res) => {
  try {
    if (req.query?.mock === '1' || req.query?.mock === 'true') {
      return res.json({ transcript: 'Transcription simulée : bonjour ceci est un test' });
    }
    if (!req.file?.buffer) return res.status(400).json({ error: 'No audio file provided' });
    const audioBuffer = req.file.buffer;
    if (audioBuffer.length === 0) return res.json({ transcript: '' });
    const [response] = await speechClient.recognize({
      config: { encoding: 'WEBM_OPUS', sampleRateHertz: 16000, languageCode: 'fr-FR' },
      audio: { content: audioBuffer.toString('base64') },
    });
    const transcription = response.results?.map((r) => r.alternatives?.[0]?.transcript)?.filter(Boolean)?.join(' ') || '';
    res.json({ transcript: transcription });
  } catch (err) {
    console.error('❌ Transcription (upload) error:', err.message || err);
    res.status(500).json({ error: 'Transcription failed', message: err.message });
  }
});

export function setupWebSocketTranscription(server) {
  const STREAM_RESTART_MS = 270_000;
  const wss = new WebSocketServer({ server, path: '/api/transcribe-ws' });

  wss.on('connection', (ws) => {
    let recognizeStream = null;
    let restartTimer = null;
    let isActive = false;
    let lang = 'fr-FR';

    function send(obj) {
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
    }

    function closeGoogleStream() {
      clearTimeout(restartTimer);
      if (recognizeStream) {
        try { recognizeStream.end(); } catch { /* ignore */ }
        recognizeStream = null;
      }
    }

    function openGoogleStream() {
      if (!speechClient) {
        send({ type: 'error', message: 'Speech client unavailable — check google-key.json' });
        return;
      }
      try {
        recognizeStream = speechClient.streamingRecognize({
          config: { encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: lang, enableAutomaticPunctuation: true, model: 'latest_long' },
          interimResults: true,
        });
        recognizeStream.on('data', (data) => {
          const result = data.results?.[0];
          if (!result) return;
          const text = result.alternatives?.[0]?.transcript?.trim();
          if (text) send({ type: result.isFinal ? 'final' : 'interim', text });
        });
        recognizeStream.on('error', (err) => {
          console.error('❌ streamingRecognize error:', err.message);
          recognizeStream = null;
          if (isActive) { send({ type: 'error', message: err.message }); setTimeout(openGoogleStream, 500); }
        });
        recognizeStream.on('end', () => { recognizeStream = null; if (isActive) openGoogleStream(); });
        restartTimer = setTimeout(() => { if (isActive) { closeGoogleStream(); openGoogleStream(); } }, STREAM_RESTART_MS);
      } catch (err) {
        console.error('❌ Failed to open streamingRecognize:', err.message);
        send({ type: 'error', message: err.message });
      }
    }

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        if (recognizeStream && isActive) { try { recognizeStream.write(data); } catch { /* restarting */ } }
      } else {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'start') { lang = msg.lang || 'fr-FR'; isActive = true; openGoogleStream(); }
          else if (msg.type === 'stop') { isActive = false; closeGoogleStream(); }
        } catch { /* ignore malformed frames */ }
      }
    });

    ws.on('close', () => { isActive = false; closeGoogleStream(); });
    ws.on('error', () => { isActive = false; closeGoogleStream(); });
  });
}

export default router;
