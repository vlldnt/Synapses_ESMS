# Contexte Frontend - Synapses ESMS

## Projet
Application web PWA de rédaction assistée par IA pour les professionnels du secteur social et médico-social (ESMS). Permet de générer des comptes rendus d'intervention (CRI) et des projets personnalisés d'accompagnement (PPA) via des modèles IA (OpenRouter).

## Stack technique
- **React 19** + **Vite 7** - JS/JSX uniquement, pas de TypeScript
- **Redux Toolkit** - auth, thème (light/dark), rôle (agent/direction/admin)
- **React Router v7** - SPA avec 4 routes : `/`, `/cri`, `/ppa`, `/archives`
- **Tailwind CSS v4** - variables CSS custom `--bg-primary`, `--bleu-fonce`, etc.
- **OpenRouter SDK** - appels IA (modèle par défaut : Voxtral Small 24B)
- **docx** - génération Word côté client
- **mammoth** - extraction texte depuis DOCX pour aperçu

## Architecture
Structure `features/` par page + `components/` pour les composants partagés.

- `features/auth/` - Login
- `features/dashboard/` - tableau de bord, liste agents + derniers documents
- `features/interventionReport/` - CRI : transcription voix → IA → Word
- `features/personalizedProject/` - PPA (génération IA non encore implémentée)
- `features/archives/` - historique des documents archivés + brouillon en cours
- `components/layout/` - Sidebar (desktop), MobileMenu, TopBar, AgentTabs, NavItem, ProfileDropdown
- `components/` - Button, Input, StepCard, TranscriptionInput, TranscriptionCard, GeneratedResult, WordPreview, MicrophoneButton, RgpdNotice, GeneratingReportModal, DownloadSuccessModal, PWAInstallGuide
- `services/` - aiService, historyService, transcriptionService, menuService, referenceService, organizationService, userService, structureTypeService
- `hooks/` - useCurrentUser (Redux → user + organization), useModels (liste OpenRouter)
- `store/` - authSlice (user + organization via cookie), themeSlice, roleSlice
- `constants/` - agents (14 agents avec rôles), intervention, ppa, shared
- `utils/` - wordExport, docxPreview, documentEnricher, reportNameFormatter, docTypeBadge

## Patterns clés
- **Auth** : cookie de session, `fetchCurrentUser` au login et au changement de rôle - pas de JWT stocké côté JS
- **Brouillon** : chaque page de saisie (CRI, PPA) persiste son état dans `localStorage` pour reprise après refresh
- **Transcription** : Web Speech API natif en priorité, fallback vers Google Cloud Speech (stream SSE via `/transcribe-stream`). La logique de détection navigateur/device est dans `transcriptionService.js`
- **Génération Word** : `downloadDocx()` dans `wordExport.js` - build côté client avec la lib `docx`, pas de serveur impliqué
- **Historique** : `historyService.js` → `/api/archives` (backend Express). Chaque document archivé a un champ `docxBase64` pour le re-téléchargement
- **Rôles** : `agent` | `direction` | `admin` - filtrent les agents visibles et les menus. Switcher en haut à droite (dev) ou dans le ProfileDropdown
- **Thème** : `data-theme` sur `<html>`, persiste en cookie, variables CSS dans `App.css`

## Conventions
- Composants → PascalCase, fichiers pages suffixés `Page` (ex. `LoginPage.jsx`)
- Services → camelCase (ex. `menuService.js`)
- Pas de TypeScript, pas de mocks - l'auth appelle le vrai backend
- `VITE_BASENAME` (défaut `/synapses`) préfixe toutes les URLs API
