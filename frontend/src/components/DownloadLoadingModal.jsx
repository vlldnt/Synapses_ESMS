import { Download } from 'lucide-react';

export default function DownloadLoadingModal() {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-4 bg-(--bg-primary) rounded-2xl border border-(--border) shadow-2xl px-10 py-8">
        <div className="w-12 h-12 rounded-full bg-(--bleu-fonce)/10 flex items-center justify-center animate-pulse">
          <Download size={22} className="text-(--bleu-fonce)" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-semibold text-(--text-primary)">Préparation du fichier…</p>
          <p className="text-xs text-(--text-muted)">Votre téléchargement va démarrer</p>
        </div>
      </div>
    </div>
  );
}
