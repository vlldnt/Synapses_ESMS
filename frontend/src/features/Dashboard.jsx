import { useEffect, useState } from 'react';
import DashboardItem from '../components/Dashboard/DashboardItem';
import { loadArticles } from '../services/dashboardService';

function Dashboard({ educName = 'Adrien Vieilledent' }) {
  const [date, setDate] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const now = new Date();

    const weekday = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
    }).format(now);
    const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(
      now,
    );
    const month = new Intl.DateTimeFormat('fr-FR', { month: '2-digit' }).format(
      now,
    );
    const year = new Intl.DateTimeFormat('fr-FR', { year: 'numeric' }).format(
      now,
    );
    const formatted = `${weekday} ${day} /${month} /${year}`;

    setDate(formatted);
  }, []);

  useEffect(() => {
    const loadDashboardArticles = async () => {
      const data = await loadArticles();
      setArticles(data);
    };

    loadDashboardArticles();
  }, []);

  return (
    <div className="h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8">
      <div className="mx-auto flex w-full flex-col items-center justify-center">
        <div className="w-full text-left md:flex md:flex-col">
          <h1 className="text-xl md:text-3xl text-(--text-primary) whitespace-nowrap">
            Bonjour {educName.split(' ')[0]}
          </h1>
          <p className="mt-1 text-xs md:text-sm text-(--text-muted)">{date}</p>
        </div>

        <div
          id="items-cards"
          className="mt-6 w-full mx-auto grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
        >
          {articles.map((article) => (
            <DashboardItem key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
