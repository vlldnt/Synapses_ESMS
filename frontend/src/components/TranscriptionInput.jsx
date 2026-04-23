import { useRef, useState, useCallback, useEffect } from "react";
import { MicrophoneButton, MicrophoneButtonCompact } from "./MicrophoneButton";

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

  // Notifier les changements de status
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const autoResize = () => {
    const el = document.querySelector("textarea");
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
    setStatus("processing");

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

  const detectDevice = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    return "desktop";
  };

  const startNativeRecognition = useCallback(async () => {
    const device = detectDevice();
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("⚠️ Web Speech API not available, using Google Cloud");
      return false;
    }

    try {
      console.log(
        `🎙️ Using native ${device === "ios" ? "Siri" : device === "android" ? "Android" : "Web"} Speech API`
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
        console.error("Native recognition error:", event.error);
        if (event.error !== "no-speech") {
          setErrorMessage(`Erreur: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log("✅ Native recognition ended");
        setStatus("idle");
        autoResize();
      };

      recognition.start();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [value, onChange]);

  const startRecording = useCallback(async () => {
    setErrorMessage("");
    setStatus("recording");
    transcriptRef.current = "";

    const nativeWorked = await startNativeRecognition();
    if (nativeWorked) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;

      monitorAudioLevel();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setStatus("processing");
        console.log("⏹️ Recording stopped, processing...");

        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          console.log(`🎙️ Audio recorded: ${blob.size} bytes`);

          const apiUrl = process.env.VITE_API_URL || "/api";
          const res = await fetch(`${apiUrl}/transcribe-stream`, {
            method: "POST",
            body: blob,
          });

          console.log(`📡 Response status: ${res.status}`);
          if (!res.body) {
            setErrorMessage("Pas de réponse du serveur");
            setStatus("idle");
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value: chunk } = await reader.read();
            if (done) break;

            buffer += decoder.decode(chunk, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
                  console.log("✅ Streaming complete");
                  setStatus("idle");
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    const text = String(parsed.text).trim();
                    console.log(`📝 Text: "${text}"`);

                    transcriptRef.current = String(transcriptRef.current || "");
                    transcriptRef.current += (transcriptRef.current ? " " : "") + text;

                    const baseText = String(value || "").trim();
                    const finalText = baseText
                      ? baseText + " " + String(transcriptRef.current).trim()
                      : String(transcriptRef.current).trim();

                    console.log(`✍️ Final: "${finalText}"`);
                    onChange(finalText);
                  }
                } catch (e) {
                  console.error("Parse error:", e);
                }
              }
            }
          }

          if (!transcriptRef.current) {
            setErrorMessage("Aucun texte détecté");
          }
        } catch (err) {
          console.error("❌ Error:", err);
          setErrorMessage("Erreur de transcription");
        }

        setStatus("idle");
        autoResize();
      };

      mediaRecorder.start(500);
      console.log("🎙️ Recording started");

      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          console.log("⏹️ Stopping recording (timeout)");
          mediaRecorder.stop();
        }
      }, 6000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Micro non autorisé ou indisponible");
      setStatus("idle");
    }
  }, [value, onChange, monitorAudioLevel, startNativeRecognition]);

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
      <MicrophoneButton
        status={status}
        onClick={handleClick}
        disabled={disabled}
        size={20}
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
        />
      </div>
    );
  }

  // Variant par défaut: textarea avec bouton
  return (
    <div className="w-full">
      <div className="flex gap-3 w-full">
        <textarea
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

        <div className="shrink-0 hidden md:flex">
          <MicrophoneButtonCompact
            status={status}
            onClick={handleClick}
            disabled={disabled}
            isSoundDetected={isSoundDetected}
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
