function ItemList({ titre, link, icon: Icon }) {
  return (
    <li>
      <a
        href={link}
        className="flex items-center gap-2 font-medium text-gray-600 hover:text-(--bleu-fonce) transition-colors duration-200"
      >
        {Icon && <Icon size={18} />}
        {titre}
      </a>
    </li>
  );
}

export default ItemList;
