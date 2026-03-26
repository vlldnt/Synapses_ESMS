import { NavLink } from 'react-router-dom';

function SidebarItem({ titre, link, icon: Icon }) {
  return (
    <li>
      <NavLink
        to={link}
        className={({ isActive }) =>
          `flex justify-center lg:justify-start items-center w-full gap-0 lg:gap-3 px-0 lg:px-5 py-3 text-sm transition-colors duration-200 rounded-xs ${
            isActive
              ? 'text-(--bleu-fonce) bg-(--bg-tertiary) font-semibold lg:border-l-4 lg:border-(--bleu-fonce)'
              : 'text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--bleu-fonce)'
          }`
        }
      >
        {Icon && <Icon size={18} />}
        <p className="hidden lg:flex">{titre}</p>
      </NavLink>
    </li>
  );
}

export default SidebarItem;
