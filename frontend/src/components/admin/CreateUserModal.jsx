import { useState } from 'react';
import { X } from 'lucide-react';
import { authFetch } from '../../services/authServices';

const JOBS = [
  'Éducateur(rice) spécialisé(e)',
  'Moniteur(rice) éducateur(rice)',
  'Aide médico-psychologique',
  'Accompagnant(e) éducatif(ve) et social(e)',
  'Assistant(e) de service social',
  'Infirmier(ère)',
  'Psychologue',
  'Chef(fe) de service',
  'Directeur(rice)',
  'Secrétaire',
  'Comptable',
  'Autre',
];

const inputCls =
  'w-full px-3 py-2 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border) text-sm focus:outline-none focus:ring-2 focus:ring-(--bleu-fonce)/40';

export default function CreateUserModal({ organizationId, onClose, onCreated }) {
  const [fields, setFields] = useState({ firstName: '', lastName: '', email: '', job: '', role: 'agent' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  function set(key) {
    return (e) => setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fields.firstName.trim() || !fields.lastName.trim() || !fields.email.trim()) {
      setError('Nom, prénom et email sont requis.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const base = import.meta.env.VITE_BASENAME || '/synapses';
      const res = await authFetch(`${base}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            first_name: fields.firstName.trim(),
            last_name: fields.lastName.trim(),
            email: fields.email.trim(),
            job: fields.job,
            role: fields.role,
            organization_id: organizationId,
            is_admin: false,
          }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      setSent(true);
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='w-full max-w-md bg-(--bg-primary) rounded-2xl shadow-2xl border border-(--border) overflow-hidden'>
        <div className='flex items-center justify-between px-5 py-4 border-b border-(--border)'>
          <h2 className='text-sm font-semibold text-(--text-primary)'>Ajouter un employé</h2>
          <button
            type='button'
            onClick={onClose}
            className='w-7 h-7 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) flex items-center justify-center cursor-pointer'
          >
            <X size={14} />
          </button>
        </div>

        {sent ? (
          <div className='p-5 flex flex-col gap-4 text-center'>
            <p className='text-sm text-(--text-primary)'>
              <span className='font-semibold text-green-600'>Invitation envoyée !</span>
            </p>
            <p className='text-xs text-(--text-muted)'>
              Un email a été envoyé à <strong>{fields.email}</strong>.<br />
              {fields.firstName} recevra un lien pour créer son mot de passe.
            </p>
            <button
              type='button'
              onClick={onClose}
              className='w-full py-2.5 rounded-lg bg-(--bleu-fonce) text-white text-sm font-medium hover:bg-(--bleu-active) cursor-pointer transition-colors'
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='p-5 flex flex-col gap-3'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-(--text-muted)'>Prénom</label>
                <input required value={fields.firstName} onChange={set('firstName')} className={inputCls} placeholder='Prénom' />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-(--text-muted)'>Nom</label>
                <input required value={fields.lastName} onChange={set('lastName')} className={inputCls} placeholder='Nom' />
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-(--text-muted)'>Email</label>
              <input required type='email' value={fields.email} onChange={set('email')} className={inputCls} placeholder='email@structure.fr' autoComplete='off' />
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-(--text-muted)'>Poste</label>
              <select value={fields.job} onChange={set('job')} className={inputCls}>
                <option value=''>Sélectionner un poste</option>
                {JOBS.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>

            {error && <p className='text-xs text-red-500'>{error}</p>}
            <button
              type='submit'
              disabled={submitting}
              className='mt-1 w-full py-2.5 rounded-lg bg-(--bleu-fonce) text-white text-sm font-medium hover:bg-(--bleu-active) disabled:opacity-60 cursor-pointer transition-colors'
            >
              {submitting ? 'Envoi…' : 'Envoyer l\'invitation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
