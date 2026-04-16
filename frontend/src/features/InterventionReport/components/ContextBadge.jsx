function ContextBadge({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-(--bg-tertiary) border border-(--border)">
      <Icon size={13} className="text-(--text-muted) shrink-0" />
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] text-(--text-muted) uppercase tracking-wide">{label}</span>
        <span className="text-xs font-medium text-(--text-primary)">{value}</span>
      </div>
    </div>
  );
}

export default ContextBadge;
