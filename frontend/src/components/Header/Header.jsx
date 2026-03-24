import { useSelector, useDispatch } from 'react-redux';
import { setLogged, setLoading } from '../../store/authSlice';
import ItemList from "./ItemList";

function Header() {
    const dispatch = useDispatch();
    const isLogged = useSelector((state) => state.auth.isLogged);
    const isLoading = useSelector((state) => state.auth.isLoading);

    const handleLogin = () => {
        dispatch(setLoading(true));
        setTimeout(() => {
            dispatch(setLogged(!isLogged));
            dispatch(setLoading(false));
        }, 500);
    };

    return (
        <header className="hidden md:flex w-full justify-center h-20 bg-white shadow-sm">
            <div className="h-full w-4/5 flex justify-between items-center">
                {/* Logo + Titre */}
                <a className="flex items-center gap-3 h-full" href="/">
                    <img className="h-3/5" src="/favicon.png" alt="Logo Synapses" />
                    <span className="text-2xl text-gray-800" style={{ fontFamily: 'Ailerons' }}>Synapses - ESMS</span>
                </a>

                {/* Menu central */}
                <nav className="flex gap-10">
                    <ItemList titre='Site' color="green" link="https://vieilledent.eu"/>
                    <ItemList titre='Accueil' color="green" link="#"/>
                    {isLogged ? (
                        <ItemList titre='Google' color="red" link="https://www.google.com"/>
                    ) : null}
                </nav>

                {/* Bouton connexion */}
                <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-5 py-2 rounded-lg cursor-pointer disabled:cursor-copy"
                >
                    {isLoading ? 'Chargement...' : isLogged ? 'Déconnexion' : 'Connexion'}
                </button>
            </div>
        </header>
    );
}

export default Header;
