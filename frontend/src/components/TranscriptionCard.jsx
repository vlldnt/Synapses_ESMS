import TranscriptionInput from "./TranscriptionInput";

export function TranscriptionCard({
  value,
  onChange,
  placeholder,
  rows = 8,
  disabled = false,
}) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--bg-secondary) px-4 py-3 min-h-56">
      <TranscriptionInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
    </div>
  );
}

export default TranscriptionCard;
