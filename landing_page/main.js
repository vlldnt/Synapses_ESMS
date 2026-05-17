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

// ── Document list interaction ────────────────────────────────────────────────
(function initDocList() {
  const items = document.querySelectorAll('.doc-item[data-doc]');
  if (!items.length) return;

  const DOCS = [
    { tag: 'CRI',         icon: 'clipboard-list',       color: '#673DE6', bg: 'rgba(103,61,230,.1)',  border: 'rgba(103,61,230,.3)',  name: 'Compte Rendu d\'Intervention',          desc: 'Formalisation des interventions à domicile ou en établissement, avec le contexte et les actions menées.' },
    { tag: 'PPA',         icon: 'route',                color: '#9B2CB6', bg: 'rgba(155,44,182,.1)',  border: 'rgba(155,44,182,.3)',  name: 'Projet Personnalisé d\'Accompagnement', desc: 'Objectifs individualisés, axes de travail, échéances et professionnels référents pour chaque personne accompagnée.' },
    { tag: 'SOAP',        icon: 'notes-medical',        color: '#42C4A1', bg: 'rgba(66,196,161,.1)',  border: 'rgba(66,196,161,.3)',  name: 'Transmissions ciblées',                 desc: 'Notes de transmission inter-équipes structurées selon le modèle SOAP, pour assurer la continuité de soin.' },
    { tag: 'Synthèse',    icon: 'file-circle-check',    color: '#F44E92', bg: 'rgba(244,78,146,.1)',  border: 'rgba(244,78,146,.3)',  name: 'Synthèse de situation',                 desc: 'Bilan global de la situation socio-éducative ou médico-sociale d\'une personne accompagnée.' },
    { tag: 'Bilan',       icon: 'chart-line',           color: '#D97706', bg: 'rgba(217,119,6,.1)',   border: 'rgba(217,119,6,.3)',   name: 'Bilan d\'évaluation intermédiaire',      desc: 'Évaluation des objectifs du PPA, progression observée et réajustements proposés.' },
    { tag: 'HAS',         icon: 'star-half-stroke',     color: '#06B6D4', bg: 'rgba(6,182,212,.1)',   border: 'rgba(6,182,212,.3)',   name: 'Évaluation selon référentiel HAS',       desc: 'Structure conforme aux recommandations de la Haute Autorité de Santé pour l\'évaluation de la qualité.' },
    { tag: 'Rapport',     icon: 'gavel',                color: '#673DE6', bg: 'rgba(103,61,230,.1)',  border: 'rgba(103,61,230,.3)',  name: 'Rapport social / Note sociale',          desc: 'Rapport d\'enquête sociale, note sociale ou rapport pour audience judiciaire.' },
    { tag: 'Éducatif',    icon: 'pen-nib',              color: '#42C4A1', bg: 'rgba(66,196,161,.1)',  border: 'rgba(66,196,161,.3)',  name: 'Écrit éducatif',                         desc: 'Note éducative, bilan éducatif, compte rendu d\'activité ou de séjour éducatif.' },
    { tag: 'CRR',         icon: 'people-group',         color: '#9B2CB6', bg: 'rgba(155,44,182,.1)',  border: 'rgba(155,44,182,.3)',  name: 'Compte rendu de réunion',                desc: 'CRR, synthèse pluridisciplinaire, compte rendu de réunion d\'équipe ou de service.' },
    { tag: 'FEI',         icon: 'triangle-exclamation', color: '#F44E92', bg: 'rgba(244,78,146,.1)',  border: 'rgba(244,78,146,.3)',  name: 'Fiche d\'événement indésirable',         desc: 'FEI, signalement interne, rapport d\'incident ou information préoccupante.' },
    { tag: 'Activité',    icon: 'chart-bar',            color: '#D97706', bg: 'rgba(217,119,6,.1)',   border: 'rgba(217,119,6,.3)',   name: 'Rapport d\'activité',                    desc: 'Rapport annuel, bilan trimestriel, rapport pour financeur ou DDETS.' },
    { tag: 'Observation', icon: 'eye',                  color: '#06B6D4', bg: 'rgba(6,182,212,.1)',   border: 'rgba(6,182,212,.3)',   name: 'Grille d\'observation comportementale',  desc: 'Observation structurée, analyse fonctionnelle et suivi longitudinal des comportements.' },
  ];

  const panel   = document.getElementById('doc-detail-panel');
  const elName  = document.getElementById('doc-detail-name');
  const elTag   = document.getElementById('doc-detail-tag');
  const elDesc  = document.getElementById('doc-detail-desc');
  const elIcon  = document.getElementById('doc-detail-icon');
  const elWrap  = document.getElementById('doc-detail-icon-wrap');

  function activate(idx) {
    const doc = DOCS[idx];

    items.forEach((item, i) => {
      item.classList.remove('is-active');
      item.style.removeProperty('--doc-color');
      item.style.removeProperty('--doc-bg');
    });
    items[idx].style.setProperty('--doc-color', doc.color);
    items[idx].style.setProperty('--doc-bg', doc.bg);
    items[idx].classList.add('is-active');

    if (!panel) return;
    elIcon.className      = `fa-solid fa-${doc.icon} text-lg`;
    elIcon.style.color    = doc.color;
    elWrap.style.background = doc.bg;
    panel.style.borderColor = doc.border;
    elTag.textContent  = doc.tag;
    elName.textContent = doc.name;
    elDesc.textContent = doc.desc;
  }

  items.forEach((item, i) => {
    item.addEventListener('mouseenter', () => activate(i));
    item.addEventListener('click',      () => activate(i));
  });

  setTimeout(() => activate(0), 500);
})();

// ── Count-up animation (data-countup="420" data-suffix="+" data-prefix="−") ──
(function initCountUp() {
  const els = document.querySelectorAll('[data-countup]');
  if (!els.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const DURATION = 1200;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const el     = entry.target;
      const target = parseFloat(el.dataset.countup);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const start  = performance.now();

      (function tick(now) {
        const p = Math.min((now - start) / DURATION, 1);
        el.textContent = prefix + Math.round(easeOut(p) * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
})();

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
