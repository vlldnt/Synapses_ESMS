# API Routes - Synapses ESMS

Base URL : `http://localhost:3002`

Toutes les routes `/api/*` sont protégées par JWT (`Authorization: Bearer <token>`) sauf les routes marquées **public**.

---

## `authController.js`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/login` | public | Connexion email + mot de passe → `{ user, token }` |
| `GET` | `/api/organization-requests` | JWT | Liste toutes les demandes d'adhésion |
| `POST` | `/api/organization-requests` | public | Créer une demande d'ouverture de structure → envoie un email (token 15 min) |
| `GET` | `/api/organization-requests/info/:token` | public | Récupère les infos d'une demande par token |
| `POST` | `/api/organization-requests/complete/:token` | public | Finalise la création de la structure → `{ user, token }` |
| `POST` | `/api/organization-requests/:id/approve` | JWT | Approuver manuellement une demande (legacy) |
| `GET` | `/api/user-requests/info/:token` | public | Récupère les infos d'une invitation employé |
| `POST` | `/api/user-requests/complete/:token` | public | Finalise la création du compte employé → `{ user, token }` |

---

## `userController.js`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/users` | JWT | Liste les utilisateurs de l'organisation du requérant |
| `POST` | `/api/users` | JWT | Envoie une invitation par email à un nouvel employé |
| `PUT` | `/api/users/:id` | JWT | Met à jour un utilisateur (même organisation uniquement) |

---

## `archiveController.js`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/archives` | JWT | Liste les documents de l'organisation (`?userId=<id>` pour filtrer) |
| `POST` | `/api/archives` | JWT | Crée un document et son archiveRef |
| `DELETE` | `/api/archives/:id` | JWT | Supprime un document (403 si hors organisation) |

---

## `referenceController.js`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/references` | JWT | Liste les références de l'organisation du requérant |
| `POST` | `/api/references` | JWT | Crée une référence dans l'organisation du requérant |
| `DELETE` | `/api/references/:id` | JWT | Supprime une référence (403 si hors organisation) |

---

## `organizationController.js`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/organizations` | JWT | Retourne l'organisation du requérant |
| `GET` | `/api/prompts` | JWT | Liste les prompts IA (communs à toutes les orgs) |
| `GET` | `/api/reference` | JWT | Données de référence globales (`reference.json`) |

---

## `server.js`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/transcribe-chunk` | JWT | Transcription synchrone d'un chunk audio (WEBM_OPUS) |
| `POST` | `/api/transcribe-stream` | JWT | Transcription SSE progressive d'un fichier audio |
| `POST` | `/api/transcribe-audio` | JWT | Transcription brute (binary body) |
| `POST` | `/api/transcribe-audio-upload` | JWT | Transcription multipart/form-data (`file`) · `?mock=1` pour simuler |
| `WS` | `/api/transcribe-ws` | - | Streaming WebSocket temps réel (LINEAR16 PCM 16kHz) |
| `GET` | `/health` | - | Health check → `{ status: "ok", timestamp }` |

---

Voir [Modeles.md](Modeles.md) pour le détail des modèles de données.
