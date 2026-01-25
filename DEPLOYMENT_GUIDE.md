# 🚀 Guide de Déploiement Production - NutriWeek v2.8.10

**Date**: 2026-01-22  
**Version**: 2.8.10  
**Status**: ✅ PRODUCTION READY

---

## ✅ Checklist Préparation

- [x] Code mergé sur `main`
- [x] Tag `v2.8.10` créé
- [x] CHANGELOG.md à jour
- [x] README.md avec instructions
- [x] Build production testé (1.58 MB, gzip: 429 KB)
- [ ] Push vers GitHub
- [ ] Déploiement backend
- [ ] Déploiement frontend

---

## 📦 Contenu de la Release

### Backend
- **Technologie**: Node.js 18+ + Express + SQLite
- **Fichiers**: `server/` (index.cjs, database.cjs, routes/files.cjs)
- **Base de données**: `server/data/files.db` (45 KB)
- **Uploads**: `server/uploads/versions/` (34 fichiers, 459 KB)

### Frontend
- **Build**: `dist/` (1.58 MB non compressé, 429 KB gzip)
- **Fichiers**: index.html + assets (CSS 100 KB, JS 1.58 MB)

---

## 🔧 Déploiement Backend

### Option 1: Railway (Recommandé)

**1. Créer un nouveau projet Railway**
```bash
# Via Railway CLI
railway login
railway init
railway up
```

**2. Variables d'environnement Railway**
```env
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://nutriweek-es33.vercel.app
MAX_FILE_SIZE=10485760
```

**3. Configuration Railway**
- **Root Directory**: `/`
- **Build Command**: `npm install`
- **Start Command**: `node server/index.cjs`
- **Watch Paths**: `server/**`

**4. Volume persistant (pour uploads)**
- Créer un volume `/data`
- Monter sur `/app/server/data`
- Créer un volume `/uploads`
- Monter sur `/app/server/uploads`

---

### Option 2: Render

**1. Créer un Web Service**
- Repository: `https://github.com/Jaokimben/nutriweek`
- Branch: `main`
- Root Directory: `./`

**2. Configuration Build**
```bash
# Build Command
npm install

# Start Command
node server/index.cjs
```

**3. Variables d'environnement**
```env
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://nutriweek-es33.vercel.app
```

**4. Persistent Disk**
- Mount Path: `/opt/render/project/src/server/data`
- Size: 1 GB (minimum)

---

### Option 3: VPS (DigitalOcean, Linode, etc.)

**1. Setup serveur**
```bash
# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cloner le repo
git clone https://github.com/Jaokimben/nutriweek.git
cd nutriweek
git checkout v2.8.10

# Installer les dépendances
npm install
```

**2. Configuration PM2**
```bash
# Installer PM2
npm install -g pm2

# Créer fichier ecosystem
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'nutriweek-backend',
    script: 'server/index.cjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      ALLOWED_ORIGINS: 'https://nutriweek-es33.vercel.app'
    }
  }]
};
EOF

# Démarrer
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

**3. Nginx (reverse proxy)**
```nginx
server {
    listen 80;
    server_name api.nutriweek.app;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**4. SSL avec Certbot**
```bash
sudo certbot --nginx -d api.nutriweek.app
```

---

## 🌐 Déploiement Frontend (Vercel)

### Via GitHub (Recommandé)

**1. Connecter le repository**
- Aller sur https://vercel.com
- **Import Project** → GitHub
- Sélectionner `Jaokimben/nutriweek`

**2. Configuration Vercel**
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**3. Variables d'environnement Vercel**
```env
VITE_BACKEND_URL=https://votre-backend.railway.app
# OU
VITE_BACKEND_URL=https://api.nutriweek.app
```

**4. Déployer**
- Cliquer sur **Deploy**
- Attendre le build (~2-3 minutes)
- Récupérer l'URL de déploiement

---

### Via CLI Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Déployer
cd /home/user/webapp
vercel --prod

# Configurer variables d'environnement
vercel env add VITE_BACKEND_URL production
# Entrer: https://votre-backend.railway.app

# Redéployer avec les nouvelles variables
vercel --prod
```

---

## 🔗 Configuration DNS (Optionnel)

### Domaine Custom

**Frontend**: `nutriweek.app`
1. Vercel Dashboard → Domains
2. Ajouter `nutriweek.app`
3. Configurer DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

**Backend**: `api.nutriweek.app`
1. Railway/Render Dashboard → Custom Domain
2. Ajouter `api.nutriweek.app`
3. Configurer DNS:
   ```
   Type: CNAME
   Name: api
   Value: votre-app.railway.app
   ```

---

## ✅ Tests Post-Déploiement

### Backend

```bash
# Health check
curl https://api.nutriweek.app/api/health

# Attendu:
{
  "status": "ok",
  "message": "NutriWeek Backend API is running",
  "timestamp": "2026-01-22T...",
  "uptime": ...,
  "version": "1.0.0"
}

# Liste des fichiers
curl https://api.nutriweek.app/api/files

# Attendu:
{
  "success": true,
  "files": {
    "alimentsPetitDej": {...},
    "alimentsDejeuner": {...},
    ...
  }
}
```

### Frontend

1. **Ouvrir** https://nutriweek.app (ou votre URL Vercel)
2. **Console** (F12) : Vérifier
   ```
   🔧 [getApiBaseUrl] Utilisation VITE_BACKEND_URL: https://api.nutriweek.app
   🏥 [Health Check] URL utilisée: https://api.nutriweek.app/api/health
   ✅ Backend santé: {status: "ok", ...}
   ```

3. **Portail Praticien**
   - Statistiques: 9 fichiers, 459 KB
   - Liste des fichiers visible

4. **Génération de Menu**
   - Remplir questionnaire
   - Générer menu
   - Vérifier 7 jours affichés

---

## 🐛 Troubleshooting

### Erreur CORS

**Symptôme**: `Access-Control-Allow-Origin` error

**Solution**:
1. Backend: Vérifier `ALLOWED_ORIGINS` contient l'URL frontend
2. Ajouter dans `.env`:
   ```env
   ALLOWED_ORIGINS=https://nutriweek.app,https://nutriweek-es33.vercel.app
   ```

### Backend ne démarre pas

**Vérifier**:
```bash
# Logs Railway
railway logs

# Logs Render
# Via dashboard

# Logs PM2
pm2 logs nutriweek-backend
```

### Frontend affiche "AUCUN FICHIER"

**Cause**: `VITE_BACKEND_URL` mal configuré

**Solution**:
1. Vercel Dashboard → Settings → Environment Variables
2. Vérifier `VITE_BACKEND_URL` = URL correcte
3. Redéployer : `vercel --prod`

---

## 📊 Monitoring

### Backend
- **Uptime**: https://uptimerobot.com (gratuit)
- **Logs**: Railway/Render dashboard
- **Alertes**: Email si down

### Frontend
- **Analytics**: Vercel Analytics (gratuit)
- **Performance**: Lighthouse CI
- **Erreurs**: Sentry (optionnel)

---

## 🔄 Mises à Jour Futures

```bash
# Sur votre machine locale
git checkout main
git pull origin main

# Développement
git checkout develop
# ... faire les modifications ...
git add -A
git commit -m "feat: nouvelle fonctionnalité"

# Tests
npm run build
npm run preview

# Merge vers main
git checkout main
git merge develop --no-ff
git tag -a v2.8.11 -m "Description"

# Push
git push origin main --tags

# Vercel/Railway redéploient automatiquement
```

---

## 📞 Support

**Email**: joakimben1234@gmail.com  
**GitHub**: https://github.com/Jaokimben/nutriweek/issues

---

## ✅ Checklist Finale

- [ ] Backend déployé et accessible (https://api.nutriweek.app)
- [ ] Frontend déployé (https://nutriweek.app)
- [ ] Variables d'environnement configurées
- [ ] Tests health check passent
- [ ] Tests génération menu fonctionnent
- [ ] DNS configurés (si domaine custom)
- [ ] Monitoring activé
- [ ] Documentation à jour

---

**Status**: ✅ Prêt pour push GitHub et déploiement

**Prochaine étape**: `git push origin main --tags`
