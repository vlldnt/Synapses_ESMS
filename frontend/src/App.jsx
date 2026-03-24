import { useSelector } from 'react-redux';
import './App.css';
import Header from './components/Header/Header';
import Login from './features/Login';

function App() {
  const isLogged = useSelector((state) => state.auth.isLogged);

  return (
    <>
      <Header />
      {!isLogged ? <Login /> : null}
    </>
  );
}

export default App;
