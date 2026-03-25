function ItemList({ titre, link }) {
  return (
    <li>
      <a
        href={link}
        className="relative font-medium text-gray-600 hover:text-(--bleu-fonce) transition-colors duration-200"
      >
        {titre}
      </a>
    </li>
  );
}

export default ItemList;
