import { CheckCircle2, X } from 'lucide-react';

export default function DownloadToast({ filename, onClose }) {
  if (!filename) return null;
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-200 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border border-green-200 bg-green-50 text-green-800 text-sm font-medium">
      <CheckCircle2 size={17} className="text-green-500 shrink-0" />
      <span><span className="font-semibold">{filename}</span> a bien été téléchargé</span>
      <button type="button" onClick={onClose} className="ml-2 text-green-400 hover:text-green-700 cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );
}
