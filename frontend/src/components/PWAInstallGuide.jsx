import { useState, useEffect } from 'react';
import { X, Share, Plus, Menu } from 'lucide-react';

function useInstallState() {
  const [platform, setPlatform] = useState(null); // 'ios' | 'android' | null
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

    if (!standalone) {
      if (isIOS) setPlatform('ios');
      else if (isAndroid) setPlatform('android');
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return { platform, isInstalled, deferredPrompt };
}

export default function PWAInstallGuide() {
  const { platform, isInstalled, deferredPrompt } = useInstallState();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('pwa-dismissed') === '1'
  );
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || dismissed || !platform) return null;

  const dismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1');
    setDismissed(true);
  };

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') dismiss();
    } else {
      // Pas de prompt dispo (Brave, etc.) → guide manuel
      setShowIOSGuide(true);
    }
  };

  /* ── Bannière Android ── */
  if (platform === 'android' && !showIOSGuide) {
    return (
      <div className="fixed bottom-[3.75rem] left-0 right-0 z-50 mx-3 mb-2">
        <div className="flex items-center gap-3 rounded-2xl bg-(--bg-primary) border border-(--border) shadow-lg px-4 py-3">
          <img src="/synapses/icon-192.png" alt="Synapses" className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-(--text-primary)">Installer Synapses</p>
            <p className="text-xs text-(--text-muted)">Accès rapide, sans barre d'URL</p>
          </div>
          <button
            onClick={handleAndroidInstall}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-[#0D66D4] text-white text-xs font-medium cursor-pointer"
          >
            Installer
          </button>
          <button onClick={dismiss} className="shrink-0 text-(--text-muted) cursor-pointer">
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Guide Android manuel (Brave etc.) ── */
  if (platform === 'android' && showIOSGuide) {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={dismiss}>
        <div
          className="w-full rounded-t-2xl bg-(--bg-primary) p-6 pb-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-(--text-primary)">Installer sur Android</p>
            <button onClick={dismiss} className="text-(--text-muted) cursor-pointer"><X size={20} /></button>
          </div>
          <ol className="flex flex-col gap-4 text-sm text-(--text-secondary)">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0D66D4] text-white text-xs font-bold shrink-0 mt-0.5">1</span>
              <span>Appuie sur le menu <Menu size={14} className="inline" /> (3 points) en haut à droite</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0D66D4] text-white text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>Sélectionne <strong className="text-(--text-primary)">"Ajouter à l'écran d'accueil"</strong> ou <strong className="text-(--text-primary)">"Installer l'application"</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0D66D4] text-white text-xs font-bold shrink-0 mt-0.5">3</span>
              <span>Confirme en appuyant sur <strong className="text-(--text-primary)">"Ajouter"</strong></span>
            </li>
          </ol>
        </div>
      </div>
    );
  }

  /* ── Guide iOS ── */
  if (platform === 'ios') {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={dismiss}>
        <div
          className="w-full rounded-t-2xl bg-(--bg-primary) p-6 pb-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-(--text-primary)">Installer sur iPhone / iPad</p>
            <button onClick={dismiss} className="text-(--text-muted) cursor-pointer"><X size={20} /></button>
          </div>
          <ol className="flex flex-col gap-4 text-sm text-(--text-secondary)">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0D66D4] text-white text-xs font-bold shrink-0 mt-0.5">1</span>
              <span>Appuie sur le bouton Partager <Share size={14} className="inline" /> en bas de Safari</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0D66D4] text-white text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>Fais défiler et appuie sur <strong className="text-(--text-primary)">"Sur l'écran d'accueil"</strong> <Plus size={14} className="inline" /></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0D66D4] text-white text-xs font-bold shrink-0 mt-0.5">3</span>
              <span>Appuie sur <strong className="text-(--text-primary)">"Ajouter"</strong> en haut à droite</span>
            </li>
          </ol>
          {/* Flèche vers le bas pointant la barre Safari */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2 text-xs text-(--text-muted)">
              <span>↓ Le bouton partager est en bas de l'écran</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
