import { useRef, useState, useCallback, useEffect } from "react";
import { MicrophoneButtonCompact } from "./MicrophoneButton";
import { detectDevice, detectBrowser, shouldUseGoogleSpeech, streamTranscription } from "../services/transcriptionService";

/**
 * Composant Transcription réutilisable avec gestion complète du micro
 * Utilisé en différents contextes: textarea seul, avec header, mobile, desktop, etc.
 */
export function TranscriptionInput({
  value,
  onChange,
  placeholder = "Dictez ou saisissez vos observations",
  rows = 8,
  disabled = false,
  variant = "textarea", // 'textarea' | 'compact' | 'header-button'
  onStatusChange, // callback pour notifier du status (idle, recording, processing)
}) {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSoundDetected, setIsSoundDetected] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const fetchAbortRef = useRef(null);
  const transcriptRef = useRef("");
  const analyserRef = useRef(null);
  const animationIdRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const useNativeApiRef = useRef(false);
  const textareaRef = useRef(null);

  // Notifier les changements de status
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

  const stopRecording = useCallback(() => {
    if (useNativeApiRef.current && speechRecognitionRef.current) {
      setStatus("idle");
    } else {
      setStatus("processing");
    }

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    if (useNativeApiRef.current && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    } else {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    }

    analyserRef.current = null;
  }, []);


  const startNativeRecognition = useCallback(async () => {
    const device = detectDevice();
    const browser = detectBrowser();
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    // Vérifier si le navigateur a des problèmes connus
    if (shouldUseGoogleSpeech()) {
      console.warn(
        `⚠️ ${browser} n'a pas de bon support Web Speech API → Google Cloud Speech`
      );
      return false;
    }

    if (!SpeechRecognition) {
      console.warn("⚠️ Web Speech API not available → Google Cloud Speech");
      return false;
    }

    try {
      console.log(
        `🎙️ Web Speech API (${browser} - ${device === "ios" ? "Siri" : device === "android" ? "Android" : "Web"})`
      );
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      useNativeApiRef.current = true;

      recognition.lang = "fr-FR";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        console.log("✅ Native recognition started");
        setStatus("recording");
        transcriptRef.current = "";
      };

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interim += event.results[i][0].transcript;
        }
        const finalTranscript = Array.from(event.results)
          .filter((r) => r.isFinal)
          .map((r) => r[0].transcript)
          .join("");

        if (finalTranscript) {
          transcriptRef.current = finalTranscript;
          const baseText = String(value || "").trim();
          const finalText = baseText
            ? baseText + " " + finalTranscript
            : finalTranscript;
          onChange(finalText);
        }
      };

      recognition.onerror = (event) => {
        console.warn("⚠️ Web Speech API error:", event.error);

        // Si erreur réseau ou autre erreur sérieuse, basculer à Google Speech
        if (event.error === "network" || event.error === "service-not-available") {
          console.log("🔄 Basculant à Google Cloud Speech...");
          recognition.abort();
          useNativeApiRef.current = false;
          startGoogleRecording().catch((err) => {
            console.error("❌ Fallback Google start failed:", err);
            setErrorMessage("Erreur de transcription");
            setStatus("idle");
          });
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          setErrorMessage(`Erreur: ${event.error}`);
          setStatus("idle");
        }
      };

      recognition.onend = () => {
        console.log("✅ Native recognition ended");
        if (useNativeApiRef.current) {
          setStatus("idle");
          autoResize();
        }
      };

      recognition.start();
      return true;
    } catch (err) {
      console.warn("⚠️ Web Speech API error:", err.message);
      return false;
    }
  }, [value, onChange]);

  const appendTranscript = useCallback((chunkText) => {
    const text = String(chunkText || "").trim();
    if (!text) return;

    transcriptRef.current = String(transcriptRef.current || "");
    transcriptRef.current += (transcriptRef.current ? " " : "") + text;

    const baseText = String(value || "").trim();
    const finalText = baseText
      ? baseText + " " + String(transcriptRef.current).trim()
      : String(transcriptRef.current).trim();

    onChange(finalText);
  }, [value, onChange]);

  const transcribeWithStream = useCallback(async (blob) => {
    await streamTranscription(blob, appendTranscript);
  }, [appendTranscript]);

  const startGoogleRecording = useCallback(async () => {
    console.log("🔄 Fallback: Google Cloud Speech (stream)...");
    setErrorMessage("");
    setStatus("recording");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyserRef.current = analyser;

    monitorAudioLevel();

    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data?.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      setStatus("processing");

      try {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeWithStream(blob);

        if (!String(transcriptRef.current || "").trim()) {
          setErrorMessage("Aucun texte détecté");
        }
      } catch (err) {
        console.error("❌ Stream transcription error:", err);
        setErrorMessage("Erreur de transcription");
      }

      setStatus("idle");
      autoResize();
    };

    mediaRecorder.start(500);
    setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }, 6000);
  }, [monitorAudioLevel, transcribeWithStream]);

  const startRecording = useCallback(async () => {
    setErrorMessage("");
    setStatus("recording");
    transcriptRef.current = "";

    console.log("🎤 Tentative: Web Speech API natif...");
    const nativeWorked = await startNativeRecognition();
    if (nativeWorked) {
      console.log("✅ Web Speech API utilisé");
      return;
    }

    try {
      await startGoogleRecording();
    } catch (err) {
      console.error(err);
      setErrorMessage("Micro non autorisé ou indisponible");
      setStatus("idle");
    }
  }, [startNativeRecognition, startGoogleRecording]);

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    };
  }, []);

  const handleClick = () => {
    if (status === "recording") stopRecording();
    else startRecording();
  };

  // Variantes de rendu
  if (variant === "header-button") {
    // Bouton pour utiliser dans le header/title
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
    // Version compacte avec indicateurs
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

  // Variant par défaut: textarea avec bouton
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
