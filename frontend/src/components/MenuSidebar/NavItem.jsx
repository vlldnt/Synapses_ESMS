import { NavLink } from 'react-router-dom';

function NavItem({ titre, link, icon: Icon, mobile = false }) {
  if (mobile) {
    return (
      <li className="list-none">
        <NavLink
          to={link}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0 min-h-14 px-0 py-0 rounded-md transition-colors duration-200 ${
              isActive
                ? 'text-(--bleu-fonce) bg-(--bg-tertiary) font-semibold'
                : 'text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--bleu-fonce)'
            }`
          }
        >
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          <p className="text-[10px] leading-3 text-center whitespace-normal wrap-break-word max-w-16">
            {titre}
          </p>
        </NavLink>
      </li>
    );
  }

  return (
    <li className="list-none">
      <NavLink
        to={link}
        className={({ isActive }) =>
          `flex justify-start items-center w-full gap-3 px-5 py-3 text-sm transition-colors duration-200 rounded-xs ${
            isActive
              ? 'text-(--bleu-fonce) bg-(--bg-tertiary) font-semibold border-l-4 border-(--bleu-fonce)'
              : 'text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--bleu-fonce)'
          }`
        }
      >
        {Icon && <Icon className="w-5 h-5" />}
        <p>{titre}</p>
      </NavLink>
    </li>
  );
}

export default NavItem;
