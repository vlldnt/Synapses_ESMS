function SidebarItem({ titre, link, icon: Icon }) {
  return (
    <li>
      <a
        href={link}
        className="flex items-center gap-3 px-3 py-2.5 font-medium text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--bleu-fonce) transition-colors duration-200 border-b"
      >
        {Icon && <Icon size={20} />}
        {titre}
      </a>
    </li>
  );
}

export default SidebarItem;
