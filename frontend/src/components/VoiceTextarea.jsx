import { useRef, useState, useCallback, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

export function VoiceTextarea({
  value,
  onChange,
  placeholder,
  rows = 1,
  className = "",
  disabled = false,
}) {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const autoResize = () => {
    const el = document.querySelector("textarea");
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const stopRecording = useCallback(() => {
    setStatus("idle");

    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks()?.forEach((t) => t.stop());
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setErrorMessage("");
      setStatus("recording");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setStatus("processing");

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        const formData = new FormData();
        formData.append("audio", blob, "audio.webm");

        try {
          const res = await fetch("http://localhost:3001/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (data.transcript) {
            onChange(value + " " + data.transcript);
          } else {
            setErrorMessage("Aucun texte détecté");
          }
        } catch {
          setErrorMessage("Erreur serveur de transcription");
        }

        setStatus("idle");
        autoResize();
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, 6000);
    } catch {
      setErrorMessage("Micro non autorisé ou indisponible");
      setStatus("idle");
    }
  }, [value, onChange]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    };
  }, []);

  const handleClick = () => {
    if (status === "recording") stopRecording();
    else startRecording();
  };

  return (
    <div className="w-full">
      <div className="relative flex items-start gap-1 w-full">
        <textarea
          value={value}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          className={[
            "w-full flex-1 bg-transparent outline-none",
            "text-[12px] md:text-[14px] text-black",
            "resize-none overflow-hidden",
            className,
          ].join(" ")}
          onChange={(e) => onChange(e.target.value)}
          onInput={autoResize}
        />

        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={[
            "shrink-0 p-1 rounded-md transition",
            status === "recording"
              ? "text-red-500 animate-pulse"
              : "text-gray-500 hover:text-black",
          ].join(" ")}
        >
          {status === "processing" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : status === "recording" ? (
            <MicOff size={14} />
          ) : (
            <Mic size={14} />
          )}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-1 text-[11px] text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}

export default VoiceTextarea;
