import { CheckCircle2, X } from 'lucide-react';

export default function DownloadToast({ filename, message, onClose }) {
  if (!filename && !message) return null;
  const text = message ?? <><span className="font-semibold">{filename}</span> a bien été téléchargé</>;
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-9999 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border border-green-200 bg-green-50 text-green-800 text-sm font-medium max-w-[90vw]">
      <CheckCircle2 size={17} className="text-green-500 shrink-0" />
      <span>{text}</span>
      <button type="button" onClick={onClose} className="ml-2 text-green-400 hover:text-green-700 cursor-pointer shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}
