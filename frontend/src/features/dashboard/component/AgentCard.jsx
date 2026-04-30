import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function AgentCard({ agent }) {
  const isAvailable = !!agent.to;
  const color = agent.color;

  const inner = (
    <div
      className={`rounded-2xl bg-(--bg-primary) p-4 h-full flex flex-col gap-3 transition-all duration-200 ${
        isAvailable
          ? 'border border-(--border) hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
          : 'border border-(--border) opacity-35 cursor-default'
      }`}
      style={isAvailable ? { borderLeftColor: color, borderLeftWidth: '3px' } : {}}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center justify-center px-2 h-6 rounded-full text-[10px] font-bold text-white shrink-0"
          style={{ background: isAvailable ? color : '#94a3b8' }}
        >
          {agent.badge}
        </span>
        {!isAvailable && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-(--bg-tertiary) text-(--text-muted) font-medium shrink-0">
            Bientôt
          </span>
        )}
      </div>
      <p className={`text-xs md:text-sm font-semibold leading-snug flex-1 ${isAvailable ? 'text-(--text-primary)' : 'text-(--text-muted)'}`}>
        {agent.title}
      </p>
      {isAvailable && (
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color }}>
          Ouvrir <ChevronRight size={11} />
        </div>
      )}
    </div>
  );

  return isAvailable ? (
    <Link to={agent.to} className="block h-full">{inner}</Link>
  ) : (
    <div className="h-full">{inner}</div>
  );
}

export default AgentCard;
