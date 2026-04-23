# Configuration Synapses ESMS - Prod/Dev

## Résumé Complet

| Aspect | Dev (npm run dev) | Docker Local | VPS Production |
|---|---|---|---|
| **Frontend URL** | http://localhost:5173/synapses/ | http://localhost:8083/synapses/ | https://vieilledent.eu/synapses/ |
| **Backend Port (interne)** | 3002 | 3002 | 3002 |
| **Frontend Port (interne)** | 5173 | 80 (Nginx) | 80 (Nginx) |
| **Port Exposé Host** | 5173 | 8083 | 8083 |
| **Routing API** | Vite proxy → localhost:3002 | docker nginx.conf | VPS nginx config |
| **VITE_BASENAME** | /synapses | /synapses | /synapses |
| **BrowserRouter basename** | /synapses | /synapses | /synapses |

## Architecture Réseau

### Dev (npm run dev)
```
Browser: http://localhost:5173/synapses/
  ↓
Vite proxy:
  - /synapses/* → localhost:3002 (path rewrite)
  - /api/* → localhost:3002
  ↓
Backend: http://localhost:3002
```

### Docker Local
```
Browser: http://localhost:8083/synapses/
  ↓
Nginx (container) → docker-compose nginx.conf
  - /synapses/ → backend:3002 (path rewrite)
  - /synapses/api/ → backend:3002/api/
  ↓
Backend (container): port 3002
```

### VPS Production
```
Browser: https://vieilledent.eu/synapses/
  ↓
VPS Nginx: /etc/nginx/sites-enabled/vieilledent.eu
  - /synapses/ → 127.0.0.1:8083/
  - /synapses/api/ → 127.0.0.1:3002/api/
  - /synapses/transcribe-stream → 127.0.0.1:3002/transcribe-stream
  - /synapses/transcribe → 127.0.0.1:3002/transcribe
  ↓
Docker containers
  - Frontend: localhost:8083
  - Backend: localhost:3002
```

## Ports Configuration

| Service | Internal | Host Mapping | .env |
|---|---|---|---|
| Backend | 3002 | 3002:3002 | BACKEND_PORT=3002 |
| Frontend (Nginx) | 80 | 8083:80 | FRONTEND_PORT=8083 |
| Dev Server | 5173 | 5173:5173 | npm run dev |

## Environment Variables (.env)

| Variable | Value | Usage |
|---|---|---|
| BACKEND_PORT | 3002 | Docker port mapping |
| FRONTEND_PORT | 8083 | Docker port mapping |
| VITE_BASENAME | /synapses | Frontend API routing |
| NODE_ENV | production | Backend environment |

## Déploiement VPS

### Lancer les containers
```bash
cd /root/Personals_Projects/Synapses_ESMS
docker compose up --build -d
```

### Vérifier les containers
```bash
docker ps | grep synapses
```

### Logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Accès
- Frontend: https://vieilledent.eu/synapses/
- Backend Health: curl http://localhost:3002/health

## Points Clés

✅ Routing unifié `/synapses/` partout (dev, docker, prod)
✅ Backend port 3002 (évite conflit avec iakoa:3001)
✅ Frontend port 8083 (cohérent sur tous les environnements)
✅ Nginx VPS déjà configuré correctement
✅ Docker nginx.conf gère le routing interne
✅ VITE_BASENAME utilisé par tous les services API
