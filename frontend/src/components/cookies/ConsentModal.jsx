import { X, ShieldCheck, Cookie } from 'lucide-react';

const COOKIES = [
  {
    name: 'access_token_cookie',
    finalite: "Authentification - identifie votre session active auprès de l'API",
    duree: '15 minutes',
    type: 'HttpOnly, Secure, SameSite=Lax',
  },
  {
    name: 'refresh_token_cookie',
    finalite: 'Maintien de session - permet le renouvellement sécurisé de votre authentification',
    duree: '7 jours',
    type: 'HttpOnly, Secure, SameSite=Lax',
  },
  {
    name: 'csrf_access_token',
    finalite: 'Protection CSRF - sécurise les requêtes authentifiées contre les attaques cross-site',
    duree: '15 minutes',
    type: 'Secure, SameSite=Lax',
  },
  {
    name: 'csrf_refresh_token',
    finalite: 'Protection CSRF - sécurise le renouvellement de session contre les attaques cross-site',
    duree: '7 jours',
    type: 'Secure, SameSite=Lax',
  },
  {
    name: 'theme',
    finalite: "Préférence d'affichage - mémorise votre choix de thème clair ou sombre",
    duree: '7 jours',
    type: 'SameSite=Strict',
  },
];

export default function ConsentModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-(--bg-primary) rounded-2xl shadow-2xl border border-(--border) flex flex-col max-h-[90dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-(--border) shrink-0">
          <div className="flex items-center gap-3">
            <Cookie size={20} className="text-(--bleu-fonce)" />
            <h2 className="text-base font-semibold text-(--text-primary)">Gestion des cookies</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-(--text-muted) hover:bg-(--bg-tertiary) hover:text-(--text-primary) transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-6">

          {/* Catégorie */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-green-500" />
              <span className="text-sm font-semibold text-(--text-primary)">Cookies strictement nécessaires</span>
              <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                Toujours actifs
              </span>
            </div>
            <p className="text-xs text-(--text-muted) mb-4 leading-relaxed">
              Ces cookies sont indispensables au fonctionnement de l'application. Ils permettent notamment
              l'authentification, la sécurisation de votre session et la mémorisation de certaines
              préférences d'affichage. Ils ne peuvent pas être désactivés, faute de quoi l'accès au service
              ne pourrait pas fonctionner correctement.
            </p>

            {/* Table desktop */}
            <div className="hidden sm:block rounded-xl border border-(--border) overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-(--bg-secondary) border-b border-(--border)">
                    <th className="text-left px-4 py-2.5 text-(--text-muted) font-medium w-1/4">Nom</th>
                    <th className="text-left px-4 py-2.5 text-(--text-muted) font-medium">Finalité</th>
                    <th className="text-left px-4 py-2.5 text-(--text-muted) font-medium w-24">Durée</th>
                    <th className="text-left px-4 py-2.5 text-(--text-muted) font-medium w-36">Attributs</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIES.map((c, i) => (
                    <tr
                      key={c.name}
                      className={i < COOKIES.length - 1 ? 'border-b border-(--border)' : ''}
                    >
                      <td className="px-4 py-3 font-mono text-[11px] text-(--text-primary) align-top">{c.name}</td>
                      <td className="px-4 py-3 text-(--text-secondary) align-top leading-relaxed">{c.finalite}</td>
                      <td className="px-4 py-3 text-(--text-muted) align-top whitespace-nowrap">{c.duree}</td>
                      <td className="px-4 py-3 text-(--text-muted) align-top leading-relaxed">{c.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="flex sm:hidden flex-col gap-3">
              {COOKIES.map((c) => (
                <div key={c.name} className="rounded-xl border border-(--border) p-4 flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] text-(--bleu-fonce) font-semibold">{c.name}</span>
                  <span className="text-xs text-(--text-secondary) leading-relaxed">{c.finalite}</span>
                  <span className="text-[11px] text-(--text-muted) mt-1">Durée : {c.duree}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Note tiers */}
          <div className="rounded-xl bg-(--bg-secondary) border border-(--border) p-4 text-xs text-(--text-muted) leading-relaxed">
            <strong className="text-(--text-primary)">
              Synapses ESMS n'utilise aucun cookie publicitaire, analytique ou de suivi tiers.
            </strong>
            {' '}Aucune donnée de navigation n'est transmise à des services externes à des fins de mesure
            d'audience, de profilage ou de ciblage publicitaire.
          </div>

          {/* Droits RGPD */}
          <div className="text-xs text-(--text-muted) leading-relaxed">
            Conformément au RGPD et à la loi Informatique et Libertés, vous disposez de droits d'accès,
            de rectification, d'effacement et de limitation concernant vos données personnelles.
            Vous pouvez exercer ces droits à l'adresse suivante :{' '}
            <a
              href="mailto:contact@synapses-esms.fr"
              className="text-(--bleu-fonce) hover:underline"
            >
              contact@synapses-esms.fr
            </a>
            .
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-(--bleu-fonce) text-white text-sm font-medium hover:bg-(--bleu-active) transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
