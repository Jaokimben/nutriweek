# 🥗 NutriWeek - Application de Nutrition Personnalisée

> **Version 2.8.10** - Production Ready ✅

Une application web qui génère des menus hebdomadaires personnalisés basés sur les fichiers Excel du praticien et les objectifs nutritionnels de l'utilisateur.

---

## 🌟 Fonctionnalités Principales

### 🩺 Portail Praticien (NEW v2.8.0)
- **Upload de fichiers Excel** (Aliments Petit-Déjeuner, Déjeuner, Dîner, FODMAP)
- **Upload de fichiers Word** (Règles générales, plans nutritionnels)
- **Versioning automatique** de tous les fichiers
- **Statistiques** : Nombre de fichiers, espace utilisé
- **Backend SQLite** : Stockage centralisé et partagé entre tous les utilisateurs
- **Historique des versions** avec possibilité de restauration

### 🎯 Génération de Menus Intelligente
- **Mode STRICT** : Utilisation EXCLUSIVE des fichiers Excel du praticien
- **145 aliments disponibles** (45 Petit-Déj + 62 Déjeuner + 38 Dîner)
- **Calcul automatique** des calories et macronutriments
- **Respect des règles** définies dans les documents Word
- **Jeûne intermittent** configurable
- **Plans personnalisés** : Perte de poids, Vitalité, Confort digestif

### 📱 Questionnaire Personnalisé (7 Étapes)
- Objectifs nutritionnels
- Informations personnelles (taille, poids, âge, genre)
- Préférences alimentaires et intolérances
- Santé digestive et symptômes
- Morphotype (Ectomorphe, Mésomorphe, Endomorphe, Mixte)
- Niveau d'activité physique

### 🖥️ Interface Mobile Optimisée
- Design responsive adapté tous écrans
- Navigation intuitive entre les jours
- Affichage détaillé des repas
- Visualisation des macros
- Impression et partage

---

## 🏗️ Architecture

### Backend
- **Node.js** + Express
- **SQLite** (better-sqlite3) pour la persistance
- **Port** : 3001
- **Base de données** : `server/data/files.db`
- **Fichiers** : `server/uploads/versions/`

### Frontend
- **React 18** + Vite
- **Port dev** : 5173
- **Port sandbox** : 5181

### API Endpoints
```
GET  /api/health                          - Health check
GET  /api/stats                           - Statistiques générales
GET  /api/files                           - Liste tous les fichiers
GET  /api/files/:type                     - Dernière version d'un type
GET  /api/files/:type/versions            - Historique des versions
POST /api/files/upload                    - Upload nouveau fichier
GET  /api/files/download/:type/:version   - Téléchargement
```

---

## 🚀 Installation & Déploiement

### Prérequis
- Node.js 18+
- npm 9+

### Installation Locale

```bash
# Cloner le repository
git clone https://github.com/Jaokimben/nutriweek.git
cd nutriweek

# Installer les dépendances
npm install

# Backend
cd server
npm install
```

### Configuration Backend

Créer un fichier `.env` dans le dossier racine :

```env
# Server
PORT=3001
NODE_ENV=production

# CORS Origins (ajouter votre domaine Vercel)
ALLOWED_ORIGINS=https://nutriweek-es33.vercel.app,https://votre-domaine.com

# Upload
MAX_FILE_SIZE=10485760

# Database
DB_PATH=./server/data
```

### Configuration Frontend

**Pour le développement (sandbox)** :

Créer `.env.local` :
```env
VITE_BACKEND_URL=https://3001-VOTRE_SANDBOX_ID.sandbox.novita.ai
```

**Pour la production (Vercel)** :

Créer `.env.production` :
```env
VITE_BACKEND_URL=https://api.nutriweek.app
```

### Démarrage en Développement

```bash
# Backend (terminal 1)
node server/index.cjs

# Frontend (terminal 2)
npm run dev
```

### Build pour Production

```bash
# Build frontend
npm run build

# Preview du build
npm run preview
```

---

## 📦 Déploiement Production

### Backend (Railway, Render, Heroku, etc.)

1. **Variables d'environnement** :
   ```env
   PORT=3001
   NODE_ENV=production
   ALLOWED_ORIGINS=https://nutriweek-es33.vercel.app
   ```

2. **Start command** :
   ```bash
   node server/index.cjs
   ```

3. **Build command** :
   ```bash
   npm install
   ```

### Frontend (Vercel)

1. **Variables d'environnement Vercel** :
   ```
   VITE_BACKEND_URL=https://votre-backend.railway.app
   ```

2. **Build settings** :
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Domaine custom** (optionnel) :
   - Configurer `nutriweek.app` → Vercel
   - Configurer `api.nutriweek.app` → Backend

---

## 🔧 Configuration URLs Dynamiques (v2.8.10)

L'application détecte automatiquement l'environnement :

1. **VITE_BACKEND_URL** défini → Utilise cette URL
2. **Sandbox détecté** → Utilise URL sandbox
3. **Sinon** → Fallback `http://localhost:3001`

Aucune modification de code nécessaire pour changer d'environnement !

---

## 📊 État Actuel du Backend

### Fichiers Uploadés
- **9 types** de fichiers
- **34 versions** au total
- **459 KB** utilisés (sur 50 MB disponibles)

### Fichiers Excel (Aliments)
- Aliments Petit Déjeuner : 11 versions, 15.2 KB
- Aliments Déjeuner : 7 versions, 20.5 KB
- Aliments Dîner : 6 versions, 11.7 KB

### Fichiers Word (Règles)
- FODMAP : 3 versions
- Règles Générales : 3 versions
- Plans nutritionnels : Perte Poids H/F, Vitalité, Confort Digestif

---

## 🐛 Résolution des Problèmes

### Erreur "AUCUN FICHIER EXCEL UPLOADÉ"

**Vérifications** :
1. Backend est démarré sur port 3001
2. Variable `VITE_BACKEND_URL` correctement définie
3. Console navigateur : Vérifier `🔧 [API Config] Backend URL`
4. Doit afficher l'URL publique, **PAS** `localhost`

**Solution** :
- Rafraîchir avec Ctrl+Shift+R
- Vider le cache navigateur
- Ouvrir en navigation privée

### Fichiers non détectés malgré upload

**Cause** : Cache navigateur ou URLs mal configurées

**Solution** :
1. Vérifier console : `🏥 [Health Check] URL utilisée`
2. Si `localhost` → Problème de configuration
3. Redémarrer Vite : `npm run dev`

---

## 📝 Changelog

Voir [CHANGELOG.md](./CHANGELOG.md) pour l'historique complet des versions.

### v2.8.10 (2026-01-22) - PRODUCTION READY ✅
- ✅ URLs backend calculées dynamiquement
- ✅ Détection automatique de l'environnement
- ✅ Correction complète de la détection des fichiers
- ✅ 145 aliments disponibles pour génération
- ✅ Tests validés à 100%

---

## 🧪 Tests

### Tests Manuels Requis
1. ✅ Upload de fichiers (Portail Praticien)
2. ✅ Génération de menu (Questionnaire complet)
3. ✅ Affichage des 7 jours
4. ✅ Détail des recettes
5. ✅ Statistiques de stockage

### Endpoints de Test
- Health : `https://api.nutriweek.app/api/health`
- Files : `https://api.nutriweek.app/api/files`

---

## 📞 Support

Pour toute question ou problème :
- **Email** : joakimben1234@gmail.com
- **GitHub Issues** : [nutriweek/issues](https://github.com/Jaokimben/nutriweek/issues)

---

## 📄 Licence

Propriétaire - NutriWeek © 2026

---

## 👥 Auteurs

- **Développement initial** : Équipe NutriWeek
- **Migration SQLite (v2.8.0)** : 2026-01-20
- **Corrections URLs (v2.8.10)** : 2026-01-22

---

## 🎉 Remerciements

Merci à tous les contributeurs et utilisateurs qui ont testé et amélioré cette application !

---

**Status** : ✅ Production Ready - Version 2.8.10
