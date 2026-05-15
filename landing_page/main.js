// ── Dark mode ──────────────────────────────────────────────────────────────
const THEME_KEY = 'synapses_lp_theme';

function applyTheme(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = isDark ? 'fa-solid fa-sun text-sm' : 'fa-solid fa-moon text-sm';
}

function toggleTheme() {
  const isDark = !document.documentElement.classList.contains('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  applyTheme(isDark);
}

// Applique le thème sauvegardé avant le premier paint
(function () {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : prefersDark);
})();

// ── Consentement cookies ────────────────────────────────────────────────────
const NOTICE_KEY = 'synapses_consent_v1';
const NOTICE_TTL = 180 * 24 * 60 * 60 * 1000; // 6 mois

function hasConsented() {
  try {
    const raw = localStorage.getItem(NOTICE_KEY);
    if (!raw) return false;
    return Date.now() - JSON.parse(raw).ts < NOTICE_TTL;
  } catch { return false; }
}

function dismissBanner() {
  localStorage.setItem(NOTICE_KEY, JSON.stringify({ ts: Date.now() }));
  document.getElementById('consent-banner').style.display = 'none';
}

function openConsentModal() {
  document.getElementById('consent-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeConsentModal() {
  document.getElementById('consent-modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeConsentModal();
});

window.addEventListener('DOMContentLoaded', () => {
  if (!hasConsented()) {
    document.getElementById('consent-banner').style.display = 'block';
  }

  const form     = document.getElementById('contact-form');
  const submit   = document.getElementById('contact-submit');
  const label    = document.getElementById('contact-submit-label');
  const feedback = document.getElementById('contact-feedback');

  function showFeedback(msg, isError) {
    feedback.textContent = msg;
    feedback.className = isError
      ? 'text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20'
      : 'text-xs px-3 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const prenom  = document.getElementById('contact-prenom').value.trim();
    const nom     = document.getElementById('contact-nom').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!prenom || !nom || !email || !message) {
      showFeedback('Veuillez remplir tous les champs.', true);
      return;
    }

    submit.disabled = true;
    label.textContent = 'Envoi en cours...';
    feedback.className = 'hidden';

    try {
      const apiBase = (form.dataset.api || '').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, email, message }),
      });
      const data = await res.json();

      if (res.ok) {
        showFeedback('Message envoyé. Nous vous répondrons dans les plus brefs délais.', false);
        form.reset();
      } else {
        showFeedback(data.error || "Une erreur est survenue. Veuillez réessayer.", true);
      }
    } catch {
      showFeedback('Impossible de joindre le serveur. Veuillez réessayer.', true);
    } finally {
      submit.disabled = false;
      label.textContent = 'Envoyer le message';
    }
  });
});
