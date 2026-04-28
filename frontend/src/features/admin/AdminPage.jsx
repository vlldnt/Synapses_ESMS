import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Users, BookUser, Plus, X, Trash2 } from 'lucide-react';
import { authFetch } from '../../services/authServices';
import { createReference, deleteReference } from '../../services/referenceService';
import { useCurrentUser } from '../../hooks/useCurrentUser';

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

const ROLES = [
  { value: 'agent', label: 'Agent' },
  { value: 'direction', label: 'Direction' },
];

const inputCls =
  'w-full px-3 py-2 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border) text-sm focus:outline-none focus:ring-2 focus:ring-[#1294C3]/40';

function CreateUserModal({ organizationId, onClose }) {
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
        body: JSON.stringify({ ...fields, organizationId, is_admin: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      setSent(true);
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
              className='w-full py-2.5 rounded-lg bg-[#1294C3] text-white text-sm font-medium hover:bg-[#0D66D4] cursor-pointer transition-colors'
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
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-(--text-muted)'>Rôle</label>
              <select value={fields.role} onChange={set('role')} className={inputCls}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {error && <p className='text-xs text-red-500'>{error}</p>}
            <button
              type='submit'
              disabled={submitting}
              className='mt-1 w-full py-2.5 rounded-lg bg-[#1294C3] text-white text-sm font-medium hover:bg-[#0D66D4] disabled:opacity-60 cursor-pointer transition-colors'
            >
              {submitting ? 'Envoi…' : 'Envoyer l\'invitation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function CreateReferenceModal({ employees, onClose, onCreated }) {
  const [fields, setFields] = useState({ firstName: '', lastName: '', educatorId: '' });
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
      const newRef = await createReference({
        firstName: fields.firstName.trim(),
        lastName: fields.lastName.trim(),
        educatorId: fields.educatorId || undefined,
      });
      onCreated(newRef);
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
          <h2 className='text-sm font-semibold text-(--text-primary)'>Ajouter une référence</h2>
          <button
            type='button'
            onClick={onClose}
            className='w-7 h-7 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) flex items-center justify-center cursor-pointer'
          >
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
                  {emp.firstName} {emp.lastName}{emp.job ? ` — ${emp.job}` : ''}
                </option>
              ))}
            </select>
          </div>
          {error && <p className='text-xs text-red-500'>{error}</p>}
          <button
            type='submit'
            disabled={submitting}
            className='mt-1 w-full py-2.5 rounded-lg bg-[#1294C3] text-white text-sm font-medium hover:bg-[#0D66D4] disabled:opacity-60 cursor-pointer transition-colors'
          >
            {submitting ? 'Création…' : 'Ajouter la référence'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminPage() {
  const role = useSelector((state) => state.role.role);
  const { user, organization } = useCurrentUser();

  const [employees, setEmployees] = useState([]);
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRefModal, setShowRefModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [deletingRefId, setDeletingRefId] = useState(null);

  useEffect(() => {
    if (role !== 'admin' || !user?.organizationId) return;
    const base = import.meta.env.VITE_BASENAME || '/synapses';
    Promise.all([
      authFetch(`${base}/api/users`).then((r) => r.json()),
      authFetch(`${base}/api/references`).then((r) => r.json()),
    ])
      .then(([users, refs]) => {
        setEmployees(Array.isArray(users) ? users : []);
        setReferences(Array.isArray(refs) ? refs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role, user?.organizationId]);

  if (role !== 'admin') return <Navigate to='/' replace />;

  const availableJobs = [...new Set(employees.map((e) => e.job).filter(Boolean))];

  const filteredEmployees = employees.filter((emp) => {
    if (roleFilter !== 'all' && emp.role !== roleFilter && !(roleFilter === 'admin' && emp.is_admin)) return false;
    if (jobFilter !== 'all' && emp.job !== jobFilter) return false;
    return true;
  });

  async function handleDeleteRef(id) {
    setDeletingRefId(id);
    try {
      await deleteReference(id);
      setReferences((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingRefId(null);
    }
  }

  function getEducatorName(educatorId) {
    if (!educatorId) return null;
    const emp = employees.find((e) => e.id === educatorId);
    return emp ? `${emp.firstName} ${emp.lastName}` : null;
  }

  return (
    <div id='admin-page' className='h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8'>
      <div className='mx-auto w-full flex flex-col gap-6'>

        <div>
          <h1 className='text-xl md:text-3xl font-semibold text-(--text-primary)'>Administration</h1>
          <p className='mt-1 text-xs md:text-sm text-(--text-muted)'>{organization?.name}</p>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded-2xl border border-(--border) bg-(--bg-primary) p-5 flex items-center gap-4 shadow-sm'>
            <div className='p-3 rounded-xl bg-[#1294C3] shrink-0'>
              <Users size={20} className='text-white' />
            </div>
            <div>
              <p className='text-2xl font-bold text-(--text-primary)'>{employees.length}</p>
              <p className='text-xs text-(--text-muted)'>Employés</p>
            </div>
          </div>
          <div className='rounded-2xl border border-(--border) bg-(--bg-primary) p-5 flex items-center gap-4 shadow-sm'>
            <div className='p-3 rounded-xl bg-[#0D66D4] shrink-0'>
              <BookUser size={20} className='text-white' />
            </div>
            <div>
              <p className='text-2xl font-bold text-(--text-primary)'>{references.length}</p>
              <p className='text-xs text-(--text-muted)'>Références</p>
            </div>
          </div>
        </div>

        {/* ── Employés ── */}
        <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm'>
          <div className='px-5 pt-5 pb-3 border-b border-(--border) flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <h2 className='text-sm md:text-base font-semibold text-(--text-primary)'>Employés</h2>
              <button
                type='button'
                onClick={() => setShowUserModal(true)}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1294C3] text-white text-xs font-medium hover:bg-[#0D66D4] cursor-pointer transition-colors'
              >
                <Plus size={13} /> Ajouter
              </button>
            </div>
            <div className='flex gap-2 flex-wrap'>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className='text-xs px-2.5 py-1.5 rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) focus:outline-none cursor-pointer'
              >
                <option value='all'>Tous les rôles</option>
                <option value='admin'>Admin</option>
                <option value='direction'>Direction</option>
                <option value='agent'>Agent</option>
              </select>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className='text-xs px-2.5 py-1.5 rounded-lg border border-(--border) bg-(--bg-secondary) text-(--text-primary) focus:outline-none cursor-pointer'
              >
                <option value='all'>Tous les postes</option>
                {availableJobs.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
          {loading ? (
            <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Chargement…</p>
          ) : filteredEmployees.length === 0 ? (
            <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucun employé.</p>
          ) : (
            <div className='divide-y divide-(--border)/50'>
              {filteredEmployees.map((emp) => (
                <div key={emp.id} className='flex items-center gap-3 px-5 py-3.5'>
                  <div className='w-9 h-9 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-sm font-semibold text-(--text-secondary) shrink-0 uppercase'>
                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-(--text-primary)'>{emp.firstName} {emp.lastName}</p>
                    <p className='text-xs text-(--text-muted) truncate'>
                      {emp.email}{emp.job ? ` · ${emp.job}` : ''}
                    </p>
                  </div>
                  <div className='flex items-center gap-1.5 shrink-0'>
                    {emp.is_admin && (
                      <span className='text-[11px] font-medium px-2 py-0.5 rounded-full text-[#1294C3] bg-blue-50'>Admin</span>
                    )}
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${emp.status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                      {emp.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Références ── */}
        <div className='rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm'>
          <div className='px-5 pt-5 pb-3 border-b border-(--border) flex items-center justify-between'>
            <h2 className='text-sm md:text-base font-semibold text-(--text-primary)'>Références de l'organisation</h2>
            <button
              type='button'
              onClick={() => setShowRefModal(true)}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1294C3] text-white text-xs font-medium hover:bg-[#0D66D4] cursor-pointer transition-colors'
            >
              <Plus size={13} /> Ajouter
            </button>
          </div>
          {loading ? (
            <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Chargement…</p>
          ) : references.length === 0 ? (
            <p className='px-5 py-10 text-center text-sm text-(--text-muted)'>Aucune référence.</p>
          ) : (
            <div className='divide-y divide-(--border)/50'>
              {references.map((ref) => {
                const educatorName = getEducatorName(ref.educator);
                return (
                  <div key={ref.id} className='flex items-center gap-3 px-5 py-3.5'>
                    <div className='w-9 h-9 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-sm font-semibold text-(--text-secondary) shrink-0 uppercase'>
                      {ref.firstName?.[0]}{ref.lastName?.[0]}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-(--text-primary)'>{ref.firstName} {ref.lastName}</p>
                      {educatorName && (
                        <p className='text-xs text-(--text-muted) truncate'>Référent : {educatorName}</p>
                      )}
                    </div>
                    <button
                      type='button'
                      disabled={deletingRefId === ref.id}
                      onClick={() => handleDeleteRef(ref.id)}
                      className='p-1.5 rounded-md text-(--text-muted) hover:text-red-500 hover:bg-red-50 disabled:opacity-40 cursor-pointer transition-colors'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {showUserModal && (
        <CreateUserModal
          organizationId={user?.organizationId}
          onClose={() => setShowUserModal(false)}
        />
      )}

      {showRefModal && (
        <CreateReferenceModal
          employees={employees}
          onClose={() => setShowRefModal(false)}
          onCreated={(newRef) => setReferences((prev) => [...prev, newRef])}
        />
      )}
    </div>
  );
}

export default AdminPage;
