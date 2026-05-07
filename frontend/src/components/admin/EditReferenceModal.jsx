import { useState } from 'react';
import { X } from 'lucide-react';
import { authFetch } from '../../services/authServices';

const inputCls =
  'w-full px-3 py-2 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border) text-sm focus:outline-none focus:ring-2 focus:ring-(--bleu-fonce)/40';

export default function EditReferenceModal({ reference, employees, onClose, onUpdated }) {
  const [fields, setFields] = useState({
    firstName: reference.first_name || '',
    lastName: reference.last_name || '',
    educatorId: reference.educator || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function set(key) {
    return (e) => setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fields.firstName.trim() || !fields.lastName.trim()) {
      setError('Prénom et nom sont requis.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const base = import.meta.env.VITE_BASENAME || '/synapses';
      const res = await authFetch(`${base}/api/references/${reference.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          educatorId: fields.educatorId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      onUpdated(data);
      onClose();
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
          <h2 className='text-sm font-semibold text-(--text-primary)'>Modifier la référence</h2>
          <button type='button' onClick={onClose} className='w-7 h-7 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) flex items-center justify-center cursor-pointer'>
            <X size={14} />
          </button>
        </div>
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
            <label className='text-xs text-(--text-muted)'>Référent assigné (optionnel)</label>
            <select value={fields.educatorId} onChange={set('educatorId')} className={inputCls}>
              <option value=''>Aucun</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}{emp.job ? ` — ${emp.job}` : ''}
                </option>
              ))}
            </select>
          </div>
          {error && <p className='text-xs text-red-500'>{error}</p>}
          <button type='submit' disabled={submitting} className='mt-1 w-full py-2.5 rounded-lg bg-(--bleu-fonce) text-white text-sm font-medium hover:bg-(--bleu-active) disabled:opacity-60 cursor-pointer transition-colors'>
            {submitting ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}
