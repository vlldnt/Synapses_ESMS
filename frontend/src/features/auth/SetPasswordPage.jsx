import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import faviconUrl from '/favicon.png';
import { setUser, setLogged } from '../../store/authSlice';
import { setRole } from '../../store/roleSlice';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;

function SetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [info, setInfo] = useState(null);
  const [infoError, setInfoError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const basename = import.meta.env.VITE_BASENAME || '';

  useEffect(() => {
    fetch(`${basename}/api/organization-requests/info/${token}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Lien invalide.');
        setInfo(data);
      })
      .catch((err) => setInfoError(err.message));
  }, [token, basename]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(password)) {
      setError('8 caractères min · 1 majuscule · 1 chiffre · 1 caractère spécial');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${basename}/api/organization-requests/complete/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);

      localStorage.setItem('auth_token', data.token);
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        dispatch(setRole(payload.is_admin ? 'admin' : 'agent'));
      } catch { /* ignore */ }

      const { is_admin, ...safeUser } = data.user;
      localStorage.setItem('auth_user', JSON.stringify(safeUser));
      dispatch(setUser(safeUser));
      dispatch(setLogged(true));

      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const passwordOk = PASSWORD_REGEX.test(password);
  const confirmOk = confirm && password === confirm;
  const inputClass = 'w-full px-4 py-2.5 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border) focus:outline-none focus:ring-2 focus:ring-[#1294C3]/40';

  return (
    <div className='min-h-dvh flex items-center justify-center bg-synapses-animated px-3 py-6'>
      <div className='w-full max-w-md bg-(--bg-primary)/90 backdrop-blur-sm rounded-3xl shadow-2xl px-6 py-8 border border-(--border)/50'>
        <div className='flex flex-col items-center mb-6'>
          <img className='h-16 w-16 drop-shadow-lg mb-3' src={faviconUrl} alt='Logo Synapses' />
          <h1 className='text-xl font-bold text-(--text-primary)' style={{ fontFamily: 'Ailerons' }}>
            Synapses ESMS
          </h1>
        </div>

        {infoError ? (
          <div className='flex flex-col items-center gap-4 text-center'>
            <p className='text-sm text-red-500'>{infoError}</p>
            <Link to='/rejoindre' className='text-sm text-[#1294C3] hover:underline'>
              Faire une nouvelle demande
            </Link>
          </div>
        ) : !info ? (
          <p className='text-center text-sm text-(--text-muted)'>Vérification du lien…</p>
        ) : (
          <>
            <div className='mb-6 p-4 rounded-xl bg-(--bg-secondary) border border-(--border) text-sm'>
              <p className='font-semibold text-(--text-primary)'>Bonjour {info.first_name} {info.last_name}</p>
              <p className='text-(--text-muted) text-xs mt-0.5'>{info.contact_email}</p>
              <p className='text-(--text-muted) text-xs mt-1'>{info.org_name}</p>
            </div>

            <p className='text-sm text-(--text-muted) mb-4'>Créez votre mot de passe pour activer votre compte administrateur.</p>

            <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
              <div className='flex flex-col gap-1'>
                <input
                  required
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} ${password ? (passwordOk ? 'border-green-500' : 'border-red-400') : ''}`}
                  placeholder='Mot de passe'
                  autoComplete='new-password'
                />
                <p className='text-[11px] text-(--text-muted) px-1'>
                  8 caractères min · 1 majuscule · 1 chiffre · 1 caractère spécial
                </p>
              </div>

              <input
                required
                type='password'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`${inputClass} ${confirm ? (confirmOk ? 'border-green-500' : 'border-red-400') : ''}`}
                placeholder='Confirmer le mot de passe'
                autoComplete='new-password'
              />

              {error && <p className='text-xs text-red-500 text-center'>{error}</p>}

              <button
                type='submit'
                disabled={submitting}
                className='mt-2 w-full py-3 rounded-lg text-white font-medium text-sm bg-[#1294C3] hover:bg-[#0D66D4] disabled:opacity-60 cursor-pointer transition-colors'
              >
                {submitting ? 'Création du compte…' : 'Créer mon compte'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default SetPasswordPage;
