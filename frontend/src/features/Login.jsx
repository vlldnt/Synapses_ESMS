import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLogged, setLoading } from '../store/authSlice';

function Login() {
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
    setTimeout(() => {
      dispatch(setLogged(true));
      dispatch(setLoading(false));
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-synapses-animated">
      <div className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm rounded-4xl shadow-2xl px-8 pb-8 pt-2">
        {/* Logo + Titre */}
        <div className="flex flex-col items-center mb-8">
          <img
            className="h-40 w-40 mb-4 drop-shadow-lg"
            src="/favicon.png"
            alt="Logo Synapses"
          />
          <h1
            className="text-6xl text-gray-800 tracking-wide font-bold"
            style={{ fontFamily: 'Ailerons' }}
          >
            Synapses
          </h1>
          <p className="text-sm text-gray-400 mt-4">
            Connectez-vous pour continuer
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition-shadow
                ${!email ? 'border-gray-300 focus:ring-[#0D66D4]' : isEmailValid ? 'border-green-400 focus:ring-green-400' : 'border-red-400 focus:ring-red-400'}`}
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(email) => setEmail(email.target.value)}
              placeholder="agent@synapses.fr"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Mot de passe
            </label>
            <input
              className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition-shadow
                ${!password ? 'border-gray-300 focus:ring-[#0D66D4]' : isPasswordValid ? 'border-green-400 focus:ring-green-400' : 'border-red-400 focus:ring-red-400'}`}
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
            className="mt-2 w-full py-3 rounded-lg text-white font-medium cursor-pointer
                       bg-(--bleu-fonce) hover:opacity-90
                       disabled:opacity-60 disabled:cursor-wait
                       transition-opacity duration-200"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
