import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="flex flex-col h-screen">
      <nav
        className="w-full top-0 h-16 md:h-16 bg-(--bg-primary) border-b border-(--border) flex justify-start items-center z-40"
      >
        <div>
          <Link
            className="flex flex-row justify-center items-start gap-3 px-5 py-6"
            to="/"
          >
            <img className="h-8 md:hidden" src="/favicon.png" alt="Logo Synapses" />
            <h1
              className="flex text-lg md:text-2xl text-(--text-primary)"
            >
              Tableau de bord
            </h1>
          </Link>
        </div>
      </nav>
      <div className="flex items-center justify-center h-full" />
    </div>
  );
}

export default Dashboard;
