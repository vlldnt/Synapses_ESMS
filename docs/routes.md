# API Routes — Synapses ESMS

Base URL : `http://localhost:3002`

Toutes les routes `/api/*` sont protégées par JWT (`Authorization: Bearer <token>`) sauf les routes marquées **[public]**.

---

## Auth — `authController.js`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/login` | public | Connexion email + mot de passe → `{ user, token }` |
| `GET` | `/api/organization-requests` | JWT | Liste toutes les demandes d'adhésion |
| `POST` | `/api/organization-requests` | public | Créer une demande d'ouverture de structure → envoie un email (token 15 min) |
| `GET` | `/api/organization-requests/info/:token` | public | Récupère les infos d'une demande par token (pour afficher le formulaire set-password) |
| `POST` | `/api/organization-requests/complete/:token` | public | Finalise la création du compte avec le mot de passe → `{ user, token }` |
| `POST` | `/api/organization-requests/:id/approve` | JWT | Approuver manuellement une demande (legacy) |

**Body `POST /api/organization-requests`**
```json
{
  "orgName": "string (requis)",
  "structureType": "string (requis)",
  "description": "string (optionnel)",
  "firstName": "string (requis)",
  "lastName": "string (requis)",
  "contactEmail": "string (requis)",
  "_hp": "",
  "_t": 1234567890
}
```

**Body `POST /api/organization-requests/complete/:token`**
```json
{ "password": "string (requis, regex fort)" }
```

---

## Utilisateurs — `userController.js` · montage `/api/users`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/users` | JWT | Liste les utilisateurs de l'organisation du requérant |
| `POST` | `/api/users` | JWT | Envoie une invitation par email à un nouvel employé |
| `PUT` | `/api/users/:id` | JWT | Met à jour un utilisateur (même organisation uniquement) |

**Body `POST /api/users`**
```json
{
  "firstName": "string (requis)",
  "lastName": "string (requis)",
  "email": "string (requis)",
  "job": "string",
  "role": "agent | direction",
  "organizationId": "uuid (requis, doit correspondre au JWT)"
}
```
→ Crée une entrée dans `userRequests.json` (token 15 min) + envoie un email avec lien `/set-account/:token`
→ Retourne `{ success: true }`

---

## Invitations employés — `authController.js`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/user-requests/info/:token` | public | Récupère les infos d'une invitation (pour afficher le formulaire set-account) |
| `POST` | `/api/user-requests/complete/:token` | public | Finalise la création du compte avec le mot de passe → `{ user, token }` |

**Body `POST /api/user-requests/complete/:token`**
```json
{ "password": "string (requis, regex fort)" }
```
→ Crée le compte dans `users.json`, invalide le token, connecte l'employé directement
→ Token valable **15 minutes**

---

## Archives — `archiveController.js` · montage `/api/archives`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/archives` | JWT | Liste les documents de l'organisation. `?userId=<id>` pour filtrer par créateur |
| `POST` | `/api/archives` | JWT | Crée un document et son archiveRef. Injecte `organizationId` du JWT |
| `DELETE` | `/api/archives/:id` | JWT | Supprime un document (403 si hors organisation) |

**Body `POST /api/archives`** — champs libres du document sauf `structureType`, `companyName`, `educator`, `reference`, `text` (filtrés)

---

## Références — `referenceController.js` · montage `/api/references`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/references` | JWT | Liste les références de l'organisation du requérant |
| `POST` | `/api/references` | JWT | Crée une référence dans l'organisation du requérant |
| `DELETE` | `/api/references/:id` | JWT | Supprime une référence (403 si hors organisation) |

**Body `POST /api/references`**
```json
{
  "firstName": "string (requis)",
  "lastName": "string (requis)",
  "educatorId": "uuid (optionnel)"
}
```

---

## Organisation & données communes — `organizationController.js`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/organizations` | JWT | Retourne l'organisation du requérant (tableau à 1 élément) |
| `GET` | `/api/prompts` | JWT | Liste les prompts IA (communs à toutes les orgs) |
| `GET` | `/api/structure-types` | public | Liste les types de structures ESMS |
| `GET` | `/api/reference` | JWT | Données de référence globales (reference.json) |

---

## Transcription — `server.js`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/transcribe-chunk` | JWT | Transcription synchrone d'un chunk audio (WEBM_OPUS) |
| `POST` | `/api/transcribe-stream` | JWT | Transcription SSE progressive d'un fichier audio |
| `POST` | `/api/transcribe-audio` | JWT | Transcription brute (binary body) |
| `POST` | `/api/transcribe-audio-upload` | JWT | Transcription multipart/form-data (`file`) · `?mock=1` pour simuler |
| `WS` | `/api/transcribe-ws` | — | Streaming WebSocket temps réel (LINEAR16 PCM 16kHz) |

**Protocole WebSocket**
```
client → { type: "start", lang: "fr-FR" }   // démarre la session
client → <binary Int16 PCM>                  // frames audio
client → { type: "stop" }                    // termine la session
server → { type: "interim", text }           // résultat partiel
server → { type: "final",   text }           // résultat stable
server → { type: "error",   message }        // erreur
```

---

## Divers

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/health` | — | Health check → `{ status: "ok", timestamp }` |

---

## Sécurité multi-tenant

Toutes les routes authentifiées lisent `req.auth.organizationId` (extrait du JWT, **jamais du body client**) pour :
- **Filtrer** les lectures (archives, users, references, organizations)
- **Injecter** l'`organizationId` lors des créations
- **Vérifier** les droits lors des suppressions/modifications (403 si hors organisation)

Les données communes (`prompts`, `structureTypes`) ne sont pas scopées.
