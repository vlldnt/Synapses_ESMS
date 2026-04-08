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

  const inner = (
    <>
      <h2 className="mt-2 text-lg md:text-xl">{title}</h2>
      <p className="mt-2 text-xs md:text-sm leading-6 text-(--text-secondary)">
        {description}
      </p>
      <span
        className="mt-4 inline-flex text-sm font-semibold"
        style={{ color: disabled ? 'var(--text-muted)' : (color || 'var(--bleu-fonce)') }}
      >
        {ctaText}
      </span>
      {badge && (
        <p className="mt-3 text-xs font-medium text-(--text-muted)">{badge}</p>
      )}
    </>
  );

  const cardClass = `rounded-2xl border border-(--border) bg-(--bg-primary) p-3 md:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`.trim();
  const cardStyle = { borderTop: `4px solid ${color || 'var(--border)'}` };

  return disabled ? (
    <article id={`card-${article.id}`} className={cardClass} style={cardStyle}>
      {inner}
    </article>
  ) : (
    <Link
      id={`card-${article.id}`}
      to={to}
      className={`block ${cardClass}`}
      style={cardStyle}
    >
      {inner}
    </Link>
  );
}

export default DashboardItem;
