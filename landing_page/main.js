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

// ── Barres de progression animées ────────────────────────────────────────────
(function initBarChart() {
  const trigger = document.getElementById('bar-chart');
  if (!trigger) return;

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    trigger.querySelectorAll('.bar-fill').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = bar.dataset.barTarget; }, i * 300);
    });
  }, { threshold: 0.4 });

  observer.observe(trigger);
})();

// ── Document list interaction ────────────────────────────────────────────────
(function initDocList() {
  const items = document.querySelectorAll('.doc-item[data-doc]');
  if (!items.length) return;

  const DOCS = [
    { tag: 'CRI',    icon: 'clipboard-list',    color: '#673DE6', bg: 'rgba(103,61,230,.1)',  border: 'rgba(103,61,230,.3)',  name: 'Compte Rendu d\'Intervention',   desc: 'Formalisation des interventions à domicile ou en établissement, avec le contexte et les actions menées.' },
    { tag: 'PPAMS',  icon: 'route',             color: '#4F72FF', bg: 'rgba(79,114,255,.1)',  border: 'rgba(79,114,255,.3)',  name: 'PPA Médico-Social',              desc: 'Projet personnalisé d\'accompagnement médico-social avec objectifs, axes de travail et professionnels référents.' },
    { tag: 'PPAS',   icon: 'map-location-dot',  color: '#3B82F6', bg: 'rgba(59,130,246,.1)',  border: 'rgba(59,130,246,.3)',  name: 'PPA Social',                     desc: 'Projet personnalisé d\'accompagnement social, objectifs individualisés et échéances de suivi.' },
    { tag: 'ECRIT',  icon: 'pen-nib',           color: '#0EA5E9', bg: 'rgba(14,165,233,.1)',  border: 'rgba(14,165,233,.3)',  name: 'Écrit Éducatif',                 desc: 'Note éducative, bilan éducatif, compte rendu d\'activité ou de séjour éducatif.' },
    { tag: 'BILAN',  icon: 'chart-line',        color: '#06B6D4', bg: 'rgba(6,182,212,.1)',   border: 'rgba(6,182,212,.3)',   name: 'Bilan d\'Évaluation',            desc: 'Évaluation des objectifs du PPA, progression observée et réajustements proposés.' },
    { tag: 'CRR',    icon: 'people-group',      color: '#F43F5E', bg: 'rgba(244,63,94,.1)',   border: 'rgba(244,63,94,.3)',   name: 'Compte Rendu de Réunion',        desc: 'Synthèse pluridisciplinaire, compte rendu de réunion d\'équipe ou de service.' },
    { tag: 'VEILLE', icon: 'newspaper',         color: '#EF4444', bg: 'rgba(239,68,68,.1)',   border: 'rgba(239,68,68,.3)',   name: 'Veille Professionnelle',         desc: 'Synthèse documentaire sur les évolutions réglementaires, pratiques et sectorielles.' },
    { tag: 'REPORT', icon: 'chart-bar',         color: '#F97316', bg: 'rgba(249,115,22,.1)',  border: 'rgba(249,115,22,.3)',  name: 'Reporting Mensuel',              desc: 'Tableau de bord mensuel des indicateurs d\'activité et de qualité du service.' },
    { tag: 'RA',     icon: 'chart-pie',         color: '#FB923C', bg: 'rgba(251,146,60,.1)',  border: 'rgba(251,146,60,.3)',  name: 'Rapport d\'Activité',            desc: 'Rapport annuel d\'activité pour financeurs, autorités de contrôle ou instances internes.' },
    { tag: 'BA',     icon: 'chart-column',      color: '#FBBF24', bg: 'rgba(251,191,36,.1)',  border: 'rgba(251,191,36,.3)',  name: 'Bilan d\'Activité',              desc: 'Bilan trimestriel ou semestriel avec analyse des résultats et perspectives.' },
    { tag: 'PE',     icon: 'building',          color: '#F59E0B', bg: 'rgba(245,158,11,.1)',  border: 'rgba(245,158,11,.3)',  name: 'Projet d\'Établissement',        desc: 'Document stratégique définissant la vision, les valeurs et les orientations de l\'établissement.' },
    { tag: 'PS',     icon: 'sitemap',           color: '#EAB308', bg: 'rgba(234,179,8,.1)',   border: 'rgba(234,179,8,.3)',   name: 'Projet de Service',              desc: 'Document opérationnel déclinant les objectifs du projet d\'établissement au niveau du service.' },
    { tag: 'HAS',    icon: 'star-half-stroke',  color: '#D97706', bg: 'rgba(217,119,6,.1)',   border: 'rgba(217,119,6,.3)',   name: 'Préparation Évaluation HAS',     desc: 'Structure conforme aux recommandations de la Haute Autorité de Santé pour l\'évaluation de la qualité.' },
    { tag: 'AAP',    icon: 'file-invoice',      color: '#B45309', bg: 'rgba(180,83,9,.1)',    border: 'rgba(180,83,9,.3)',    name: 'Appel à Projet',                 desc: 'Réponse structurée à un appel à projet pour la création ou l\'extension d\'un service.' },
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
    elIcon.className      = `fa-solid fa-${doc.icon} text-xl transition-all duration-300`;
    elIcon.style.color    = doc.color;
    elWrap.style.background = doc.bg;
    panel.style.borderColor = doc.border;
    elTag.textContent  = doc.tag;
    elName.textContent = doc.name;
    elDesc.textContent = doc.desc;
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => activate(i));
  });

  setTimeout(() => activate(0), 500);
})();

// ── Count-up animation ────────────────────────────────────────────────────────
// Attributs : data-countup="cible" data-from="départ(0)" data-prefix data-suffix data-duration="ms(1200)"
(function initCountUp() {
  const els = document.querySelectorAll('[data-countup]');
  if (!els.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animate(el) {
    const target   = parseFloat(el.dataset.countup);
    const from     = parseFloat(el.dataset.from ?? '0');
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = parseFloat(el.dataset.duration || '1200');
    const start    = performance.now();

    (function tick(now) {
      const p     = Math.min((now - start) / duration, 1);
      const value = Math.round(from + easeOut(p) * (target - from));
      el.textContent = prefix + value + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animate(entry.target);
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
})();

// ── Bubble proximity repulsion ────────────────────────────────────────────────
(function initBubbles() {
  const container = document.getElementById('bubbles-container');
  if (!container) return;

  const bubbles = Array.from(container.querySelectorAll('.pro-bubble'));
  if (!bubbles.length) return;

  const RADIUS = 160;
  const MAX_PUSH = 14;

  document.addEventListener('mousemove', (e) => {
    bubbles.forEach(bubble => {
      const rect = bubble.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS && dist > 0) {
        const force = (1 - dist / RADIUS) * MAX_PUSH;
        const pushX = -(dx / dist) * force;
        const pushY = -(dy / dist) * force;
        bubble.style.transform = `translate(${pushX.toFixed(1)}px, ${pushY.toFixed(1)}px)`;
        bubble.style.boxShadow = `0 4px 20px ${bubble.dataset.shadow || 'rgba(103,61,230,.3)'}`;
      } else {
        bubble.style.transform = '';
        bubble.style.boxShadow = '';
      }
    });
  });

  container.addEventListener('mouseleave', () => {
    bubbles.forEach(bubble => {
      bubble.style.transform = '';
      bubble.style.boxShadow = '';
    });
  });
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
