import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import faviconUrl from '/favicon.png';
import { getStructureTypeCategories } from '../../services/structureTypeService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { orgName: 100, structureType: 80, firstName: 50, lastName: 50, contactEmail: 150 };

function getErrors(fields) {
  const e = {};
  if (!fields.orgName.trim()) e.orgName = true;
  if (!fields.structureType) e.structureType = true;
  if (!fields.firstName.trim()) e.firstName = true;
  if (!fields.lastName.trim()) e.lastName = true;
  if (!fields.contactEmail.trim() || !EMAIL_REGEX.test(fields.contactEmail)) e.contactEmail = true;
  return e;
}

function JoinRequestPage() {
  const loadedAt = useRef(Date.now());

  const [fields, setFields] = useState({
    orgName: '',
    structureType: '',
    description: '',
    firstName: '',
    lastName: '',
    contactEmail: '',
  });
  const [categories, setCategories] = useState([]);
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getStructureTypeCategories().then(setCategories).catch(() => {});
  }, []);

  function set(key) {
    return (e) => {
      setFields((f) => ({ ...f, [key]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [key]: false }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - loadedAt.current < 3000) {
      setResult({ ok: false, msg: 'Soumission trop rapide, veuillez réessayer.' });
      return;
    }
    const errors = getErrors(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setResult({ ok: false, msg: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    setResult(null);

    try {
      const basename = import.meta.env.VITE_BASENAME || '';
      const res = await fetch(`${basename}/api/organization-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_name: fields.orgName,
          structure_type: fields.structureType,
          description: fields.description,
          first_name: fields.firstName,
          last_name: fields.lastName,
          contact_email: fields.contactEmail,
          _hp: honeypot,
          _t: loadedAt.current,
        }),
      }); 

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error || `Erreur ${res.status}`;
        if (errMsg.includes('manquants')) setFieldErrors(getErrors(fields));
        throw new Error(errMsg);
      }

      setResult({ ok: true });
      setFields({ orgName: '', structureType: '', description: '', firstName: '', lastName: '', contactEmail: '' });
    } catch (err) {
      setResult({ ok: false, msg: err.message || "Échec de l'envoi, veuillez réessayer." });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border)';
  const errCls = (key) => fieldErrors[key] ? 'border-red-500 focus:ring-red-400/40' : '';

  if (result?.ok) {
    return (
      <div className='min-h-dvh flex items-center justify-center bg-synapses-animated px-3 py-6'>
        <div className='w-full max-w-md bg-(--bg-primary)/90 backdrop-blur-sm rounded-3xl shadow-2xl px-6 py-8 border border-(--border)/50 flex flex-col items-center gap-4 text-center'>
          <img className='h-16 w-16' src={faviconUrl} alt='Logo Synapses' />
          <h2 className='text-xl font-semibold text-(--text-primary)'>Demande envoyée !</h2>
          <p className='text-sm text-(--text-muted)'>
            Un email a été envoyé à <strong>{fields.contactEmail || 'votre adresse'}</strong>. Cliquez sur le lien pour créer votre mot de passe et activer votre compte.
          </p>
          <Link to='/login' className='mt-2 text-sm text-(--bleu-fonce) hover:underline'>
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id='join-request-page' className='min-h-dvh flex items-center justify-center bg-synapses-animated px-3 py-6'>
      <div className='absolute hidden md:flex left-2 top-2'>
        <Link className='flex flex-row justify-center items-center gap-3 px-5 py-6' to='/login'>
          <img className='h-10' src={faviconUrl} alt='Logo Synapses' />
          <span className='md:text-xl font-bold text-white dark:text-gray-200' style={{ fontFamily: 'Ailerons' }}>
            Synapses ESMS
          </span>
        </Link>
      </div>

      <div className='w-full max-w-xl mx-2 md:mx-4 bg-(--bg-primary)/90 backdrop-blur-sm rounded-3xl md:rounded-4xl shadow-2xl px-5 pb-5 pt-3 md:px-8 md:pb-8 md:pt-4 border border-(--border)/50'>
        <div className='flex flex-col w-full items-center mb-4 md:mb-6'>
          <img className='h-20 w-20 md:h-28 md:w-28 drop-shadow-lg' src={faviconUrl} alt='Logo Synapses' />
          <h1 className='text-[24px] md:text-[36px] text-(--text-primary) tracking-wide font-bold' style={{ fontFamily: 'Ailerons' }}>
            Rejoindre Synapses
          </h1>
          <p className='text-(--text-muted) text-center text-xs md:text-sm w-full mt-2'>
            Demande d'ouverture de structure
          </p>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-3 md:gap-4'>
          <input type='text' name='website' value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1} aria-hidden='true'
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} />

          <input required value={fields.orgName} onChange={set('orgName')} maxLength={MAX.orgName}
            className={`${inputClass} ${errCls('orgName')}`} placeholder='Nom de la structure' />

          <select required value={fields.structureType} onChange={set('structureType')}
            className={`${inputClass} ${!fields.structureType ? 'text-(--text-muted)' : ''} ${errCls('structureType')}`}>
            <option value='' disabled>Type de structure</option>
            {categories.map((cat) => (
              <optgroup key={cat.label} label={cat.label}>
                {cat.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </optgroup>
            ))}
          </select>

          <textarea
            value={fields.description}
            onChange={set('description')}
            maxLength={300}
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder='Description (optionnel)'
          />

          <div className='grid grid-cols-2 gap-3'>
            <input required value={fields.firstName} onChange={set('firstName')} maxLength={MAX.firstName}
              className={`${inputClass} ${errCls('firstName')}`} placeholder='Prénom' />
            <input required value={fields.lastName} onChange={set('lastName')} maxLength={MAX.lastName}
              className={`${inputClass} ${errCls('lastName')}`} placeholder='Nom' />
          </div>

          <input required type='email' value={fields.contactEmail} onChange={set('contactEmail')}
            maxLength={MAX.contactEmail} className={`${inputClass} ${errCls('contactEmail')}`} placeholder='Email' autoComplete='email' />

          <button type='submit' disabled={submitting}
            className='mt-1 w-full py-2.5 md:py-3 rounded-lg text-white font-medium cursor-pointer text-sm md:text-base bg-(--bleu-fonce) hover:bg-(--bleu-active) disabled:opacity-60 transition-all duration-200'>
            {submitting ? 'Envoi...' : 'Envoyer ma demande'}
          </button>

          {result?.msg && (
            <p className='text-sm text-center text-red-500'>{result.msg}</p>
          )}

          <div className='text-center mt-1'>
            <Link to='/login' className='text-xs text-(--text-muted) hover:underline'>
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinRequestPage;
