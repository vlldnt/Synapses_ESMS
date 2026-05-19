import { useRef, useState, useCallback, useEffect } from "react";
import { MicrophoneButtonCompact } from "./MicrophoneButton";
import { detectBrowser, shouldUseGoogleSpeech } from "../services/transcriptionService";
import { useStreamingTranscription } from "../hooks/useStreamingTranscription";

// ─── Native Web Speech API path (Chrome / Safari) ────────────────────────────
// Uses the browser's built-in recognizer: low latency, no round-trip.
// Interim results are shown in real-time; final results are committed.

function useNativeRecognition({ baseTextRef, onChange, onNetworkError }) {
  const recRef             = useRef(null);
  const committedRef       = useRef('');
  const onNetworkErrorRef  = useRef(onNetworkError);
  const [interim, setInterim] = useState('');
  const [active, setActive]   = useState(false);

  // Keep the callback ref fresh without rebuilding start/stop
  useEffect(() => { onNetworkErrorRef.current = onNetworkError; }, [onNetworkError]);

  const push = useCallback((committed, interimText) => {
    const base = baseTextRef.current;
    const text = committed + (interimText ? (committed ? ' ' : '') + interimText : '');
    onChange(base ? base + (text ? ' ' + text : '') : text);
  }, [baseTextRef, onChange]);

  const start = useCallback((lang = 'fr-FR') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return false;

    committedRef.current = '';
    setInterim('');

    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    recRef.current = rec;

    rec.onresult = (event) => {
      let newCommitted = '';
      let currentInterim = '';

      for (const result of event.results) {
        if (result.isFinal) {
          newCommitted += (newCommitted ? ' ' : '') + result[0].transcript.trim();
        } else {
          currentInterim = result[0].transcript.trim();
        }
      }

      if (newCommitted) committedRef.current = newCommitted;
      setInterim(currentInterim);
      push(committedRef.current, currentInterim);
    };

    rec.onerror = (e) => {
      // Chrome throws 'network' when its cloud recognizer is unreachable → fall back to WS
      if (e.error === 'network' || e.error === 'service-not-available') {
        rec.abort();
        onNetworkErrorRef.current?.();
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.error('[SpeechRecognition]', e.error);
      }
    };

    rec.onend = () => setActive(false);

    rec.start();
    setActive(true);
    return true;
  }, [push]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setActive(false);
    setInterim('');
    // Commit final value (no interim)
    const base = baseTextRef.current;
    const committed = committedRef.current;
    onChange(base ? base + (committed ? ' ' + committed : '') : committed);
    return committedRef.current;
  }, [baseTextRef, onChange]);

  return { start, stop, active, interim };
}

// ─── TranscriptionInput ───────────────────────────────────────────────────────

export function TranscriptionInput({
  value,
  onChange,
  placeholder = "Dictez ou saisissez vos observations",
  rows = 8,
  disabled = false,
  variant = "textarea",
  onStatusChange,
}) {
  const [status, setStatus]             = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSoundDetected, setIsSoundDetected] = useState(false);

  const baseTextRef   = useRef("");
  const pathRef       = useRef("idle"); // 'native' | 'ws'
  const textareaRef   = useRef(null);

  // ── WS streaming path (Brave / Firefox / Edge / native API fallback) ─────────
  const ws = useStreamingTranscription();

  // Stable references to ws and native actions (useCallback inside the hooks)
  const wsStartRef = useRef(ws.start);
  useEffect(() => { wsStartRef.current = ws.start; }, [ws.start]);

  const nativeRef = useRef(null);

  // Called when Chrome's Web Speech API returns a 'network' error → switch to WS
  const handleNetworkError = useCallback(async () => {
    // CRITICAL: Stop native path properly before switching to WS
    // If we don't, both paths will call onChange and create a race condition
    nativeRef.current?.stop();

    pathRef.current = 'ws';
    try {
      await wsStartRef.current('fr-FR');
    } catch {
      setErrorMessage("Service indisponible");
      setStatus("idle");
      pathRef.current = 'idle';
    }
  }, []);

  // ── Native path ──────────────────────────────────────────────────────────────
  const native = useNativeRecognition({ baseTextRef, onChange, onNetworkError: handleNetworkError });
  nativeRef.current = native;  // keep ref up to date for fallback handler

  // Propagate recording status upward
  useEffect(() => { onStatusChange?.(status); }, [status, onStatusChange]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);
  useEffect(autoResize, [value, autoResize]);

  // Keep textarea display updated while WS is active:
  //   show committed + interim as one seamless stream
  useEffect(() => {
    if (pathRef.current !== 'ws') return;
    const base = baseTextRef.current;
    const text = ws.committed + (ws.interim ? (ws.committed ? ' ' : '') + ws.interim : '');
    const full = base ? base + (text ? ' ' + text : '') : text;
    onChange(full);
  }, [ws.committed, ws.interim, onChange]);

  // Track sound detection from WS audio level
  useEffect(() => {
    setIsSoundDetected(ws.audioLevel > 20);
  }, [ws.audioLevel]);

  // Handle WS disconnection mid-session
  useEffect(() => {
    if (pathRef.current !== 'ws') return;
    if (ws.status === 'error') {
      setErrorMessage("Connexion interrompue - réessayez");
      setStatus("idle");
      pathRef.current = 'idle';
    }
  }, [ws.status]);

  // ── Start ─────────────────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setErrorMessage("");
    baseTextRef.current = String(value || "").trim();

    const useNative = !shouldUseGoogleSpeech() && native.start('fr-FR');

    if (useNative) {
      pathRef.current = 'native';
      setStatus("recording");
      return;
    }

    pathRef.current = 'ws';
    setStatus("recording");

    try {
      await ws.start('fr-FR');
    } catch (err) {
      console.error(err);
      setErrorMessage("Micro non autorisé ou service indisponible");
      setStatus("idle");
      pathRef.current = 'idle';
    }
  }, [value, native, ws]);

  // ── Stop ──────────────────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (pathRef.current === 'native') {
      native.stop();
    } else if (pathRef.current === 'ws') {
      // CRITICAL: Capture final text BEFORE ws.stop() clears interim
      // ws.stop() triggers setInterim('') which would lose the last partial text
      const base = baseTextRef.current;
      const finalText = ws.committed + (ws.interim ? (ws.committed ? ' ' : '') + ws.interim : '');
      const full = base ? base + (finalText ? ' ' + finalText : '') : finalText;

      ws.stop();
      onChange(full);  // Ensure final text is saved, not lost to interim clearing
    }
    pathRef.current = 'idle';
    setStatus("idle");
    setIsSoundDetected(false);
  }, [native, ws, onChange]);

  const handleClick = () => {
    if (status === "recording") stopRecording();
    else startRecording();
  };

  const audioLevel   = pathRef.current === 'ws' ? ws.audioLevel : 0;
  const isRecording  = status === "recording";

  // ── Variants ──────────────────────────────────────────────────────────────────

  if (variant === "header-button") {
    return (
      <MicrophoneButtonCompact
        status={status}
        onClick={handleClick}
        disabled={disabled}
        size={20}
        isSoundDetected={isSoundDetected}
        audioLevel={audioLevel}
      />
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex flex-col items-center gap-2">
        <MicrophoneButtonCompact
          status={status}
          onClick={handleClick}
          disabled={disabled}
          isSoundDetected={isSoundDetected}
          audioLevel={audioLevel}
        />
      </div>
    );
  }

  // ── Textarea variant ──────────────────────────────────────────────────────────
  // The textarea value shows the full live text (committed + interim merged).
  // Interim text appears slightly dimmed via the CSS class below when recording.

  const showInterim = isRecording && (
    (pathRef.current === 'native' && native.interim) ||
    (pathRef.current === 'ws'     && ws.interim)
  );

  return (
    <div className="w-full">
      <div className="flex gap-3 w-full relative">
        <textarea
          ref={textareaRef}
          value={value}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          className={[
            "w-full flex-1 bg-transparent outline-none",
            "text-[12px] md:text-[14px] text-black",
            "resize-none overflow-hidden dark:text-white",
            showInterim ? "opacity-80" : "",
          ].join(" ")}
          onChange={(e) => onChange(e.target.value)}
          onInput={autoResize}
        />

        <div className="shrink-0 hidden md:flex items-center">
          <MicrophoneButtonCompact
            status={status}
            onClick={handleClick}
            disabled={disabled}
            isSoundDetected={isSoundDetected}
            audioLevel={audioLevel}
          />
        </div>
      </div>

      {errorMessage && (
        <p className="mt-1 text-[11px] text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}

export default TranscriptionInput;
