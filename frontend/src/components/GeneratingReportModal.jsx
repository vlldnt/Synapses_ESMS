import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function GeneratingReportModal({ isOpen, message = '', onCancel }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95; // Garde à 95% jusqu'à la fin
        }
        return prev + Math.random() * 15; // Progression aléatoire
      });
    }, 500);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="rounded-2xl bg-(--bg-primary) border border-(--border) shadow-2xl p-8 max-w-sm text-center">
        {/* Cercle de progression */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            {/* Cercle de fond */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-(--bg-tertiary)"
              />
              {/* Cercle de progression */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-(--bleu-fonce) transition-all duration-300"
                strokeDasharray={`${(progress / 100) * 282.7} 282.7`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            {/* Icône au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={32} className="text-(--bleu-fonce) animate-spin" />
            </div>
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-lg font-semibold text-(--text-primary) mb-2">
          Génération en cours
        </h2>

        {/* Message de chargement */}
        <p className="text-sm text-(--text-secondary) mb-4 h-6 transition-all duration-300">
          {message}
        </p>

        <div className="text-xs text-(--text-muted) font-mono mb-5">
          {Math.round(progress)}%
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
          >
            Annuler (Échap)
          </button>
        )}
      </div>
    </div>
  );
}
