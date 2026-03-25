import { useDispatch } from 'react-redux';
import { setLogged } from '../../store/authSlice';
import ItemList from "./ItemList";

function Header() {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(setLogged(false));
    };

    return (
        <header className="hidden md:flex w-full justify-center h-20 bg-white shadow-sm">
            <div className="h-full w-4/5 flex justify-between items-center">
                {/* Logo + Titre */}
                <a className="flex items-center gap-3 h-full" href="/">
                    <img className="h-3/5" src="/favicon.png" alt="Logo Synapses" />
                    <span className="text-3xl font-bold  text-gray-800" style={{ fontFamily: 'Ailerons' }}>Synapses</span>
                </a>

                {/* Menu central */}
                <nav>
                    <ul className="flex gap-10 list-none">
                        <ItemList titre="Accueil" link="#" />
                        <ItemList titre="Rapport" link="#" />
                        <ItemList titre="Liste" link="#" />
                    </ul>
                </nav>

                {/* Bouton déconnexion */}
                <button
                    onClick={handleLogout}
                    className="bg-(--bleu-fonce) hover:bg-(--bleu-clair) text-white font-medium px-5 py-2 rounded-lg cursor-pointer transition-colors duration-200"
                >
                    Déconnexion
                </button>
            </div>
        </header>
    );
}

export default Header;
