const COLORS = {
  'blue':        'bg-(--bleu-fonce) hover:bg-(--bleu-clair) text-white border-transparent',
  'blue-light':  'bg-(--bleu-clair) hover:bg-(--bleu-fonce) text-white border-transparent',

  'green':       'bg-(--vert-fonce) hover:bg-(--vert-clair) text-white border-transparent',
  'green-light': 'bg-(--vert-clair) hover:bg-(--vert-fonce) text-white border-transparent',

  'rose':        'bg-(--rose-fonce) hover:bg-(--rose-clair) text-white border-transparent',
  'rose-light':  'bg-(--rose-clair) hover:bg-(--rose-fonce) text-white border-transparent',

  'orange':      'bg-(--orange) hover:opacity-80 text-(--text-primary) border-transparent',

  'yellow':      'bg-(--jaune-clair) hover:bg-(--jaune) text-(--text-primary) border-transparent',

  'violet':      'bg-(--violet) hover:opacity-80 text-white border-transparent',

  'ghost':       'bg-transparent hover:bg-(--bg-tertiary) text-(--text-secondary) border-(--border)',
};

const SIZES = {
  sm:  'py-1    px-2.5 text-xs  gap-1   md:py-1.5 md:px-3   md:gap-1',
  md:  'py-2    px-3.5 text-sm  gap-1.5 md:py-2.5 md:px-4   md:gap-1.5',
  lg:  'py-1.5  px-3   text-xs  gap-1   sm:py-2   sm:px-4   sm:text-sm   md:py-2.5 md:px-6   md:text-base md:gap-2',
};

export default function Button({
  onClick,
  type = 'button',
  disabled = false,
  icon: Icon,
  iconSize = 15,
  iconRight = false,
  children,
  color,
  size = 'md',
  className = '',
}) {
  const colorClass = COLORS[color] ?? 'bg-transparent hover:bg-(--bg-tertiary) text-(--text-secondary) border-(--border)';
  const sizeClass  = SIZES[size] ?? SIZES.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center ${sizeClass} rounded-lg border font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${colorClass} ${className}`}
    >
      {Icon && !iconRight && <Icon size={iconSize} />}
      {children}
      {Icon && iconRight && <Icon size={iconSize} />}
    </button>
  );
}
