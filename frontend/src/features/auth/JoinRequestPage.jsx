import { useState } from 'react';
import { Link } from 'react-router-dom';
import faviconUrl from '/favicon.png';

function JoinRequestPage() {
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [orgMessage, setOrgMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  return (
    <div id='join-request-page' className='min-h-dvh flex items-center justify-center bg-synapses-animated px-3'>
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

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setSuccess(null);
            try {
              const res = await fetch('/api/organization-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orgName,
                  contactName,
                  contactEmail,
                  message: orgMessage,
                }),
              });
              if (!res.ok) throw new Error('API error');
              setSuccess(true);
              setOrgName('');
              setContactName('');
              setContactEmail('');
              setOrgMessage('');
            } catch (err) {
              console.error('Join request failed:', err);
              setSuccess(false);
            } finally {
              setSubmitting(false);
            }
          }}
          className='flex flex-col gap-3 md:gap-4'
        >
          <input
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className='w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border)'
            placeholder='Nom de la structure'
          />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <input
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className='w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border)'
              placeholder='Nom du contact'
            />
            <input
              required
              type='email'
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className='w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border)'
              placeholder='Email du contact'
            />
          </div>
          <textarea
            value={orgMessage}
            onChange={(e) => setOrgMessage(e.target.value)}
            className='w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border bg-(--bg-secondary) text-(--text-primary) border-(--border) min-h-[100px]'
            placeholder='Message (optionnel)'
          />

          <button
            type='submit'
            disabled={submitting}
            className='mt-1 w-full py-2.5 md:py-3 rounded-lg text-white font-medium cursor-pointer text-sm md:text-base bg-[#1294C3] hover:bg-[#0D66D4] disabled:opacity-60 transition-all duration-200'
          >
            {submitting ? 'Envoi...' : 'Envoyer ma demande'}
          </button>

          {success === true && <p className='text-sm text-emerald-600 text-center'>Demande envoyee avec succes.</p>}
          {success === false && <p className='text-sm text-red-600 text-center'>Echec de l envoi, veuillez reessayer.</p>}

          <div className='text-center mt-1'>
            <Link to='/login' className='text-xs text-(--text-muted) hover:underline'>
              Retour a la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinRequestPage;
