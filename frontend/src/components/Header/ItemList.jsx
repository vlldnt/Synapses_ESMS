
function ItemList({ onClick, titre, link, color }) {

  return (
    <a
      href={link}
      onClick={onClick}
      className={`text-gray-600 hover:text-${color}-900 font-medium`}
    >
      {titre}
    </a>
  );
}

export default ItemList;
