import { NavLink } from 'react-router-dom';

function SidebarItem({ titre, link, icon: Icon }) {
  return (
    <li>
      <NavLink
        to={link}
        className={({ isActive }) =>
          `flex items-center w-full gap-3 px-5 py-3 text-sm transition-colors duration-200 rounded-xs ${
            isActive
              ? 'text-(--bleu-fonce) bg-(--bg-tertiary) border-l-4 border-(--bleu-fonce) font-semibold'
              : 'text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--bleu-fonce)'
          }`
        }
      >
        {Icon && <Icon size={18} />}
        {titre}
      </NavLink>
    </li>
  );
}

export default SidebarItem;
