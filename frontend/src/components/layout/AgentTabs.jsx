import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { AGENTS, AGENT_CARD_COLORS } from '../../constants/agents';

function AgentTabs() {
  const location = useLocation();
  const role = useSelector((state) => state.role.role);
  const visibleAgents = AGENTS.filter((a) => a.roles.includes(role) && a.to);

  return (
    <div className="flex md:hidden overflow-x-auto border-b border-(--border) bg-(--bg-primary)">
      <div className="flex gap-0 w-full">
        {visibleAgents.map((agent) => {
          const isActive = location.pathname === agent.to;
          const color = AGENT_CARD_COLORS[agent.id] || '#0D66D4';

          return (
            <Link
              key={agent.id}
              to={agent.to}
              className="flex-1 px-3 py-3 text-xs font-medium text-center transition-colors duration-150 border-b-2 whitespace-nowrap"
              style={{
                color: isActive ? color : 'var(--text-muted)',
                borderBottomColor: isActive ? color : 'transparent',
                backgroundColor: isActive ? `${color}18` : 'transparent',
              }}
            >
              {agent.badge}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default AgentTabs;
