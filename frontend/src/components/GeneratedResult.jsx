import { RefreshCw, ClipboardCopy, FileDown, CircleCheck } from 'lucide-react';
import Button from './Button';
import WordPreview from './WordPreview';

const cardClass =
  'rounded-2xl border border-(--border) bg-(--bg-primary) p-5 md:p-8 shadow-sm';

export default function GeneratedResult({
  id,
  title,
  result,
  validated,
  onValidatedChange,
  onRegenerate,
  onCopy,
  onWordDownload,
  validationText,
}) {
  return (
    <div id={id} className={cardClass}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-(--text-primary) font-semibold">
          <CircleCheck size={20} className="text-[#42C4A1]" />
          {title}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" color="ghost" icon={RefreshCw} onClick={onRegenerate}>Régénérer</Button>
          <Button size="sm" color="ghost" icon={ClipboardCopy} onClick={onCopy}>Copier</Button>
          <Button size="sm" color="ghost" icon={FileDown} onClick={onWordDownload}>Word</Button>
        </div>
      </div>

      <WordPreview text={result} />

      <label className="mt-5 flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={validated}
          onChange={(e) => onValidatedChange(e.target.checked)}
          className="mt-0.5 accent-[#0D66D4] shrink-0"
        />
        <span className="text-xs text-(--text-secondary) leading-5">
          <span className="font-semibold text-(--text-primary)">Validation obligatoire : </span>
          {validationText}
        </span>
      </label>
    </div>
  );
}
