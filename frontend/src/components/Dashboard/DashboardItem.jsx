import { Link } from 'react-router-dom';

function DashboardItem({ article }) {
  const {
    title,
    description,
    ctaText,
    to,
    badge,
    color,
    disabled = false,
    className = '',
  } = article;

  return (
    <article
      id={`card-${article.id}`}
      className={`rounded-2xl border border-(--border) bg-(--bg-primary) p-3 md:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`.trim()}
      style={{ borderTop: `4px solid ${color || 'var(--border)'}` }}
    >
      <h2 className="mt-2 text-lg md:text-xl">{title}</h2>
      <p className="mt-2 text-xs md:text-sm leading-6 text-(--text-secondary)">
        {description}
      </p>

      {disabled ? (
        <span className="mt-4 inline-flex rounded-full bg-(--bg-tertiary) px-3 py-1 text-xs font-medium text-(--text-muted)">
          {ctaText}
        </span>
      ) : (
        <Link
          id={`card-${article.id}-cta`}
          className="mt-4 inline-flex text-sm font-semibold hover:underline"
          style={{ color: color || 'var(--bleu-fonce)' }}
          to={to}
        >
          {ctaText}
        </Link>
      )}

      {badge && (
        <p className="mt-3 text-xs font-medium text-(--text-muted)">{badge}</p>
      )}
    </article>
  );
}

export default DashboardItem;
