import { Link } from 'react-router-dom';

function AgentCard({ agent }) {
  const isAvailable = !!agent.to;
  const color = agent.color;

  const inner = (
    <div
      className={`rounded-xl bg-(--bg-primary) p-3 h-full flex flex-col gap-2 transition-all duration-200 ${
        isAvailable
          ? 'border border-(--border) hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
          : 'border border-(--border) opacity-35 cursor-default'
      }`}
      style={isAvailable ? { borderLeftColor: color, borderLeftWidth: '3px' } : {}}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className="inline-flex items-center justify-center px-2 h-5 rounded-full text-[10px] font-bold text-white shrink-0"
          style={{ background: isAvailable ? color : '#94a3b8' }}
        >
          {agent.badge}
        </span>
        {!isAvailable && (
          <span className="text-[9px] px-1 py-0.5 rounded-md bg-(--bg-tertiary) text-(--text-muted) font-medium shrink-0">
            Bientôt
          </span>
        )}
      </div>
      <p className={`text-xs font-semibold leading-snug ${isAvailable ? 'text-(--text-primary)' : 'text-(--text-muted)'}`}>
        {agent.title}
      </p>
    </div>
  );

  return isAvailable ? (
    <Link to={agent.to} className="block h-full">{inner}</Link>
  ) : (
    <div className="h-full">{inner}</div>
  );
}

export default AgentCard;
