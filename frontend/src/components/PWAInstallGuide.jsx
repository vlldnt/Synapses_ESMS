import { useState, useEffect } from 'react';
import { X, Share, Plus, Menu } from 'lucide-react';

function useInstallState() {
  const [platform, setPlatform] = useState(null); // 'ios' | 'android' | 'desktop'
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    setIsInstalled(standalone);
    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('desktop');

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return { platform, isInstalled, deferredPrompt };
}

function Step({ n, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-(--bleu-fonce) text-white text-xs font-bold shrink-0 mt-0.5">{n}</span>
      <span className="text-sm text-(--text-secondary)">{children}</span>
    </li>
  );
}

export function PWAInstallModal({ onClose }) {
  const { platform, isInstalled, deferredPrompt } = useInstallState();

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-(--bg-primary) p-6 shadow-xl border border-(--border)"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <img src="/icon-192.png" alt="Synapses" className="w-8 h-8 rounded-xl" />
            <p className="font-semibold text-(--text-primary)">Installer Synapses</p>
          </div>
          <button onClick={onClose} className="text-(--text-muted) cursor-pointer hover:text-(--text-primary)">
            <X size={20} />
          </button>
        </div>

        {isInstalled ? (
          <p className="text-sm text-(--text-secondary)">L'application est déjà installée sur cet appareil.</p>
        ) : (
          <>
            {/* iOS */}
            {platform === 'ios' && (
              <ol className="flex flex-col gap-4">
                <Step n="1">Appuie sur le bouton Partager <Share size={14} className="inline mx-1" /> en bas de Safari</Step>
                <Step n="2">Fais défiler et appuie sur <strong className="text-(--text-primary)">"Sur l'écran d'accueil"</strong> <Plus size={14} className="inline mx-1" /></Step>
                <Step n="3">Appuie sur <strong className="text-(--text-primary)">"Ajouter"</strong> en haut à droite</Step>
              </ol>
            )}

            {/* Android avec prompt natif */}
            {platform === 'android' && deferredPrompt && (
              <>
                <p className="text-sm text-(--text-secondary) mb-4">Installe l'app pour un accès rapide sans barre d'URL.</p>
                <button
                  onClick={handleAndroidInstall}
                  className="w-full py-2.5 rounded-lg bg-(--bleu-fonce) hover:bg-(--bleu-clair) text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Installer l'application
                </button>
              </>
            )}

            {/* Android sans prompt (Brave, Firefox…) */}
            {platform === 'android' && !deferredPrompt && (
              <ol className="flex flex-col gap-4">
                <Step n="1">Appuie sur le menu <Menu size={14} className="inline mx-1" /> (3 points) en haut à droite</Step>
                <Step n="2">Sélectionne <strong className="text-(--text-primary)">"Ajouter à l'écran d'accueil"</strong> ou <strong className="text-(--text-primary)">"Installer l'application"</strong></Step>
                <Step n="3">Confirme en appuyant sur <strong className="text-(--text-primary)">"Ajouter"</strong></Step>
              </ol>
            )}

            {/* Desktop */}
            {platform === 'desktop' && (
              <ol className="flex flex-col gap-4">
                <Step n="1">Clique sur l'icône d'installation <strong className="text-(--text-primary)">⊕</strong> dans la barre d'adresse de Chrome/Edge</Step>
                <Step n="2">Clique sur <strong className="text-(--text-primary)">"Installer"</strong> dans la popup</Step>
                <Step n="3">L'app s'ouvre dans sa propre fenêtre, sans barre de navigateur</Step>
              </ol>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PWAInstallModal;
