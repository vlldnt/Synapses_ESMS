import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store/store';
import App from './App.jsx';

// Déterminer le basename dynamiquement
const getBasename = () => {
  // En production sur vieilledent.eu, utilise /synapses
  if (window.location.hostname.includes('vieilledent.eu')) {
    return '/synapses';
  }
  // En développement/local, pas de basename
  return '/';
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={getBasename()}>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
