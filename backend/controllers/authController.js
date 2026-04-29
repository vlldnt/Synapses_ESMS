import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import { loadJsonFile, saveJsonFile } from '../db.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;

function verifyPage(type, message) {
  const colors = { success: '#16a34a', error: '#dc2626', already: '#1294C3' };
  const color = colors[type] || '#1294C3';
  const redirect =
    type === 'success'
      ? `<p id="redir" style="color:#9ca3af;font-size:13px;margin-top:16px">Redirection dans <span id="count">2</span>s…</p>
       <div class="spinner"></div>
       <script>
         let n=2;const c=document.getElementById('count');
         const t=setInterval(()=>{n--;c.textContent=n;if(n<=0){clearInterval(t);window.location.href='/synapses/';}},1000);
       </script>`
      : '';
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Synapses ESMS</title>
  <style>
    body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f3f4f6;}
    .card{background:#fff;border-radius:16px;padding:40px;max-width:420px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08);}
    h2{color:${color};margin-bottom:12px;}p{color:#6b7280;}
    .spinner{width:28px;height:28px;border:3px solid #e5e7eb;border-top-color:${color};border-radius:50%;animation:spin .8s linear infinite;margin:12px auto 0;}
    @keyframes spin{to{transform:rotate(360deg);}}
  </style></head>
  <body><div class="card"><h2>Synapses ESMS</h2><p>${message}</p>${redirect}</div></body></html>`;
}

async function sendSetPasswordEmail({ firstName, lastName, contactEmail, orgName, setPasswordUrl }) {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('xxx')) {
    console.warn('Resend not configured — email skipped.');
    return;
  }
  const resend = new Resend(key);
  await resend.emails.send({
    from: 'Synapses ESMS <onboarding@resend.dev>',
    to: contactEmail,
    subject: '📬 Créez votre compte — Synapses ESMS',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 0">
      <h2 style="color:#111827">Bonjour ${firstName} ${lastName},</h2>
      <p style="color:#374151">Votre demande pour <strong>${orgName}</strong> a bien été reçue.</p>
      <p style="color:#374151">Pour finaliser la création de votre compte, définissez votre mot de passe :</p>
      <a href="${setPasswordUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#1294C3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
        Créer mon mot de passe
      </a>
      <p style="color:#6b7280;font-size:13px">Ce lien est valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    </div>`,
  });
}

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

  try {
    const users = await loadJsonFile('users.json');
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Identifiants incorrects.' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Compte inactif.' });

    const valid = await bcrypt.compare(password, user.hashed_password);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects.' });

    const { hashed_password, ...safeUser } = user;
    const token = jwt.sign(
      { userId: user.id, organizationId: user.organization_id, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );
    res.json({ user: safeUser, token });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/organization-requests
router.get('/organization-requests', async (req, res) => {
  try {
    const requests = await loadJsonFile('organizationRequests.json');
    const safe = requests.map(({ verification_token, ...r }) => r);
    res.json(safe);
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/organization-requests
router.post('/organization-requests', async (req, res) => {
  const { orgName, structureType, description, firstName, lastName, contactEmail, _hp, _t } = req.body;

  if (_hp) return res.status(400).json({ error: 'Requête invalide.' });
  if (!_t || Date.now() - _t < 3000) return res.status(400).json({ error: 'Soumission trop rapide.' });
  if (!orgName?.trim() || !structureType?.trim() || !firstName?.trim() || !lastName?.trim() || !contactEmail?.trim()) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }
  if (!EMAIL_REGEX.test(contactEmail)) return res.status(400).json({ error: 'Adresse email invalide.' });
  if (orgName.length > 100 || structureType.length > 80 || firstName.length > 50 || lastName.length > 50 || contactEmail.length > 150) {
    return res.status(400).json({ error: 'Un champ dépasse la longueur maximale autorisée.' });
  }

  try {
    const [requests, existingUsers] = await Promise.all([
      loadJsonFile('organizationRequests.json'),
      loadJsonFile('users.json'),
    ]);
    if (existingUsers.find((u) => u.email.toLowerCase() === contactEmail.toLowerCase())) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const entry = {
      id: crypto.randomUUID(),
      org_name: orgName.trim(),
      structure_type: structureType.trim(),
      description: description?.trim() || '',
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      contact_email: contactEmail.toLowerCase().trim(),
      status: 'pending_verification',
      verification_token: verificationToken,
      verification_expiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };

    requests.push(entry);
    await saveJsonFile('organizationRequests.json', requests);

    const appUrl = process.env.APP_URL || 'http://localhost:5173/synapses';
    const setPasswordUrl = `${appUrl}/set-password/${verificationToken}`;
    sendSetPasswordEmail({
      firstName: entry.first_name,
      lastName: entry.last_name,
      contactEmail: entry.contact_email,
      orgName: entry.org_name,
      setPasswordUrl,
    }).catch((err) => console.error('Email send error:', err.message));

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error saving organization request:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/organization-requests/info/:token
router.get('/organization-requests/info/:token', async (req, res) => {
  try {
    const requests = await loadJsonFile('organizationRequests.json');
    const request = requests.find((r) => r.verification_token === req.params.token);

    if (!request) return res.status(404).json({ error: 'Lien invalide ou déjà utilisé.' });
    if (request.status !== 'pending_verification') return res.status(409).json({ error: 'Ce compte a déjà été créé.' });
    if (new Date(request.verification_expiry) < new Date()) return res.status(410).json({ error: 'Ce lien a expiré.' });

    res.json({
      first_name: request.first_name,
      last_name: request.last_name,
      contact_email: request.contact_email,
      org_name: request.org_name,
    });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/organization-requests/complete/:token
router.post('/organization-requests/complete/:token', async (req, res) => {
  const { password } = req.body;
  if (!PASSWORD_REGEX.test(password)) return res.status(400).json({ error: 'Mot de passe invalide.' });

  try {
    const requests = await loadJsonFile('organizationRequests.json');
    const idx = requests.findIndex((r) => r.verification_token === req.params.token);

    if (idx === -1) return res.status(404).json({ error: 'Lien invalide ou déjà utilisé.' });
    const request = requests[idx];
    if (request.status !== 'pending_verification') return res.status(409).json({ error: 'Ce compte a déjà été créé.' });
    if (new Date(request.verification_expiry) < new Date()) return res.status(410).json({ error: 'Ce lien a expiré.' });

    const [users, orgs] = await Promise.all([loadJsonFile('users.json'), loadJsonFile('organizations.json')]);
    if (users.find((u) => u.email.toLowerCase() === request.contact_email.toLowerCase())) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const orgId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const newOrg = {
      id: orgId,
      name: request.org_name,
      structure_type: request.structure_type,
      description: request.description || '',
      owner_id: userId,
      created_at: new Date().toISOString(),
    };
    const newUser = {
      id: userId,
      first_name: request.first_name,
      last_name: request.last_name,
      email: request.contact_email,
      hashed_password: hashedPassword,
      job: 'Administrateur',
      organization_id: orgId,
      is_admin: true,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    orgs.push(newOrg);
    users.push(newUser);
    requests[idx] = { ...request, status: 'approved', verification_token: null, approved_at: new Date().toISOString() };

    await Promise.all([
      saveJsonFile('organizations.json', orgs),
      saveJsonFile('users.json', users),
      saveJsonFile('organizationRequests.json', requests),
    ]);

    const { hashed_password: _, ...safeUser } = newUser;
    const token = jwt.sign(
      { userId: newUser.id, organizationId: orgId, is_admin: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );

    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error('Error completing organization request:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/user-requests/info/:token
router.get('/user-requests/info/:token', async (req, res) => {
  try {
    const invitations = await loadJsonFile('userRequests.json');
    const inv = invitations.find((i) => i.verification_token === req.params.token);
    if (!inv) return res.status(404).json({ error: 'Lien invalide ou déjà utilisé.' });
    if (inv.status !== 'pending') return res.status(409).json({ error: 'Ce compte a déjà été créé.' });
    if (new Date(inv.verification_expiry) < new Date()) return res.status(410).json({ error: 'Ce lien a expiré.' });

    const orgs = await loadJsonFile('organizations.json');
    const org = orgs.find((o) => o.id === inv.organization_id);

    res.json({
      first_name: inv.first_name,
      last_name: inv.last_name,
      email: inv.email,
      job: inv.job,
      org_name: org?.name || '',
    });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/user-requests/complete/:token
router.post('/user-requests/complete/:token', async (req, res) => {
  const { password } = req.body;
  if (!PASSWORD_REGEX.test(password)) return res.status(400).json({ error: 'Mot de passe invalide.' });

  try {
    const invitations = await loadJsonFile('userRequests.json');
    const idx = invitations.findIndex((i) => i.verification_token === req.params.token);
    if (idx === -1) return res.status(404).json({ error: 'Lien invalide ou déjà utilisé.' });
    const inv = invitations[idx];
    if (inv.status !== 'pending') return res.status(409).json({ error: 'Ce compte a déjà été créé.' });
    if (new Date(inv.verification_expiry) < new Date()) return res.status(410).json({ error: 'Ce lien a expiré.' });

    const users = await loadJsonFile('users.json');
    if (users.find((u) => u.email.toLowerCase() === inv.email.toLowerCase())) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      id: crypto.randomUUID(),
      first_name: inv.first_name,
      last_name: inv.last_name,
      email: inv.email,
      hashed_password: hashedPassword,
      job: inv.job || '',
      role: inv.role || 'agent',
      organization_id: inv.organization_id,
      is_admin: false,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    invitations[idx] = { ...inv, status: 'accepted', verification_token: null, accepted_at: new Date().toISOString() };

    await Promise.all([
      saveJsonFile('users.json', users),
      saveJsonFile('userRequests.json', invitations),
    ]);

    const { hashed_password: _, ...safeUser } = newUser;
    const token = jwt.sign(
      { userId: newUser.id, organizationId: inv.organization_id, is_admin: false },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );

    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error('Error completing user invitation:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/organization-requests/:id/approve
router.post('/organization-requests/:id/approve', async (req, res) => {
  try {
    const requestId = req.params.id;
    const requests = await loadJsonFile('organizationRequests.json');
    const request = requests.find((r) => r.id === requestId);

    if (!request) return res.status(404).json({ error: 'Demande introuvable.' });
    if (request.status !== 'pending') return res.status(409).json({ error: 'Demande déjà traitée.' });

    const [users, orgs] = await Promise.all([loadJsonFile('users.json'), loadJsonFile('organizations.json')]);
    if (users.find((u) => u.email.toLowerCase() === request.contact_email)) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà.' });
    }

    const tempPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const orgId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const newOrg = {
      id: orgId,
      name: request.org_name,
      structure_type: request.structure_type,
      description: request.description || '',
      owner_id: userId,
      created_at: new Date().toISOString(),
    };
    const newUser = {
      id: userId,
      first_name: request.first_name,
      last_name: request.last_name,
      email: request.contact_email,
      hashed_password: hashedPassword,
      job: 'Administrateur',
      organization_id: orgId,
      is_admin: true,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    orgs.push(newOrg);
    users.push(newUser);
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status: 'approved', approved_at: new Date().toISOString() } : r,
    );

    await Promise.all([
      saveJsonFile('organizations.json', orgs),
      saveJsonFile('users.json', users),
      saveJsonFile('organizationRequests.json', updatedRequests),
    ]);

    const { hashed_password: _, ...safeUser } = newUser;
    res.status(201).json({ organization: newOrg, user: safeUser, tempPassword });
  } catch (err) {
    console.error('Error approving organization request:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
