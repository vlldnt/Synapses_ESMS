# Synapses ESMS - Web App

### Overview

**SYNAPSES ESMS** is a social-impact project aiming to develop an **AI-assisted web application** for professionals working in the **social and medico-social sector (ESMS)**.

Professionals in this sector spend a significant amount of time producing administrative and professional documents such as intervention reports, educational assessments, personalized support plans, meeting summaries, and activity reports.  
The goal of SYNAPSES ESMS is to **reduce this administrative burden** by providing an **AI-assisted writing tool** that helps structure and generate professional documents.

The tool is designed to **support professionals rather than replace them**, allowing users to input key information about a situation and receive a structured draft that can then be reviewed and edited.

A major requirement is to ensure **data privacy and confidentiality**, particularly by guaranteeing that **no personal or identifiable data is transmitted to the AI system**.

---

### Flowchart

![Flowchart](docs/images/Flowchart.png)

---

### Class Diagram

```mermaid
classDiagram

class BaseModel {
    id : UUID
    created_at : Date
}

class Organization {
    name : string
    structure_type : string
    description : string
    owner_id : UUID
}

class OrganizationRequest {
    org_name : string
    structure_type : string
    description : string
    first_name : string
    last_name : string
    contact_email : string
    status : pending_verification | approved
    verification_token : string
    verification_expiry : Date
    approved_at : Date
}

class User {
    first_name : string
    last_name : string
    email : string
    hashed_password : string
    job : string
    organization_id : UUID
    is_admin : boolean
    status : active
}

class UserRequest {
    first_name : string
    last_name : string
    email : string
    job : string
    role : agent | direction
    organization_id : UUID
    is_admin : boolean
    verification_token : string
    verification_expiry : Date
    status : pending | accepted
    accepted_at : Date
}

class Reference {
    first_name : string
    last_name : string
    educator : UUID
    organization_id : UUID
}

class Document {
    status : archived
    filename : string
    display_name : string
    date : Date
    intervention_type : string
    type : CRI | PPAMS | PPAS
    reference_name : string
    creator_id : UUID
    organization_id : UUID
    docx_base_64 : base64
}

class Archive {
    document_id : UUID
    creator_id : UUID
    organization_id : UUID
}

class Prompt {
    name : string
    type : CRI | PPAMS | PPAS
    context : string
    content : string
}

BaseModel <|-- Organization
BaseModel <|-- OrganizationRequest
BaseModel <|-- User
BaseModel <|-- UserRequest
BaseModel <|-- Reference
BaseModel <|-- Document
BaseModel <|-- Archive
BaseModel <|-- Prompt

Organization --> User : owner_id
User --> Organization : organization_id
UserRequest --> Organization : organization_id
Reference --> User : educator
Reference --> Organization : organization_id
Document --> User : creator_id
Document --> Organization : organization_id
Document --> Prompt : uses
Archive --> Document : document_id
Archive --> User : creator_id
Archive --> Organization : organization_id
```

---

### Sequence Diagrams

#### 1. Organisation creation (from landing page)

```mermaid
sequenceDiagram
    actor Visitor as Future Admin
    participant Front as Frontend
    participant API as Backend API
    participant Store as JSON Store
    participant Mail as Resend (Email)

    Visitor->>Front: Fill in org request form
    Front->>API: POST /api/organization-requests
    API->>API: Validate fields + honeypot + 3s delay
    API->>Store: Check email not in users.json
    API->>Store: Create entry in organizationRequests.json\n(status: pending_verification)
    API->>API: Generate verification_token (15 min)
    API->>Mail: Send email with link /set-password/<token>
    API-->>Front: 200 OK

    Visitor->>Mail: Click link in email
    Visitor->>Front: Open /set-password/<token>
    Front->>API: GET /api/organization-requests/info/:token
    API->>Store: Verify token exists + status + not expired
    API-->>Front: { first_name, last_name, contact_email, org_name }

    Visitor->>Front: Enter password
    Front->>API: POST /api/organization-requests/complete/:token
    API->>API: Validate password strength
    API->>Store: Verify token valid + not expired + pending_verification
    API->>Store: Create organization in organizations.json
    API->>Store: Create admin user in users.json\n(is_admin: true, role: admin)
    API->>Store: Update request (status: approved, token: null)
    API-->>Front: { user, JWT token }
    Front-->>Visitor: Logged in - redirect to dashboard
```

#### 2. User invitation (from admin dashboard)

```mermaid
sequenceDiagram
    actor Admin
    actor Employee as Invited Employee
    participant Front as Frontend
    participant API as Backend API
    participant Store as JSON Store
    participant Mail as Resend (Email)

    Admin->>Front: Fill in invitation form (name, email, job, role)
    Front->>API: POST /api/users [JWT]
    API->>API: Verify organizationId matches admin's org
    API->>Store: Check email not in users.json
    API->>Store: Check no pending invitation for this email
    API->>Store: Create entry in userRequests.json (status: pending)
    API->>API: Generate verification_token (15 min)
    API->>Mail: Send invite email with link /set-account/<token>
    API-->>Front: 200 OK

    Employee->>Mail: Click link in email
    Employee->>Front: Open /set-account/<token>
    Front->>API: GET /api/user-requests/info/:token
    API->>Store: Verify token valid + status pending + not expired
    API-->>Front: { first_name, last_name, email, job, org_name }

    Employee->>Front: Enter password
    Front->>API: POST /api/user-requests/complete/:token
    API->>API: Validate password strength
    API->>Store: Verify token valid + not expired + pending
    API->>Store: Create user in users.json\n(role: agent, is_admin: false)
    API->>Store: Update invitation (status: accepted, token: null)
    API-->>Front: { user, JWT token }
    Front-->>Employee: Logged in - redirect to dashboard
```

#### 3. Login

```mermaid
sequenceDiagram
    actor User
    participant Front as Frontend
    participant API as Backend API
    participant Store as JSON Store

    User->>Front: Enter email + password
    Front->>API: POST /api/login
    API->>Store: Find user by email in users.json
    API->>API: Compare password with bcrypt hash
    API->>API: Generate JWT { userId, organizationId, role }
    API-->>Front: { user, JWT token }
    Front-->>User: Logged in - redirect to dashboard
```

#### 4. Document creation & archive

```mermaid
sequenceDiagram
    actor User
    participant Front as Frontend
    participant API as Backend API
    participant AI as AI Model
    participant Store as JSON Store

    User->>Front: Fill in document form (type, date, intervention, reference)
    Front->>API: GET /api/prompts [JWT]
    API->>Store: Read prompts.json
    API-->>Front: List of prompts

    Front->>AI: Send anonymised context + prompt content
    AI-->>Front: Generated text draft

    User->>Front: Review and validate
    Front->>API: POST /api/archives [JWT]
    API->>Store: Create document in documents.json
    API->>Store: Create archive entry in archives.json
    API-->>Front: { document, archive }
    Front-->>User: Document saved and archived
```

---

### Authors

- [Cyprien Gehu](https://github.com/cyprien-GEHU)
- [Adrien Vieilledent](https://github.com/vlldnt)
