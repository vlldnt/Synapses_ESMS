# Modèles de données - `backend/data/*.json`

### Organization - `organizations.json`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `uuid` | Identifiant unique |
| `name` | `string` | Nom de la structure |
| `structure_type` | `string` | Type de structure (ex : `"EHPAD"`) |
| `description` | `string` | Description libre |
| `owner_id` | `uuid` | Référence vers l'utilisateur admin créateur |
| `created_at` | `ISO date` | Date de création |

---

### OrganizationRequest - `organizationRequests.json`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `uuid` | Identifiant unique |
| `org_name` | `string` | Nom de la structure demandée |
| `structure_type` | `string` | Type de structure |
| `description` | `string` | Description libre |
| `first_name` | `string` | Prénom du demandeur |
| `last_name` | `string` | Nom du demandeur |
| `contact_email` | `string` | Email de contact |
| `status` | `"pending" \| "approved"` | État de la demande |
| `verification_token` | `string \| null` | Token de validation (15 min) |
| `verification_expiry` | `ISO date` | Expiration du token |
| `created_at` | `ISO date` | Date de création |
| `approved_at` | `ISO date \| null` | Date d'approbation |

---

### User - `users.json`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `uuid` | Identifiant unique |
| `first_name` | `string` | Prénom |
| `last_name` | `string` | Nom |
| `email` | `string` | Email de connexion |
| `hashed_password` | `string` | Mot de passe hashé (bcrypt) |
| `job` | `string` | Intitulé du poste |
| `organization_id` | `uuid` | Organisation d'appartenance |
| `is_admin` | `boolean` | Droits d'administration |
| `status` | `"active"` | État du compte |
| `created_at` | `ISO date` | Date de création |

---

### UserRequest - `userRequests.json`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `uuid` | Identifiant unique |
| `first_name` | `string` | Prénom |
| `last_name` | `string` | Nom |
| `email` | `string` | Email de l'invité |
| `job` | `string` | Intitulé du poste |
| `role` | `"agent" \| "direction"` | Rôle dans l'organisation |
| `organization_id` | `uuid` | Organisation cible |
| `is_admin` | `boolean` | Droits d'administration |
| `verification_token` | `string \| null` | Token d'invitation (15 min) |
| `verification_expiry` | `ISO date` | Expiration du token |
| `status` | `"pending" \| "accepted"` | État de l'invitation |
| `created_at` | `ISO date` | Date de création |
| `accepted_at` | `ISO date \| null` | Date d'acceptation |

---

### Reference - `references.json`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `uuid` | Identifiant unique |
| `first_name` | `string` | Prénom de l'usager référencé |
| `last_name` | `string` | Nom de l'usager référencé |
| `educator` | `uuid` | Référence vers l'éducateur responsable (`users.id`) |
| `organization_id` | `uuid` | Organisation d'appartenance |
| `created_at` | `ISO date` | Date de création |

---

### Archive - `archives.json`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `string` | Identifiant (format : `arch_<timestamp>`) |
| `document_id` | `number` | Référence vers le document (`documents.id`) |
| `creator_id` | `uuid` | Auteur de l'archive (`users.id`) |
| `organization_id` | `uuid` | Organisation d'appartenance |
| `created_at` | `ISO date` | Date de création |

---

### Document - `documents.json`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `number` | Identifiant (timestamp ms) |
| `status` | `"archived"` | État du document |
| `filename` | `string` | Nom du fichier généré (ex : `CRI_Tom_V_28-04-2026.docx`) |
| `display_name` | `string` | Nom d'affichage |
| `date` | `string` | Date de l'intervention (format : `YYYY-MM-DD`) |
| `intervention_type` | `string` | Type d'intervention (ex : `"Intervention"`, `"Projet Personnalisé d'Accompagnement"`) |
| `type` | `"CRI" \| "PPAMS" \| "PPAS"` | Type de document |
| `reference_name` | `string` | Nom de l'usager (anonymisé, ex : `"Tom V."`) |
| `creator_id` | `uuid` | Auteur (`users.id`) |
| `organization_id` | `uuid` | Organisation d'appartenance |
| `created_at` | `ISO date` | Date de création |
| `docx_base_64` | `base64` | Fichier DOCX encodé en base64 |

---

### Prompt - `prompts.json`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `uuid` | Identifiant unique |
| `name` | `string` | Identifiant technique (ex : `"cr_intervention"`) |
| `type` | `"CRI" \| "PPAMS" \| "PPAS"` | Type de document associé |
| `context` | `string` | Description courte du prompt |
| `content` | `string` | Contenu complet du prompt système IA |
