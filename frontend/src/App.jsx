import { useSelector } from 'react-redux';
import './App.css';
import Header from './components/Header/Header';
import Login from './features/Login';

function App() {
  const isLogged = useSelector((state) => state.auth.isLogged);

  if (!isLogged) return <Login />;

  return (
    <>
      <Header />
      <main className="pt-20">{/* Contenu principal ici */}</main>
    </>
  );
}

export default App;
