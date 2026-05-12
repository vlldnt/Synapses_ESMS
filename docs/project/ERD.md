# ERD — Modèle de données

## Organization

| Champ | Type | Clé | Description |
|---|---|---|---|
| id | uuid | PK | Identifiant unique |
| name | string |  | Nom de la structure |
| structure_type | string |  | Type de structure |
| description | string |  | Description libre |
| owner_id | uuid | FK → User.id | Administrateur créateur |
| created_at | ISO date |  | Date de création |

---

## OrganizationRequest

| Champ | Type | Clé | Description |
|---|---|---|---|
| id | uuid | PK | Identifiant unique |
| org_name | string |  | Nom demandé |
| structure_type | string |  | Type de structure |
| description | string |  | Description libre |
| first_name | string |  | Prénom du demandeur |
| last_name | string |  | Nom du demandeur |
| contact_email | string |  | Email de contact |
| status | enum |  | pending / approved |
| verification_token | string |  | Token temporaire |
| verification_expiry | ISO date |  | Expiration du token |
| created_at | ISO date |  | Date de création |
| approved_at | ISO date |  | Date d’approbation |

---

## User

| Champ | Type | Clé | Description |
|---|---|---|---|
| id | uuid | PK | Identifiant unique |
| first_name | string |  | Prénom |
| last_name | string |  | Nom |
| email | string |  | Email de connexion |
| hashed_password | string |  | Mot de passe hashé |
| job | string |  | Poste |
| organization_id | uuid | FK → Organization.id | Organisation |
| is_admin | boolean |  | Droits administrateur |
| status | enum |  | active |
| created_at | ISO date |  | Date de création |

---

## UserRequest

| Champ | Type | Clé | Description |
|---|---|---|---|
| id | uuid | PK | Identifiant unique |
| first_name | string |  | Prénom |
| last_name | string |  | Nom |
| email | string |  | Email invité |
| job | string |  | Poste |
| role | enum |  | agent / direction |
| organization_id | uuid | FK → Organization.id | Organisation cible |
| is_admin | boolean |  | Droits admin |
| verification_token | string |  | Token invitation |
| verification_expiry | ISO date |  | Expiration |
| status | enum |  | pending / accepted |
| created_at | ISO date |  | Date de création |
| accepted_at | ISO date |  | Date d’acceptation |

---

## Reference

| Champ | Type | Clé | Description |
|---|---|---|---|
| id | uuid | PK | Identifiant unique |
| first_name | string |  | Prénom usager |
| last_name | string |  | Nom usager |
| educator | uuid | FK → User.id | Éducateur référent |
| organization_id | uuid | FK → Organization.id | Organisation |
| created_at | ISO date |  | Date de création |

---

## Document

| Champ | Type | Clé | Description |
|---|---|---|---|
| id | number | PK | Identifiant document |
| status | enum |  | archived |
| filename | string |  | Nom fichier |
| display_name | string |  | Nom affiché |
| date | string |  | Date intervention |
| intervention_type | string |  | Type intervention |
| type | enum |  | CRI / PPAMS / PPAS |
| reference_name | string |  | Nom anonymisé |
| creator_id | uuid | FK → User.id | Auteur |
| organization_id | uuid | FK → Organization.id | Organisation |
| created_at | ISO date |  | Date création |
| docx_base_64 | base64 |  | Fichier DOCX |

---

## Archive

| Champ | Type | Clé | Description |
|---|---|---|---|
| id | string | PK | Identifiant archive |
| document_id | number | FK → Document.id | Document archivé |
| creator_id | uuid | FK → User.id | Auteur archive |
| organization_id | uuid | FK → Organization.id | Organisation |
| created_at | ISO date |  | Date création |

---

## Prompt

| Champ | Type | Clé | Description |
|---|---|---|---|
| id | uuid | PK | Identifiant unique |
| name | string |  | Nom technique |
| type | enum |  | CRI / PPAMS / PPAS |
| context | string |  | Contexte du prompt |
| content | string |  | Prompt système IA |

---

# Relations ERD

## Organization

- Organization (1,N) → User
- Organization (1,N) → Reference
- Organization (1,N) → Document
- Organization (1,N) → Archive
- Organization (1,N) → UserRequest

---

## User

- User (1,N) → Document
- User (1,N) → Reference
- User (1,N) → Archive

---

## Document

- Document (1,1) → Archive

---

# Vue simplifiée des relations

```text
Organization
│
├── User
│    ├── Document
│    ├── Reference
│    └── Archive
│
├── UserRequest
├── Reference
├── Document
└── Archive

Document
└── Archive
```