function Header() {
    return (
        <header className="hidden md:flex w-full justify-center h-25 border-b border-gray-200">
            <div className="h-full w-4/5 flex justify-between items-center">
                <a  className="h-full flex justify-center items-center " 
                    href="/">
                    <img className="h-full" src="/favicon.png" alt="Logo Synapses" />
                </a>
                <nav className="flex justify-end items-center">
                    <ul className="flex gap-10 justify-end items-center">
                        <li>Acceuil</li>
                        <li>Rapport</li>
                        <li>Connexion</li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;