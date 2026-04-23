import { useRef, useState, useCallback, useEffect } from "react";
import { MicrophoneButtonCompact } from "./MicrophoneButton";
import { detectBrowser, shouldUseGoogleSpeech, transcribeChunk } from "../services/transcriptionService";

export function TranscriptionInput({
  value,
  onChange,
  placeholder = "Dictez ou saisissez vos observations",
  rows = 8,
  disabled = false,
  variant = "textarea", // 'textarea' | 'compact' | 'header-button'
  onStatusChange,
}) {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSoundDetected, setIsSoundDetected] = useState(false);

  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationIdRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const useNativeApiRef = useRef(false);
  const textareaRef = useRef(null);
  const transcriptRef = useRef("");
  const baseTextRef = useRef("");        // text in textarea before recording started
  const isRecordingRef = useRef(false);  // controls the chunk loop for Google path
  const currentRecorderRef = useRef(null);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(Math.min(100, (average / 255) * 150));
    setIsSoundDetected(average > 30);
    animationIdRef.current = requestAnimationFrame(monitorAudioLevel);
  }, []);

  // appendTranscript does NOT depend on `value` — uses baseTextRef captured at start.
  const appendTranscript = useCallback((chunkText) => {
    const text = String(chunkText || "").trim();
    if (!text) return;

    transcriptRef.current = String(transcriptRef.current || "");
    transcriptRef.current += (transcriptRef.current ? " " : "") + text;

    const base = baseTextRef.current;
    const finalText = base ? base + " " + transcriptRef.current : transcriptRef.current;
    onChange(finalText);
    autoResize();
  }, [onChange]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;

    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    analyserRef.current = null;

    if (useNativeApiRef.current && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    } else {
      currentRecorderRef.current?.stop();
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    }

    setStatus("idle");
  }, []);

  const startNativeRecognition = useCallback(async () => {
    const browser = detectBrowser();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (shouldUseGoogleSpeech()) {
      console.warn(`⚠️ ${browser} → Google Cloud Speech`);
      return false;
    }
    if (!SpeechRecognition) {
      console.warn("⚠️ Web Speech API unavailable → Google Cloud Speech");
      return false;
    }

    try {
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      useNativeApiRef.current = true;

      recognition.lang = "fr-FR";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setStatus("recording");
        transcriptRef.current = "";
      };

      recognition.onresult = (event) => {
        const finalTranscript = Array.from(event.results)
          .filter((r) => r.isFinal)
          .map((r) => r[0].transcript)
          .join("");

        if (finalTranscript) {
          transcriptRef.current = finalTranscript;
          const base = baseTextRef.current;
          onChange(base ? base + " " + finalTranscript : finalTranscript);
          autoResize();
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "network" || event.error === "service-not-available") {
          recognition.abort();
          useNativeApiRef.current = false;
          startGoogleRecording().catch(() => {
            setErrorMessage("Erreur de transcription");
            setStatus("idle");
          });
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          setErrorMessage(`Erreur: ${event.error}`);
          setStatus("idle");
        }
      };

      recognition.onend = () => {
        if (useNativeApiRef.current) setStatus("idle");
      };

      recognition.start();
      return true;
    } catch (err) {
      console.warn("⚠️ Web Speech API error:", err.message);
      return false;
    }
  }, [onChange]);

  // Google path: loop of 2-second chunks sent individually for fast incremental updates.
  const startGoogleRecording = useCallback(async () => {
    setErrorMessage("");
    setStatus("recording");
    isRecordingRef.current = true;
    transcriptRef.current = "";

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    analyserRef.current = analyser;
    monitorAudioLevel();

    const recordChunk = () => {
      if (!isRecordingRef.current) return;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      currentRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data?.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        if (blob.size > 2000) {
          try {
            const text = await transcribeChunk(blob);
            if (text) appendTranscript(text);
          } catch (err) {
            console.error("❌ Chunk error:", err);
          }
        }
        if (isRecordingRef.current) recordChunk();
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 4000);
    };

    recordChunk();
  }, [monitorAudioLevel, appendTranscript]);

  const startRecording = useCallback(async () => {
    setErrorMessage("");
    setStatus("recording");
    transcriptRef.current = "";
    baseTextRef.current = String(value || "").trim();
    useNativeApiRef.current = false;

    const nativeWorked = await startNativeRecognition();
    if (nativeWorked) return;

    try {
      await startGoogleRecording();
    } catch (err) {
      console.error(err);
      setErrorMessage("Micro non autorisé ou indisponible");
      setStatus("idle");
    }
  }, [startNativeRecognition, startGoogleRecording, value]);

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      currentRecorderRef.current?.stop();
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    };
  }, []);

  const handleClick = () => {
    if (status === "recording") stopRecording();
    else startRecording();
  };

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

  return (
    <div className="w-full">
      <div className="flex gap-3 w-full">
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
