# Configuration Synapses ESMS - Prod/Dev

## Résumé Complet

| Aspect | Dev (npm run dev) | Docker Local | VPS Production |
|---|---|---|---|
| **Base URL** | http://localhost:5173/synapses/ | http://localhost:8083/synapses/ | https://vieilledent.eu/synapses/ |
| **Vite base** | /synapses/ | /synapses/ | /synapses/ |
| **Router basename** | /synapses | /synapses | /synapses |
| **Port Backend** | 3002 | 3002 | 3002 |
| **Port Frontend** | 5173 | 8083 | 8083 |
| **VITE_BASENAME** | /synapses | /synapses | /synapses |

## Architecture - Comment ça fonctionne

### Dev (npm run dev)
```
Browser: http://localhost:5173/synapses/
  ↓
Vite (appType: 'spa', base: '/synapses/')
  - Sert index.html pour toutes les routes /synapses/*
  - Proxy /api/* → localhost:3002
  - Proxy /synapses/api/* → localhost:3002 (path rewrite)
  - Proxy /synapses/transcribe* → localhost:3002
  ↓
React Router (basename="/synapses")
  - /synapses/ → Dashboard
  - /synapses/cri → Intervention Report
  - /synapses/ppa → Personalized Project
  - /synapses/archives → Archives
  ↓
Backend: http://localhost:3002
```

### Docker Local
```
Browser: http://localhost:8083/synapses/
  ↓
Nginx (container) port 80
  ├─ /synapses/ → serve app (try_files)
  ├─ /synapses/api/ → backend:3002/api/
  └─ /synapses/transcribe* → backend:3002/transcribe*
  ↓
Backend (container): port 3002
```

### VPS Production
```
Browser: https://vieilledent.eu/synapses/
  ↓
VPS Nginx: /etc/nginx/sites-enabled/vieilledent.eu
  ├─ /synapses/ → 127.0.0.1:8083/
  ├─ /synapses/api/ → 127.0.0.1:3002/api/
  └─ /synapses/transcribe* → 127.0.0.1:3002/transcribe*
  ↓
Docker containers on VPS
  - Frontend: 127.0.0.1:8083
  - Backend: 127.0.0.1:3002
```

## Configuration Files

### frontend/vite.config.js
```javascript
export default defineConfig({
  appType: 'spa',              // ← SPA mode
  base: '/synapses/',          // ← Base URL avec /
  plugins: [react(), tailwindcss(), VitePWA(), ...],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': { target: 'http://localhost:3002' },
      '/synapses/api/': { target: 'http://localhost:3002', rewrite: ... },
      '/synapses/transcribe': { target: 'http://localhost:3002', rewrite: ... },
    }
  }
});
```

### frontend/src/main.jsx
```javascript
<BrowserRouter basename="/synapses">
  <App />
</BrowserRouter>
```

### .env
```
BACKEND_PORT=3002
FRONTEND_PORT=8083
VITE_BASENAME=/synapses
NODE_ENV=production
```

### docker-compose.yml
```yaml
backend:
  ports: ["3002:3002"]
  environment: PORT=3002

frontend:
  ports: ["8083:80"]
  args: VITE_BASENAME=/synapses
```

### frontend/nginx.conf (Docker)
```
location /synapses/ {
  try_files $uri $uri/ /index.html;
}
location /synapses/api/ {
  rewrite ^/synapses/(.*)$ /$1 break;
  proxy_pass http://backend:3002;
}
```

## Points Clés

✅ `/synapses/` est la **base URL partout** (dev, docker, prod)
✅ **Pas de redirection** de `/` vers `/synapses/`
✅ Vite `appType: 'spa'` sert index.html pour les routes
✅ Backend port 3002 (évite conflit iakoa:3001)
✅ Router basename="/synapses" gère les routes
✅ VITE_BASENAME utilisé par les services API
✅ Proxy Vite n'interfère pas avec l'app (/synapses/ exclus)
✅ Nginx Docker et VPS routent correctement

## Accès

- **Dev**: http://localhost:5173/synapses/
- **Local Docker**: http://localhost:8083/synapses/
- **Production**: https://vieilledent.eu/synapses/

Pas de `/` direct, tout passe par `/synapses/` 🚀
