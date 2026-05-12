import { useEffect, useState } from 'react';
import { logout, authFetch } from '../../services/authServices';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  X,
  LogOut,
  FolderOpen,
  Users,
  ChevronRight,
  Loader2,
  Pencil,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import faviconUrl from '/favicon.png';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { getReferencesByEducator, invalidateReferencesCache } from '../../services/referenceService';
import { getHistory } from '../../services/historyService';

function ReferenceItem({ reference }) {
  const initials =
    `${reference.firstName[0]}${reference.lastName[0]}`.toUpperCase();
  const colors = [
    'bg-blue-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];
  const color =
    colors[
      (reference.id?.charCodeAt(reference.id.length - 1) ?? 0) % colors.length
    ];

  return (
    <div className='flex items-center gap-2.5 px-3 py-2 hover:bg-(--bg-tertiary) transition-colors duration-100 rounded-lg'>
      <div
        className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
      >
        {initials}
      </div>
      <span className='text-sm text-(--text-primary) truncate'>
        {reference.firstName} {reference.lastName}
      </span>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border) text-sm focus:outline-none focus:ring-2 focus:ring-(--bleu-fonce)/40';

function ProfileModal({ onClose }) {
  const { user, organization, initials, fullName } = useCurrentUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [references, setReferences] = useState([]);
  const [archiveCount, setArchiveCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRefs, setShowRefs] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([getReferencesByEducator(user.id), getHistory(user.id)]).then(
      ([refs, history]) => {
        setReferences(refs);
        setArchiveCount(history.length);
        setLoading(false);
      },
    );
  }, [user?.id]);

  function openEdit() {
    setEditFields({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      password: '',
    });
    setSaveError('');
    setSaveSuccess(false);
    setEditMode(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!editFields.firstName.trim() || !editFields.lastName.trim() || !editFields.email.trim()) {
      setSaveError('Prénom, nom et email sont requis.');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const base = import.meta.env.VITE_BASENAME || '/synapses';
      const body = {
        first_name: editFields.firstName.trim(),
        last_name: editFields.lastName.trim(),
        email: editFields.email.trim(),
      };
      if (editFields.password.trim()) body.password = editFields.password.trim();
      const res = await authFetch(`${base}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      const updated = { ...user, ...data };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      dispatch(setUser(updated));
      setSaveSuccess(true);
      setTimeout(() => { setEditMode(false); setSaveSuccess(false); }, 1200);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const handleLogout = () => {
    invalidateReferencesCache();
    logout();
    onClose();
  };

  const handleArchivesClick = () => {
    onClose();
    navigate('/archives');
  };

  return (
    <div
      className='fixed inset-0 z-200 flex items-center justify-center p-4'
      onClick={onClose}
    >
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' />

      <div
        className='relative w-full max-w-sm bg-(--bg-primary) rounded-2xl shadow-2xl border border-(--border) overflow-hidden flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── LEFT: Profile card ─────────────────────────────────── */}
        <div className='flex flex-col'>
          {/* Banner */}
          <div className='relative h-28 bg-white dark:bg-neutral-900 overflow-hidden border-b border-(--border) flex items-center justify-center'>
            <img
              src={faviconUrl}
              alt=''
              aria-hidden='true'
              className='absolute w-26 h-26 object-contain dark:opacity-[0.04] select-none pointer-events-none'
            />
            <button
              onClick={onClose}
              className='absolute top-3 right-3 p-1.5 rounded-lg bg-(--bg-secondary) hover:bg-(--bg-tertiary) text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer border border-(--border)'
            >
              <X size={15} />
            </button>
          </div>

          {/* Avatar + logout */}
          <div className='px-5 -mt-9 flex items-end justify-between z-1000'>
            <div className='w-18 h-18 rounded-full bg-(--bleu-fonce) border-4 border-(--bg-primary) flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0'>
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-(--border) text-xs font-semibold text-(--text-primary) bg-(--bg-primary) hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-700 transition-colors duration-150 cursor-pointer'
            >
              <LogOut size={13} />
              Déconnexion
            </button>
          </div>

          {/* Name & info */}
          <div className='px-5 pt-2.5 pb-5 flex flex-col gap-1 flex-1'>
            {!editMode ? (
              <>
                <div className='flex items-start justify-between gap-2'>
                  <p className='font-bold text-(--text-primary) text-lg leading-tight'>{fullName}</p>
                  <button
                    type='button'
                    onClick={openEdit}
                    className='mt-1 p-1.5 rounded-lg border border-(--border) text-(--text-muted) hover:text-(--bleu-fonce) hover:bg-(--bg-secondary) transition-colors cursor-pointer shrink-0'
                  >
                    <Pencil size={13} />
                  </button>
                </div>
                <p className='text-xs text-(--text-muted)'>
                  {user?.job || '—'}
                  {organization?.name && (
                    <>
                      <span className='text-(--border) ml-2 mr-2'>|</span>
                      <span>{organization.name}</span>
                    </>
                  )}
                </p>
                <p className='text-xs text-(--text-muted) flex items-center gap-1.5 flex-wrap mt-0.5'>
                  <span className='truncate'>{user?.email || '—'}</span>
                </p>
              </>
            ) : (
              <form onSubmit={handleSave} className='flex flex-col gap-2.5 mt-1'>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='flex flex-col gap-1'>
                    <label className='text-xs text-(--text-muted)'>Prénom</label>
                    <input
                      required
                      value={editFields.firstName}
                      onChange={(e) => setEditFields((f) => ({ ...f, firstName: e.target.value }))}
                      className={inputCls}
                      placeholder='Prénom'
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-xs text-(--text-muted)'>Nom</label>
                    <input
                      required
                      value={editFields.lastName}
                      onChange={(e) => setEditFields((f) => ({ ...f, lastName: e.target.value }))}
                      className={inputCls}
                      placeholder='Nom'
                    />
                  </div>
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-(--text-muted)'>Email</label>
                  <input
                    required
                    type='email'
                    value={editFields.email}
                    onChange={(e) => setEditFields((f) => ({ ...f, email: e.target.value }))}
                    className={inputCls}
                    placeholder='email@structure.fr'
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-(--text-muted)'>Nouveau mot de passe <span className='text-(--text-muted)/60'>(optionnel)</span></label>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editFields.password}
                      onChange={(e) => setEditFields((f) => ({ ...f, password: e.target.value }))}
                      className={`${inputCls} pr-9`}
                      placeholder='Laisser vide pour ne pas changer'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword((v) => !v)}
                      className='absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) cursor-pointer'
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                {saveError && <p className='text-xs text-red-500'>{saveError}</p>}
                <div className='flex gap-2 mt-1'>
                  <button
                    type='button'
                    onClick={() => setEditMode(false)}
                    className='flex-1 py-2 rounded-lg border border-(--border) text-(--text-primary) text-xs font-medium hover:bg-(--bg-secondary) transition-colors cursor-pointer'
                  >
                    Annuler
                  </button>
                  <button
                    type='submit'
                    disabled={saving || saveSuccess}
                    className='flex-1 py-2 rounded-lg bg-(--bleu-fonce) text-white text-xs font-medium hover:bg-(--bleu-active) disabled:opacity-60 transition-colors cursor-pointer flex items-center justify-center gap-1.5'
                  >
                    {saveSuccess ? <><Check size={13} /> Sauvegardé</> : saving ? 'Sauvegarde…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            )}

            {/* Stats */}
            {!editMode && <div className='flex flex-col gap-2 mt-4'>
              {/* Références count — toggle */}
              <button
                onClick={() => setShowRefs((v) => !v)}
                className='flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-(--bg-secondary) border border-(--border) hover:bg-(--bleu-fonce)/10 hover:border-(--bleu-fonce)/40 transition-colors duration-150 cursor-pointer group w-full'
              >
                <div className='flex items-center gap-2 text-(--text-secondary)'>
                  <Users size={15} className='text-(--bleu-fonce)' />
                  <span className='text-xs font-medium'>
                    Références suivies
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-sm font-bold text-(--text-primary)'>
                    {loading ? (
                      <Loader2 size={13} className='animate-spin' />
                    ) : (
                      references.length
                    )}
                  </span>
                  <ChevronRight
                    size={13}
                    className={`text-(--text-muted) group-hover:text-(--bleu-fonce) transition-all duration-200 ${showRefs ? 'rotate-90' : ''}`}
                  />
                </div>
              </button>

              {/* Liste déroulante */}
              {showRefs && (
                <div className='flex flex-col gap-0.5 rounded-xl border border-(--border) bg-(--bg-primary) px-1 py-1 max-h-44 overflow-y-auto'>
                  {references.length === 0 ? (
                    <p className='text-xs text-(--text-muted) px-3 py-2'>
                      Aucune référence
                    </p>
                  ) : (
                    references.map((ref) => (
                      <ReferenceItem key={ref.id} reference={ref} />
                    ))
                  )}
                </div>
              )}

              {/* Archives count — cliquable */}
              <button
                onClick={handleArchivesClick}
                className='flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-(--bg-secondary) border border-(--border) hover:bg-(--bleu-fonce)/10 hover:border-(--bleu-fonce)/40 transition-colors duration-150 cursor-pointer group'
              >
                <div className='flex items-center gap-2 text-(--text-secondary)'>
                  <FolderOpen size={15} className='text-(--bleu-fonce)' />
                  <span className='text-xs font-medium'>Dossiers archivés</span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-sm font-bold text-(--text-primary)'>
                    {loading ? (
                      <Loader2 size={13} className='animate-spin' />
                    ) : (
                      archiveCount
                    )}
                  </span>
                  <ChevronRight
                    size={13}
                    className='text-(--text-muted) group-hover:text-(--bleu-fonce) transition-colors'
                  />
                </div>
              </button>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
