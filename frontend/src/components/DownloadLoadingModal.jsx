import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';

const CIRCUMFERENCE = 2 * Math.PI * 34;
const COLOR = '#2563EB';

export default function DownloadLoadingModal({ isOpen }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('hidden');
  const intervalRef = useRef(null);
  const t1Ref = useRef(null);
  const t2Ref = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPhase('visible');
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) { clearInterval(intervalRef.current); return 90; }
          return prev + 8 + Math.random() * 3;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
      setProgress(100);
      t1Ref.current = setTimeout(() => setPhase('closing'), 400);
      t2Ref.current = setTimeout(() => { setPhase('hidden'); setProgress(0); }, 900);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(t1Ref.current);
      clearTimeout(t2Ref.current);
    };
  }, [isOpen]);

  if (phase === 'hidden') return null;

  const clamped = Math.min(progress, 100);
  const filled = (clamped / 100) * CIRCUMFERENCE;
  const pct = Math.round(clamped);

  return (
    <div
      className={`fixed bottom-6 right-6 z-9999 w-80 transition-all duration-500 ${
        phase === 'visible'
          ? 'opacity-100 translate-y-0 translate-x-0 scale-100'
          : 'opacity-0 -translate-y-32 translate-x-12 scale-75'
      }`}
    >
      <div className="bg-(--bg-primary) rounded-2xl border border-(--border) shadow-2xl overflow-hidden">
        <div className="h-1 w-full" style={{ background: COLOR }} />

        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-7 h-6 rounded-full shrink-0"
              style={{ background: COLOR }}
            >
              <Download size={12} className="text-white" />
            </span>
            <p className="flex-1 text-sm font-semibold text-(--text-primary)">Téléchargement</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative shrink-0 w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="8" className="text-(--bg-tertiary)" />
                <circle
                  cx="50" cy="50" r="34"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
                  className="transition-all duration-200 ease-out"
                  style={{ stroke: COLOR }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: COLOR }}>
                {pct}%
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-(--text-muted) mb-1">Préparation du fichier…</p>
              <p className="text-[12px] text-(--text-secondary) leading-snug">Votre téléchargement va démarrer</p>
            </div>
          </div>

          <div className="h-0.5 rounded-full bg-(--bg-tertiary) overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200 ease-out"
              style={{ width: `${pct}%`, background: COLOR }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
