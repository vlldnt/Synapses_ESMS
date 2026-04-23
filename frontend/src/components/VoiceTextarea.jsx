import TranscriptionInput from "./TranscriptionInput";

export function VoiceTextarea({
  value,
  onChange,
  placeholder,
  rows = 1,
  disabled = false,
}) {
  return (
    <TranscriptionInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
    />
  );
}

export default VoiceTextarea;
