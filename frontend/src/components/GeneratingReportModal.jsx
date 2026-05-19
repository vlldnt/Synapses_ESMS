import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const CIRCUMFERENCE = 2 * Math.PI * 34;

export default function GeneratingReportModal({ isOpen, message = '', onCancel, badge = '', color = '#673DE6', docTitle = '' }) {
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
          if (prev >= 92) { clearInterval(intervalRef.current); return 92; }
          return prev + 3 + Math.random() * 2;
        });
      }, 300);
    } else {
      setProgress(100);
      t1Ref.current = setTimeout(() => setPhase('closing'), 600);
      t2Ref.current = setTimeout(() => { setPhase('hidden'); setProgress(0); }, 1100);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(t1Ref.current);
      clearTimeout(t2Ref.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (phase === 'hidden') return null;

  const clamped = Math.min(progress, 100);
  const filled = (clamped / 100) * CIRCUMFERENCE;
  const pct = Math.round(clamped);

  return (
    <div
      className={`fixed bottom-6 right-6 z-9999 w-88 transition-all duration-500 ${
        phase === 'visible' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-(--bg-primary) rounded-2xl border border-(--border) shadow-2xl overflow-hidden">

        <div className="h-1 w-full" style={{ background: color }} />

        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center px-2.5 h-6 rounded-full text-[11px] font-bold text-white shrink-0"
              style={{ background: color }}
            >
              {badge}
            </span>
            <p className="flex-1 text-sm font-semibold text-(--text-primary) truncate">{docTitle}</p>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                title="Annuler (Échap)"
                className="shrink-0 p-1 rounded-md text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) cursor-pointer transition-colors"
              >
                <X size={13} />
              </button>
            )}
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
                  className="transition-all duration-700 ease-out"
                  style={{ stroke: color }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
                {pct}%
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-(--text-muted) mb-1">Génération en cours…</p>
              <p
                key={message}
                className="text-[12px] text-(--text-secondary) leading-snug"
                style={{ animation: 'fadeMsg 0.5s ease' }}
              >
                {message}
              </p>
            </div>
          </div>

          <div className="h-0.5 rounded-full bg-(--bg-tertiary) overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeMsg {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
