# Synapses ESMS - Backend

Serveur Express.js pour stocker les archives des comptes rendus en base64.

## Installation

```bash
npm install
```

## Lancer le serveur

```bash
npm start
```

Le serveur se lance sur `http://localhost:3001`

## Endpoints

- **GET** `/api/archive/list` - Retourne toutes les archives
- **POST** `/api/archive/save` - Sauvegarde une archive  
- **DELETE** `/api/archive/:id` - Supprime une archive
- **GET** `/health` - Health check

## Données

Les archives sont stockées dans `backend/data/historyArchive.json` avec le DOCX converti en base64.

## Notes

- Création automatique du dossier `data/` si absent
- Fallback sur localStorage si le backend n'est pas disponible