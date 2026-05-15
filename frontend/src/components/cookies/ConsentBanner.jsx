import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import ConsentModal from './ConsentModal';

const NOTICE_KEY = 'cookie_notice_v1';
const NOTICE_TTL_MS = 180 * 24 * 60 * 60 * 1000; // 6 mois (recommandation CNIL)

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTICE_KEY);
      if (!raw) { setVisible(true); return; }
      const { ts } = JSON.parse(raw);
      if (Date.now() - ts > NOTICE_TTL_MS) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(NOTICE_KEY, JSON.stringify({ ts: Date.now() }));
    setVisible(false);
  }

  if (!visible && !modalOpen) return null;

  return (
    <>
      {visible && (
        <div
          role="region"
          aria-label="Informations sur les cookies"
          className="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 z-150 px-3 pb-3 md:pb-4 pt-0 pointer-events-none"
        >
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="bg-(--bg-primary) border border-(--border) rounded-2xl shadow-2xl px-4 py-4 md:px-5 md:py-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Cookie size={18} className="text-(--bleu-fonce) shrink-0 mt-0.5" />
                <p className="text-xs text-(--text-secondary) leading-relaxed">
                  <span className="font-medium text-(--text-primary)">Cookies strictement nécessaires.</span>
                  {' '}Synapses ESMS utilise uniquement des cookies d'authentification et de sécurité,
                  exemptés de consentement. Aucun traceur publicitaire ni analytique.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-xs text-(--text-muted) hover:text-(--text-primary) hover:underline transition-colors cursor-pointer whitespace-nowrap"
                >
                  En savoir plus
                </button>
                <button
                  onClick={dismiss}
                  className="px-4 py-2 rounded-lg bg-(--bleu-fonce) text-white text-xs font-medium hover:bg-(--bleu-active) transition-colors cursor-pointer whitespace-nowrap"
                >
                  J'ai compris
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <ConsentModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// Hook pour ouvrir le modal depuis n'importe où (ex: lien sidebar)
export function useCookieModal() {
  const [open, setOpen] = useState(false);
  const modal = open ? <ConsentModal onClose={() => setOpen(false)} /> : null;
  return { openModal: () => setOpen(true), modal };
}
