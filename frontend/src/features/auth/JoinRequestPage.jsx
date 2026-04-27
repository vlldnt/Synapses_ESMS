import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import faviconUrl from '/favicon.png';
import { getStructureTypeCategories } from '../../services/structureTypeService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;
const MAX = { orgName: 100, structureType: 80, firstName: 50, lastName: 50, contactEmail: 150 };

function validate(fields) {
  if (!fields.orgName.trim()) return 'Le nom de la structure est requis.';
  if (!fields.structureType) return 'Le type de structure est requis.';
  if (!fields.firstName.trim()) return 'Le prénom est requis.';
  if (!fields.lastName.trim()) return 'Le nom est requis.';
  if (!fields.contactEmail.trim()) return "L'email est requis.";
  if (!EMAIL_REGEX.test(fields.contactEmail)) return 'Adresse email invalide.';
  if (!PASSWORD_REGEX.test(fields.password)) return 'Mot de passe : 8 caractères min, 1 majuscule, 1 chiffre, 1 caractère spécial.';
  if (fields.password !== fields.confirmPassword) return 'Les mots de passe ne correspondent pas.';
  return null;
}

function JoinRequestPage() {
  const loadedAt = useRef(Date.now());

  const [fields, setFields] = useState({
    orgName: '', structureType: '', firstName: '', lastName: '',
    contactEmail: '', password: '', confirmPassword: '',
  });
  const [categories, setCategories] = useState([]);
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getStructureTypeCategories().then(setCategories).catch(() => {});
  }, []);

  function set(key) {
    return (e) => setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - loadedAt.current < 3000) {
      setResult({ ok: false, msg: 'Soumission trop rapide, veuillez réessayer.' });
      return;
    }
    const error = validate(fields);
    if (error) { setResult({ ok: false, msg: error }); return; }

    setSubmitting(true);
    setResult(null);

    try {
      const basename = import.meta.env.VITE_BASENAME || '';
      const res = await fetch(`${basename}/api/organization-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName: fields.orgName,
          structureType: fields.structureType,
          firstName: fields.firstName,
          lastName: fields.lastName,
          contactEmail: fields.contactEmail,
          password: fields.password,
          _hp: honeypot,
          _t: loadedAt.current,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur ${res.status}`);
      }

      setResult({ ok: true, msg: 'Demande envoyée ! Vérifiez votre email pour confirmer votre compte.' });
      setFields({ orgName: '', structureType: '', firstName: '', lastName: '', contactEmail: '', password: '', confirmPassword: '' });
    } catch (err) {
      setResult({ ok: false, msg: err.message || "Échec de l'envoi, veuillez réessayer." });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border)';

  const passwordOk = PASSWORD_REGEX.test(fields.password);
  const confirmOk = fields.confirmPassword && fields.password === fields.confirmPassword;

  return (
    <div id="join-request-page" className="min-h-dvh flex items-center justify-center bg-synapses-animated px-3 py-6">
      <div className="absolute hidden md:flex left-2 top-2">
        <Link className="flex flex-row justify-center items-center gap-3 px-5 py-6" to="/login">
          <img className="h-10" src={faviconUrl} alt="Logo Synapses" />
          <span className="md:text-xl font-bold text-white dark:text-gray-200" style={{ fontFamily: 'Ailerons' }}>
            Synapses ESMS
          </span>
        </Link>
      </div>

      <div className="w-full max-w-xl mx-2 md:mx-4 bg-(--bg-primary)/90 backdrop-blur-sm rounded-3xl md:rounded-4xl shadow-2xl px-5 pb-5 pt-3 md:px-8 md:pb-8 md:pt-4 border border-(--border)/50">
        <div className="flex flex-col w-full items-center mb-4 md:mb-6">
          <img className="h-20 w-20 md:h-28 md:w-28 drop-shadow-lg" src={faviconUrl} alt="Logo Synapses" />
          <h1 className="text-[24px] md:text-[36px] text-(--text-primary) tracking-wide font-bold" style={{ fontFamily: 'Ailerons' }}>
            Rejoindre Synapses
          </h1>
          <p className="text-(--text-muted) text-center text-xs md:text-sm w-full mt-2">
            Demande d'ouverture de structure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4">
          {/* honeypot */}
          <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1} aria-hidden="true"
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} />

          <input required value={fields.orgName} onChange={set('orgName')} maxLength={MAX.orgName}
            className={inputClass} placeholder="Nom de la structure" />

          <select required value={fields.structureType} onChange={set('structureType')}
            className={`${inputClass} ${!fields.structureType ? 'text-(--text-muted)' : ''}`}>
            <option value="" disabled>Type de structure</option>
            {categories.map((cat) => (
              <optgroup key={cat.label} label={cat.label}>
                {cat.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </optgroup>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input required value={fields.firstName} onChange={set('firstName')} maxLength={MAX.firstName}
              className={inputClass} placeholder="Prénom" />
            <input required value={fields.lastName} onChange={set('lastName')} maxLength={MAX.lastName}
              className={inputClass} placeholder="Nom" />
          </div>

          <input required type="email" value={fields.contactEmail} onChange={set('contactEmail')}
            maxLength={MAX.contactEmail} className={inputClass} placeholder="Email" autoComplete="email" />

          <div className="flex flex-col gap-1">
            <input required type="password" value={fields.password} onChange={set('password')}
              className={`${inputClass} ${fields.password ? (passwordOk ? 'border-green-500' : 'border-red-400') : ''}`}
              placeholder="Mot de passe" autoComplete="new-password" />
            <p className="text-[11px] text-(--text-muted) px-1">
              8 caractères min · 1 majuscule · 1 chiffre · 1 caractère spécial
            </p>
          </div>

          <input required type="password" value={fields.confirmPassword} onChange={set('confirmPassword')}
            className={`${inputClass} ${fields.confirmPassword ? (confirmOk ? 'border-green-500' : 'border-red-400') : ''}`}
            placeholder="Confirmer le mot de passe" autoComplete="new-password" />

          <button type="submit" disabled={submitting || result?.ok}
            className="mt-1 w-full py-2.5 md:py-3 rounded-lg text-white font-medium cursor-pointer text-sm md:text-base bg-[#1294C3] hover:bg-[#0D66D4] disabled:opacity-60 transition-all duration-200">
            {submitting ? 'Envoi...' : 'Envoyer ma demande'}
          </button>

          {result && (
            <p className={`text-sm text-center ${result.ok ? 'text-emerald-600' : 'text-red-500'}`}>
              {result.msg}
            </p>
          )}

          <div className="text-center mt-1">
            <Link to="/login" className="text-xs text-(--text-muted) hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinRequestPage;
