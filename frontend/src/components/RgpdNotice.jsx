import { Lock } from 'lucide-react';

export default function RgpdNotice({ message }) {
  return (
    <div className="mt-4 hidden md:flex items-start gap-3 rounded-xl bg-(--bg-secondary) border border-(--border) px-4 py-3">
      <Lock size={16} className="text-(--text-muted) mt-0.5 shrink-0" />
      <p className="text-[10px] md:text-xs text-(--text-secondary) leading-4 md:leading-5">
        <span className="font-semibold text-(--text-primary)">Protection des données : </span>
        {message}
      </p>
    </div>
  );
}
