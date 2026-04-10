import { Link } from 'react-router-dom';

function DashboardItem({ article }) {
  const {
    title,
    description,
    ctaText,
    to,
    color,
    disabled = false,
    className = '',
  } = article;

  const baseClass = `rounded-2xl border border-(--border) bg-(--bg-primary) p-3 md:p-5 shadow-sm transition-all duration-200 ${className}`.trim();

  const inner = (
    <>
      <h2 className="mt-2 text-base md:text-lg font-semibold text-(--text-primary)">
        {title}
      </h2>
      <p className="mt-2 text-xs md:text-sm leading-6 text-(--text-secondary) line-clamp-2">
        {description}
      </p>
      <span
        className="mt-4 inline-flex text-sm font-semibold"
        style={{ color: disabled ? 'var(--text-muted)' : (color || 'var(--bleu-fonce)') }}
      >
        {ctaText}
      </span>
    </>
  );

  return disabled ? (
    <article
      id={`card-${article.id}`}
      className={`${baseClass} opacity-60 cursor-not-allowed`}
      style={{ borderTop: `4px solid ${color || 'var(--border)'}` }}
    >
      {inner}
    </article>
  ) : (
    <Link
      id={`card-${article.id}`}
      to={to}
      className={`block ${baseClass} hover:-translate-y-0.5 hover:shadow-md`}
      style={{ borderTop: `4px solid ${color || 'var(--border)'}` }}
    >
      {inner}
    </Link>
  );
}

export default DashboardItem;
