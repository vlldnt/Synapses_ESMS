# Flows de création - Synapses ESMS

---

## 1. Création d'entreprise (Organization Request)

Flow déclenché depuis la landing page par un futur admin d'une nouvelle structure.

### Étapes

```
[Formulaire public]
       │
       ▼
POST /api/organization-requests
  → Validation des champs + anti-spam (honeypot + délai 3s)
  → Vérifie que l'email n'existe pas dans users.json
  → Crée une entrée dans organizationRequests.json  (status: pending_verification)
  → Génère un verification_token (expire dans 15 min)
  → Envoie un email via Resend avec le lien set-password/<token>
       │
       ▼
[Utilisateur clique le lien dans l'email]
       │
       ▼
GET /api/organization-requests/info/:token        (public)
  → Vérifie que le token existe, status = pending_verification, non expiré
  → Retourne : first_name, last_name, contact_email, org_name
       │
       ▼
[Utilisateur saisit son mot de passe]
       │
       ▼
POST /api/organization-requests/complete/:token   (public)
  → Valide le mot de passe (≥8 car, 1 maj, 1 chiffre, 1 spécial)
  → Vérifie token valide + non expiré + status = pending_verification
  → Crée l'organisation dans organizations.json
  → Crée l'utilisateur admin dans users.json (role: admin, is_admin: true)
  → Met à jour la demande (status: approved, verification_token: null)
  → Retourne : { user, token JWT }
```

### Routes impliquées

| Méthode | Route | Auth | Rôle |
|---------|-------|------|------|
| `POST` | `/api/organization-requests` | Public | Soumettre une demande |
| `GET` | `/api/organization-requests/info/:token` | Public | Lire les infos du token |
| `POST` | `/api/organization-requests/complete/:token` | Public | Finaliser + créer org & admin |
| `GET` | `/api/organization-requests` | JWT requis | Lister les demandes (admin Synapses) |
| `POST` | `/api/organization-requests/:id/approve` | JWT requis | Approuver manuellement (admin Synapses) |

### Données créées

**organizations.json**
```json
{
  "id": "<uuid>",
  "name": "Nom de la structure",
  "structure_type": "EHPAD",
  "description": "...",
  "owner_id": "<user_id>",
  "created_at": "ISO date"
}
```

**users.json**
```json
{
  "id": "<uuid>",
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "hashed_password": "...",
  "job": "Administrateur",
  "role": "admin",
  "organization_id": "<org_id>",
  "is_admin": true,
  "status": "active",
  "created_at": "ISO date"
}
```

---

## 2. Création d'utilisateur (User Invitation)

Flow déclenché par un admin d'une organisation existante depuis le dashboard.

### Étapes

```
[Admin - Dashboard]
       │
       ▼
POST /api/users                                   (JWT requis, role: admin)
  → Vérifie que organizationId correspond à l'org de l'admin
  → Vérifie que l'email n'existe pas dans users.json
  → Vérifie qu'aucune invitation pending n'existe pour cet email
  → Crée une entrée dans userRequests.json (status: pending)
  → Génère un verification_token (expire dans 15 min)
  → Envoie un email via Resend avec le lien set-account/<token>
       │
       ▼
[Invité clique le lien dans l'email]
       │
       ▼
GET /api/user-requests/info/:token                (public)
  → Vérifie token valide, status = pending, non expiré
  → Retourne : first_name, last_name, email, job, org_name
       │
       ▼
[Invité saisit son mot de passe]
       │
       ▼
POST /api/user-requests/complete/:token           (public)
  → Valide le mot de passe (≥8 car, 1 maj, 1 chiffre, 1 spécial)
  → Vérifie token valide + non expiré + status = pending
  → Crée l'utilisateur dans users.json (role: agent ou celui défini, is_admin: false)
  → Met à jour l'invitation (status: accepted, verification_token: null)
  → Retourne : { user, token JWT }
```

### Routes impliquées

| Méthode | Route | Auth | Rôle |
|---------|-------|------|------|
| `POST` | `/api/users` | JWT requis | Admin - créer une invitation |
| `GET` | `/api/users` | JWT requis | Admin - lister les users de l'org |
| `PUT` | `/api/users/:id` | JWT requis | Admin - modifier un user |
| `GET` | `/api/user-requests/info/:token` | Public | Lire les infos de l'invitation |
| `POST` | `/api/user-requests/complete/:token` | Public | Finaliser + créer le user |

### Données créées

**userRequests.json** (invitation)
```json
{
  "id": "<uuid>",
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "job": "Éducateur",
  "role": "agent",
  "organization_id": "<org_id>",
  "verification_token": "<hex>",
  "verification_expiry": "ISO date",
  "status": "pending",
  "created_at": "ISO date"
}
```

**users.json** (après acceptation)
```json
{
  "id": "<uuid>",
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "hashed_password": "...",
  "job": "Éducateur",
  "role": "agent",
  "organization_id": "<org_id>",
  "is_admin": false,
  "status": "active",
  "created_at": "ISO date"
}
```

---

## Routes publiques (sans JWT)

| Route | Méthode |
|-------|---------|
| `/api/login` | `POST` |
| `/api/organization-requests` | `POST` |
| `/api/organization-requests/info/:token` | `GET` |
| `/api/organization-requests/complete/:token` | `POST` |
| `/api/user-requests/info/:token` | `GET` |
| `/api/user-requests/complete/:token` | `POST` |

Toutes les autres routes `/api/*` exigent un header `Authorization: Bearer <token>`.

---

## Règles de mot de passe

```
/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/
```

- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

---

## JWT payload

```json
{
  "userId": "<uuid>",
  "organizationId": "<uuid>",
  "role": "admin | agent"
}
```

Expiration : valeur de `JWT_EXPIRES_IN` (défaut : `7d`).
