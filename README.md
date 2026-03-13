# Synapses EMS - Web App

### Overview
**SYNAPSES ESMS** is a social-impact project aiming to develop an **AI-assisted web application** for professionals working in the **social and medico-social sector (ESMS)**.

Professionals in this sector spend a significant amount of time producing administrative and professional documents such as intervention reports, educational assessments, personalized support plans, meeting summaries, and activity reports.  
The goal of SYNAPSES ESMS is to **reduce this administrative burden** by providing an **AI-assisted writing tool** that helps structure and generate professional documents.

The tool is designed to **support professionals rather than replace them**, allowing users to input key information about a situation and receive a structured draft that can then be reviewed and edited.

A major requirement of the project is to ensure **data privacy and confidentiality**, particularly by guaranteeing that **no personal or identifiable data is transmitted to the AI system**.

### Flowchart

![Flowchart](docs/images/Flowchart.png)

### Class Diagram

```mermaid
classDiagram

class BaseModel {
  +id
  +created_at
  +updated_at
}

class User {
  +first_name
  +last_name
  +email
  +password
  +role
}

class Child {
  +first_name
  +last_name
  +educator_id
}

class Prompt {
  +name
  +prompt_text
}

class Organisation {
  +name
  +owner_id
}

class Activity {
  +name
  +prompt_id
}

class UserRole {
  <<enumeration>>
  TIFS
  ME
  ES
  AS
  HEAD_OF_SERVICE
  DIRECTOR
  SUPER_ADMIN
}

BaseModel <|-- User
BaseModel <|-- Child
BaseModel <|-- Prompt
BaseModel <|-- Organisation
BaseModel <|-- Activity

User --> UserRole : role
Organisation --> User : owner_id
Child --> User : educator_id
Activity --> Prompt : prompt_id
```

### Authors

- [Cyprien Gehu](https://guthub.com/cyprien-GEHU)
- [Adrien Vieilledent](https://guthub.com/vlldnt)
