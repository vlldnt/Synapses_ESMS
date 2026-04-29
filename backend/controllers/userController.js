import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Resend } from 'resend';
import { loadJsonFile, saveJsonFile } from '../db.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendInvitationEmail({ firstName, lastName, email, orgName, setAccountUrl }) {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('xxx')) {
    console.warn('Resend not configured — email skipped.');
    return;
  }
  const resend = new Resend(key);
  await resend.emails.send({
    from: 'Synapses ESMS <onboarding@resend.dev>',
    to: email,
    subject: '📬 Créez votre compte — Synapses ESMS',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 0">
      <h2 style="color:#111827">Bonjour ${firstName} ${lastName},</h2>
      <p style="color:#374151">Vous avez été invité(e) à rejoindre <strong>${orgName}</strong> sur Synapses ESMS.</p>
      <p style="color:#374151">Cliquez ci-dessous pour créer votre mot de passe et activer votre compte :</p>
      <a href="${setAccountUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#1294C3;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
        Créer mon compte
      </a>
      <p style="color:#6b7280;font-size:13px">Ce lien est valable 15 minutes. Si vous n'êtes pas concerné(e), ignorez cet email.</p>
    </div>`,
  });
}

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const orgId = req.auth.organizationId;
    const users = await loadJsonFile('users.json');
    res.json(
      users
        .filter((u) => u.organization_id === orgId)
        .map(({ hashed_password, ...u }) => u),
    );
  } catch {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  const { firstName, lastName, email, job, role, organizationId } = req.body;
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !organizationId) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }
  if (organizationId !== req.auth.organizationId) {
    return res.status(403).json({ error: 'Organisation invalide.' });
  }
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ error: 'Email invalide.' });

  try {
    const [users, invitations, orgs] = await Promise.all([
      loadJsonFile('users.json'),
      loadJsonFile('userRequests.json'),
      loadJsonFile('organizations.json'),
    ]);

    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà.' });
    }
    if (invitations.find((i) => i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending')) {
      return res.status(409).json({ error: 'Une invitation est déjà en attente pour cet email.' });
    }

    const org = orgs.find((o) => o.id === organizationId);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const invitation = {
      id: crypto.randomUUID(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.toLowerCase().trim(),
      job: job || '',
      role: role || 'agent',
      organization_id: organizationId,
      is_admin: false,
      verification_token: verificationToken,
      verification_expiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    invitations.push(invitation);
    await saveJsonFile('userRequests.json', invitations);

    const appUrl = process.env.APP_URL || 'http://localhost:5173/synapses';
    const setAccountUrl = `${appUrl}/set-account/${verificationToken}`;
    sendInvitationEmail({
      firstName: invitation.first_name,
      lastName: invitation.last_name,
      email: invitation.email,
      orgName: org?.name || organizationId,
      setAccountUrl,
    }).catch((err) => console.error('Invitation email error:', err.message));

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error creating user invitation:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const orgId = req.auth.organizationId;
    const users = await loadJsonFile('users.json');
    const idx = users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    if (users[idx].organization_id !== orgId) return res.status(403).json({ error: 'Accès refusé.' });
    users[idx] = { ...users[idx], ...req.body, id: users[idx].id, organization_id: orgId };
    await saveJsonFile('users.json', users);
    res.json(users[idx]);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
