import { useRef, useState, useCallback, useEffect } from 'react';
import { getWsUrl } from '../services/transcriptionService';

// AudioWorklet processor: runs in a dedicated audio thread.
// Converts Float32 input to Int16 PCM and batches to ~100ms chunks
// before posting to the main thread to reduce WS message frequency.
const WORKLET_CODE = `
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buf = [];
    this._target = 1600; // 100ms at 16kHz
  }
  process(inputs) {
    const ch = inputs[0]?.[0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) {
      const s = ch[i];
      this._buf.push(s < 0 ? Math.max(-32768, s * 32768) : Math.min(32767, s * 32767));
      if (this._buf.length >= this._target) {
        const pcm = new Int16Array(this._buf);
        this.port.postMessage(pcm.buffer, [pcm.buffer]);
        this._buf = [];
      }
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

// Returned by the hook:
//   start(lang?)  - open mic + WS, begin streaming
//   stop()        - close everything, returns final committed text
//   status        - 'idle' | 'connecting' | 'recording' | 'error'
//   committed     - stable, finalized transcript segments (never changes back)
//   interim       - current partial hypothesis (replaced on each interim event)
//   audioLevel    - 0–100, driven by the mic analyser

export function useStreamingTranscription() {
  const [status, setStatus]       = useState('idle');
  const [committed, setCommitted] = useState('');
  const [interim, setInterim]     = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Internal refs - never cause re-renders
  const wsRef          = useRef(null);
  const micStreamRef   = useRef(null);
  const audioCtxRef    = useRef(null);
  const workletRef     = useRef(null);
  const analyserRef    = useRef(null);
  const rafRef         = useRef(null);
  const activeRef      = useRef(false);
  const committedRef   = useRef(''); // mirror of `committed` state, stale-free

  const monitorLevel = useCallback(() => {
    if (!analyserRef.current || !activeRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setAudioLevel(Math.min(100, (avg / 255) * 150));
    rafRef.current = requestAnimationFrame(monitorLevel);
  }, []);

  const teardown = useCallback(() => {
    activeRef.current = false;

    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

    if (workletRef.current) {
      workletRef.current.port.onmessage = null;
      workletRef.current.disconnect();
      workletRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    analyserRef.current = null;

    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      try { ws.close(); } catch { /* ignore */ }
    }
  }, []);

  const start = useCallback(async (lang = 'fr-FR') => {
    committedRef.current = '';
    setCommitted('');
    setInterim('');
    setAudioLevel(0);
    setStatus('connecting');
    activeRef.current = true;

    try {
      // ── Microphone ─────────────────────────────────────────────────
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;

      // ── AudioContext at 16kHz (Google LINEAR16 native rate) ────────
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(micStream);

      // Analyser for the visual level meter
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // ── AudioWorklet: Float32 → batched Int16 PCM ──────────────────
      const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
      const url  = URL.createObjectURL(blob);
      await audioCtx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      const workletNode = new AudioWorkletNode(audioCtx, 'pcm-processor');
      workletRef.current = workletNode;
      source.connect(workletNode);

      // ── WebSocket ──────────────────────────────────────────────────
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'start', lang }));
        setStatus('recording');
        monitorLevel();

        // Forward PCM frames from worklet to WS
        workletNode.port.onmessage = (e) => {
          if (ws.readyState === WebSocket.OPEN && activeRef.current) {
            ws.send(e.data);
          }
        };
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'interim') {
            setInterim(msg.text);
          } else if (msg.type === 'final') {
            const sep = committedRef.current ? ' ' : '';
            committedRef.current += sep + msg.text;
            setCommitted(committedRef.current);
            setInterim('');
          } else if (msg.type === 'error') {
            console.error('[WS transcription]', msg.message);
          }
        } catch { /* ignore malformed frames */ }
      };

      ws.onerror = () => {
        if (activeRef.current) setStatus('error');
      };

      ws.onclose = () => {
        if (activeRef.current) {
          activeRef.current = false;
          setStatus('idle');
        }
      };

    } catch (err) {
      console.error('[useStreamingTranscription] start failed:', err);
      teardown();
      setStatus('error');
    }
  }, [teardown, monitorLevel]);

  // Returns the definitive committed text so callers can use it synchronously
  const stop = useCallback(() => {
    const finalCommitted = committedRef.current;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
    }
    teardown();
    setStatus('idle');
    setInterim('');
    setAudioLevel(0);

    return finalCommitted;
  }, [teardown]);

  // Auto-cleanup on unmount
  useEffect(() => () => teardown(), [teardown]);

  return { start, stop, status, committed, interim, audioLevel };
}
