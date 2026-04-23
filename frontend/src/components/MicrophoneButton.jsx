import { Mic, MicOff, Loader2 } from "lucide-react";

export function MicrophoneButton({
  status = "idle",
  onClick,
  disabled = false,
  audioLevel = 0,
  isSoundDetected = false,
  size = 24,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={status === "recording" ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
      className={[
        "p-4 rounded-full transition relative",
        status === "recording"
          ? "bg-red-500 text-white shadow-lg animate-pulse"
          : status === "processing"
          ? "bg-blue-500 text-white"
          : "bg-blue-500 text-white hover:bg-blue-600",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {status === "processing" ? (
        <Loader2 size={size} className="animate-spin" />
      ) : status === "recording" ? (
        <MicOff size={size} />
      ) : (
        <Mic size={size} />
      )}

      {/* Audio level indicator - only show when recording */}
      {status === "recording" && (
        <div className="absolute inset-0 rounded-full border-2 border-red-300 opacity-50 animate-pulse" />
      )}
    </button>
  );
}

export function MicrophoneButtonCompact({
  status = "idle",
  onClick,
  disabled = false,
  isSoundDetected = false,
  audioLevel = 0,
}) {
  return (
    <div className="flex items-center gap-2">
      {status === "recording" && (
        <div className="flex flex-col items-center gap-1">
          {/* Barre de volume vertical à gauche */}
          <div className="h-20 w-1.5 bg-gray-300 rounded-full overflow-hidden flex flex-col-reverse">
            <div
              className={[
                "w-full rounded-full transition-all",
                isSoundDetected ? "bg-green-500" : "bg-gray-400",
              ].join(" ")}
              style={{ height: `${audioLevel}%` }}
            />
          </div>
          <span className="text-[10px] font-medium">
            {isSoundDetected ? "🎤" : "⏳"}
          </span>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <MicrophoneButton
          status={status}
          onClick={onClick}
          disabled={disabled}
          size={20}
        />

        {status === "processing" && (
          <span className="text-[10px] font-medium text-blue-600">
            Transcription...
          </span>
        )}
      </div>
    </div>
  );
}
