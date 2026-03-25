import { useDispatch, useSelector } from 'react-redux';
import { setLogged, setLoading } from '../store/authSlice';

function Login() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.isLoading);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    setTimeout(() => {
      dispatch(setLogged(true));
      dispatch(setLoading(false));
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-synapses-animated">
      <div className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-10">
        {/* Logo + Titre */}
        <div className="flex flex-col items-center mb-8">
          <img className="h-20 w-20 mb-4 drop-shadow-lg" src="/favicon.png" alt="Logo Synapses" />
          <h1
            className="text-5xl text-gray-800 tracking-wide font-bold"
            style={{ fontFamily: 'Ailerons' }}
          >
            Synapses
          </h1>
          <p className="text-sm text-gray-500 mt-1">Connectez-vous pour continuer</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D66D4] focus:border-transparent transition-shadow"
              type="email"
              name="email"
              id="email"
              placeholder="agent@synapses.fr"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Mot de passe
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D66D4] focus:border-transparent transition-shadow"
              type="password"
              name="password"
              id="password"
              placeholder="•••••••••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
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
