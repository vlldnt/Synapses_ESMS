import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Building2, Users, ClipboardList, Plus, X, Copy, Check } from 'lucide-react';
import { authFetch } from '../../services/authServices';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const REQUEST_STATUS = {
  pending_verification: { label: 'En attente', cls: 'text-amber-600 bg-amber-50' },
  approved: { label: 'Approuvé', cls: 'text-green-600 bg-green-50' },
  rejected: { label: 'Refusé', cls: 'text-red-600 bg-red-50' },
};

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

const inputCls = 'w-full px-3 py-2 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border) text-sm focus:outline-none focus:ring-2 focus:ring-[#1294C3]/40';

function CreateUserModal({ organizationId, onClose, onCreated }) {
  const [fields, setFields] = useState({ firstName: '', lastName: '', email: '', job: '', role: 'agent' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

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
      setCreated(data);
      onCreated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyPassword() {
    navigator.clipboard.writeText(created.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-(--bg-primary) rounded-2xl shadow-2xl border border-(--border) overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
          <h2 className="text-sm font-semibold text-(--text-primary)">Ajouter un employé</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) flex items-center justify-center cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {created ? (
          <div className="p-5 flex flex-col gap-4">
            <p className="text-sm text-(--text-primary)">
              <span className="font-semibold text-green-600">Compte créé !</span> Transmettez ces identifiants à {created.user.firstName} :
            </p>
            <div className="rounded-lg border border-(--border) bg-(--bg-secondary) p-4 flex flex-col gap-1 text-sm">
              <p className="text-(--text-muted) text-xs">Email</p>
              <p className="font-medium text-(--text-primary)">{created.user.email}</p>
              <p className="text-(--text-muted) text-xs mt-2">Mot de passe temporaire</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold text-(--text-primary) tracking-wider">{created.tempPassword}</p>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="ml-auto p-1.5 rounded-md border border-(--border) text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-primary) cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-[#1294C3] text-white text-sm font-medium hover:bg-[#0D66D4] cursor-pointer transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-(--text-muted)">Prénom</label>
                <input required value={fields.firstName} onChange={set('firstName')} className={inputCls} placeholder="Prénom" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-(--text-muted)">Nom</label>
                <input required value={fields.lastName} onChange={set('lastName')} className={inputCls} placeholder="Nom" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-(--text-muted)">Email</label>
              <input required type="email" value={fields.email} onChange={set('email')} className={inputCls} placeholder="email@structure.fr" autoComplete="off" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-(--text-muted)">Poste</label>
              <select value={fields.job} onChange={set('job')} className={inputCls}>
                <option value="">Sélectionner un poste</option>
                {JOBS.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-(--text-muted)">Rôle</label>
              <select value={fields.role} onChange={set('role')} className={inputCls}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full py-2.5 rounded-lg bg-[#1294C3] text-white text-sm font-medium hover:bg-[#0D66D4] disabled:opacity-60 cursor-pointer transition-colors"
            >
              {submitting ? 'Création…' : 'Créer le compte'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, bg }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-primary) p-5 flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-xl ${bg} shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-(--text-primary)">{value}</p>
        <p className="text-xs text-(--text-muted)">{label}</p>
      </div>
    </div>
  );
}

function AdminPage() {
  const role = useSelector((state) => state.role.role);
  const { user, organization } = useCurrentUser();

  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (role !== 'admin' || !user?.organizationId) return;
    const base = import.meta.env.VITE_BASENAME || '/synapses';
    Promise.all([
      authFetch(`${base}/api/users`).then((r) => r.json()),
      authFetch(`${base}/api/organization-requests`).then((r) => r.json()),
    ])
      .then(([users, reqs]) => {
        setEmployees((Array.isArray(users) ? users : []).filter((u) => u.organizationId === user.organizationId));
        setRequests(Array.isArray(reqs) ? reqs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role, user?.organizationId]);

  if (role !== 'admin') return <Navigate to="/" replace />;

  const pending = requests.filter((r) => r.status === 'pending_verification').length;

  return (
    <div id="admin-page" className="h-full overflow-y-auto py-6 px-3 md:px-8 md:py-8">
      <div className="mx-auto w-full flex flex-col gap-6">

        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-(--text-primary)">Administration</h1>
          <p className="mt-1 text-xs md:text-sm text-(--text-muted)">{organization?.name}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard icon={Building2} label="Structure" value={organization ? 1 : 0} bg="bg-[#1294C3]" />
          <StatCard icon={Users} label="Employés" value={employees.length} bg="bg-[#0D66D4]" />
          <StatCard icon={ClipboardList} label="Demandes en attente" value={pending} bg="bg-amber-500" />
        </div>

        {/* Employés */}
        <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm">
          <div className="px-5 pt-5 pb-3 border-b border-(--border) flex items-center justify-between">
            <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Mes employés</h2>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1294C3] text-white text-xs font-medium hover:bg-[#0D66D4] cursor-pointer transition-colors"
            >
              <Plus size={13} /> Ajouter
            </button>
          </div>
          {loading ? (
            <p className="px-5 py-10 text-center text-sm text-(--text-muted)">Chargement…</p>
          ) : employees.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-(--text-muted)">Aucun employé pour l'instant.</p>
          ) : (
            <div className="divide-y divide-(--border)/50">
              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-(--bg-tertiary) flex items-center justify-center text-sm font-semibold text-(--text-secondary) shrink-0 uppercase">
                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--text-primary)">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-(--text-muted) truncate">{emp.email}{emp.job ? ` · ${emp.job}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {emp.is_admin && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full text-[#1294C3] bg-blue-50">Admin</span>
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

        {/* Demandes d'adhésion */}
        <div className="rounded-2xl border border-(--border) bg-(--bg-primary) shadow-sm">
          <div className="px-5 pt-5 pb-3 border-b border-(--border)">
            <h2 className="text-sm md:text-base font-semibold text-(--text-primary)">Demandes d'adhésion</h2>
          </div>
          {loading ? (
            <p className="px-5 py-10 text-center text-sm text-(--text-muted)">Chargement…</p>
          ) : requests.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-(--text-muted)">Aucune demande.</p>
          ) : (
            <div className="divide-y divide-(--border)/50">
              {requests.map((r) => {
                const s = REQUEST_STATUS[r.status] || { label: r.status, cls: 'text-(--text-muted) bg-(--bg-tertiary)' };
                return (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--text-primary) truncate">{r.orgName}</p>
                      <p className="text-xs text-(--text-muted) truncate">{r.firstName} {r.lastName} · {r.contactEmail}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
                    <span className="text-xs text-(--text-muted) shrink-0 hidden md:block">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {showModal && (
        <CreateUserModal
          organizationId={user?.organizationId}
          onClose={() => setShowModal(false)}
          onCreated={(newUser) => setEmployees((prev) => [...prev, newUser])}
        />
      )}
    </div>
  );
}

export default AdminPage;
