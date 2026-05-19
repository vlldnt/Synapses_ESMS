import { NavLink, useLocation } from 'react-router-dom';

function NavItem({
  titre,
  link,
  icon: Icon,
  mobile = false,
  disabled = false,
  activeRoutes = [],
}) {
  const location = useLocation();
  const prefix = mobile ? 'mobile-nav' : 'nav';
  const itemId = link
    ? `${prefix}-${link === '/' ? 'home' : link.slice(1)}`
    : `${prefix}-disabled`;

  if (disabled) {
    return (
      <li id={itemId} className="list-none">
        <div
          className={
            mobile
              ? 'flex flex-col items-center justify-center gap-0 min-h-14 px-0 py-0 rounded-md text-(--text-muted) opacity-60 cursor-not-allowed'
              : 'flex justify-start items-center w-full px-5 py-3 text-sm rounded-xs text-(--text-muted) opacity-60 cursor-not-allowed'
          }
        >
          {mobile && Icon && <Icon className="w-4 h-4 shrink-0" />}
          <p
            className={
              mobile
                ? 'text-[10px] leading-3 text-center whitespace-normal wrap-break-words w-full'
                : 'truncate min-w-0'
            }
          >
            {titre}
          </p>
        </div>
      </li>
    );
  }

  if (mobile) {
    const isActive = location.pathname === link || activeRoutes.some(route => location.pathname === route);
    return (
      <li id={itemId} className="list-none">
        <NavLink
          to={link}
          className={`flex flex-col items-center justify-center gap-0 min-h-14 px-0 py-0 rounded-md transition-colors duration-200 ${
            isActive
              ? 'text-(--bleu-fonce) bg-(--bleu-fonce)/10 font-semibold'
              : 'text-(--text-secondary) hover:bg-(--bleu-fonce)/10 hover:text-(--bleu-fonce)'
          }`}
        >
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          <p className="text-[10px] leading-3 text-center whitespace-normal wrap-break-words w-full">
            {titre}
          </p>
        </NavLink>
      </li>
    );
  }

  const isActive = location.pathname === link || activeRoutes.some(route => location.pathname === route);
  return (
    <li id={itemId} className="list-none">
      <NavLink
        to={link}
        className={`flex justify-start items-center w-full px-5 py-3 text-sm transition-colors duration-200 rounded-xs ${
          isActive
            ? 'text-(--bleu-fonce) bg-(--bleu-fonce)/10 font-semibold border-l-4 border-(--bleu-fonce)'
            : 'text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)'
        }`}
      >
        <p className="truncate min-w-0">{titre}</p>
      </NavLink>
    </li>
  );
}

export default NavItem;
