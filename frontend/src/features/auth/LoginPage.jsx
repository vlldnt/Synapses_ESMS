import { useState } from 'react';
import faviconUrl from '/favicon.png';
import { useDispatch, useSelector } from 'react-redux';
import { setLogged, setLoading, fetchCurrentUser } from '../../store/authSlice';

function LoginPage() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    email,
  );
  const isPasswordValid = password.length >= 8;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    dispatch(setLoading(true));
    setTimeout(async () => {
      await dispatch(fetchCurrentUser());
      dispatch(setLogged(true));
      dispatch(setLoading(false));
    }, 400);
  };

  return (
    <div id="login-page" className="min-h-dvh flex items-center justify-center bg-synapses-animated px-3">
      <div className="absolute hidden md:flex left-2 top-2">
        <a
          className="flex flex-row justify-center items-center gap-3 px-5 py-6"
          href="/"
        >
          <img className="h-10" src={faviconUrl} alt="Logo Synapses" />
          <span
            className=" md:text-xl font-bold text-white dark:text-gray-200"
            style={{ fontFamily: 'Ailerons' }}
          >
            Synapses ESMS
          </span>
        </a>
      </div>
      <div id="login-card" className="w-full max-w-md mx-2 md:mx-4 bg-(--bg-primary)/90 backdrop-blur-sm rounded-3xl md:rounded-4xl shadow-2xl px-5 pb-5 pt-1 md:px-8 md:pb-8 md:pt-2 border border-(--border)/50">
        {/* Logo + Titre */}
        <div className="flex flex-col w-full items-center mb-4 md:mb-8">
          <img
            className="h-24 w-24 md:h-40 md:w-40 drop-shadow-lg"
            src={faviconUrl}
            alt="Logo Synapses"
          />
          <h1
            className="text-[28px] md:text-[47px] text-(--text-primary) tracking-wide font-bold"
            style={{ fontFamily: 'Ailerons' }}
          >
            Synapses ESMS
          </h1>
          <p className="text-(--text-muted) text-center text-xs w-full mt-2 md:mt-4">
            Rédaction professionnelle assistée par IA <br />
            Secteur social & médico-social
          </p>
        </div>

        {/* Formulaire */}
        <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-5">
          <div className="flex flex-col gap-1 md:gap-1.5">
            <label
              className="text-sm md:text-sm font-medium text-(--text-secondary)"
              htmlFor="email"
            >
              Identifiant
            </label>
            <input
              className={`w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border bg-(--bg-secondary) text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm md:text-base
                ${!email ? 'border-(--border) focus:ring-[#1294C3]' : isEmailValid ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(email) => setEmail(email.target.value)}
              placeholder="agent@synapses.fr"
            />
          </div>

          <div className="flex flex-col gap-1 md:gap-1.5">
            <label
              className="text-sm md:text-sm font-medium text-(--text-secondary)"
              htmlFor="password"
            >
              Mot de passe
            </label>
            <input
              className={`w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border bg-(--bg-secondary) text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm md:text-base
                ${!password ? 'border-(--border) focus:ring-[#1294C3]' : isPasswordValid ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(password) => setPassword(password.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            id="login-button"
            disabled={isLoading || !isFormValid}
            className="mt-1 md:mt-2 w-full py-2.5 md:py-3 rounded-lg text-white font-medium cursor-pointer text-sm md:text-base
            bg-[#1294C3] hover:bg-[#0D66D4] hover:opacity-90
            disabled:opacity-60 disabled:cursor-wait
            transition-all duration-200"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
          <p className="text-(--text-muted) text-center text-[10px] md:text-xs">
            <span>
              🔒 Aucune donnée nominative ne quitte votre établissement.
            </span>
            <br />
            Conforme RGPD · IA Act · Secret professionnel
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
