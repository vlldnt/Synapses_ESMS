import { useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

// ─── Compatibilité navigateur (webkit prefix) ──────────────────────────────

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface VoiceTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

type RecordingStatus = 'idle' | 'listening' | 'processing';

// ─── Composant ─────────────────────────────────────────────────────────────

/**
 * Textarea enrichi d'un bouton de dictée vocale via la Web Speech API.
 *
 * Modes de saisie :
 *  - ✍️  Saisie classique (textarea libre)
 *  - 🎙️  Transcription vocale en temps réel (fr-FR, continuous)
 *
 * Compatibilité : Chrome, Edge, Safari 15+. Le bouton est masqué si l'API
 * n'est pas disponible dans le navigateur.
 */
export function VoiceTextarea({
  value,
  onChange,
  placeholder,
  rows = 1,
  className = '',
  disabled = false,
}: VoiceTextareaProps) {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : null;

  const isSupported = Boolean(SpeechRecognitionAPI);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognitionRef.current = recognition;

    // Snapshot du texte existant avant de commencer à dicter.
    // On concatène la dictée à la suite plutôt que d'écraser.
    let committed = value;

    recognition.onstart = () => setStatus('listening');

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = committed;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += (final.trim() ? ' ' : '') + transcript.trim();
          committed = final;
        } else {
          interim = transcript;
        }
      }

      onChange(final + (interim ? ' ' + interim : ''));
      // Déclencher le re-sizing après mise à jour de la valeur
      requestAnimationFrame(autoResize);
    };

    recognition.onend = () => {
      onChange(committed);
      setStatus('idle');
      requestAnimationFrame(autoResize);
    };

    recognition.onerror = () => setStatus('idle');

    recognition.start();
  }, [SpeechRecognitionAPI, value, onChange]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus('idle');
  }, []);

  const handleMicClick = () => {
    if (status === 'listening') stopListening();
    else startListening();
  };

  return (
    <div className="relative flex items-start gap-1 w-full">
      <textarea
        ref={textareaRef}
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={[
          'w-full flex-1 bg-transparent outline-none',
          'text-[12px]! md:text-[14px]! text-(--text-primary)',
          'placeholder:text-[10px]! md:placeholder:text-[12px]!',
          'placeholder:text-(--text-muted)/60',
          'resize-none overflow-hidden min-w-0 leading-tight',
          className,
        ].join(' ')}
        onChange={(e) => onChange(e.target.value)}
        onInput={autoResize}
      />

      {isSupported && (
        <button
          type="button"
          onClick={handleMicClick}
          disabled={disabled}
          title={
            status === 'listening'
              ? "Arrêter l'enregistrement"
              : 'Dicter ce champ (transcription vocale fr-FR)'
          }
          className={[
            'shrink-0 mt-0.5 p-1 rounded-md transition-colors cursor-pointer',
            status === 'listening'
              ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse'
              : 'text-(--text-muted) hover:text-(--bleu-fonce) hover:bg-(--bg-tertiary)',
          ].join(' ')}
        >
          {status === 'processing' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : status === 'listening' ? (
            <MicOff size={14} />
          ) : (
            <Mic size={14} />
          )}
        </button>
      )}
    </div>
  );
}

export default VoiceTextarea;
