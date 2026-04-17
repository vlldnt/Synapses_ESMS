import { useEffect, useState } from 'react';
import { FileDown, Check } from 'lucide-react';

export default function DownloadSuccessModal({ isOpen, onClose }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / 10); // 10 ticks = 1 seconde
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="rounded-2xl bg-(--bg-primary) border border-(--border) shadow-2xl p-8 max-w-sm text-center">
        {/* Icône de succès */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Check size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-lg font-semibold text-(--text-primary) mb-2">
          Fichier téléchargé
        </h2>
        <p className="text-sm text-(--text-muted) mb-6">
          Votre compte rendu a été généré et archivé avec succès.
        </p>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="w-full h-2 bg-(--bg-secondary) rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-100"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-(--text-muted) mt-2">
            {progress < 100 ? 'Téléchargement en cours...' : 'Téléchargé !'}
          </p>
        </div>

        {/* Icône téléchargement */}
        <div className="flex justify-center">
          <FileDown size={24} className="text-(--text-muted) animate-bounce" />
        </div>
      </div>
    </div>
  );
}
