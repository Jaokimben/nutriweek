# 🏗️ BACKEND AVEC VERSIONING - DOCUMENTATION COMPLÈTE

## 📋 Vue d'Ensemble

Backend Node.js/Express pour la gestion des fichiers praticien avec **versioning automatique** et **aucune perte de données**.

### **Caractéristiques Principales**

✅ **Versioning Automatique**: Chaque upload crée une nouvelle version  
✅ **Pas d'Effacement**: Toutes les versions sont conservées  
✅ **Dernière Version Active**: L'app utilise automatiquement la dernière version  
✅ **Historique Complet**: Accès à toutes les versions précédentes  
✅ **API RESTful**: Endpoints clairs et documentés  
✅ **Téléchargement**: Récupération de n'importe quelle version  
✅ **Synchronisation**: Sync bidirectionnelle avec LocalStorage  

---

## 🏛️ Architecture

### **Structure des Dossiers**

```
server/
├── index.js              # Serveur Express principal
├── routes/
│   └── files.js          # Routes pour gestion fichiers
├── controllers/          # Logique métier (futurs)
├── models/               # Modèles de données (futurs)
├── uploads/
│   └── versions/         # Stockage des fichiers uploadés
└── db/
    └── files.json        # Base de données JSON (métadonnées)

src/services/
└── backendApi.js         # Service frontend pour API

```

### **Base de Données (JSON)**

```json
{
  "files": {
    "alimentsPetitDej": {
      "versions": [
        {
          "version": 1735660800000,
          "originalName": "petit_dej.xlsx",
          "fileName": "alimentsPetitDej_v1735660800000_petit_dej.xlsx",
          "filePath": "/server/uploads/versions/...",
          "size": 245678,
          "mimeType": "application/vnd.openxmlformats-...",
          "uploadedAt": "2025-12-31T15:00:00.000Z",
          "uploadedBy": "praticien"
        },
        {
          "version": 1735747200000,
          "originalName": "petit_dej_v2.xlsx",
          ...
        }
      ]
    },
    "alimentsDejeuner": { "versions": [...] },
    "alimentsDiner": { "versions": [...] },
    "fodmapList": { "versions": [...] },
    "reglesGenerales": { "versions": [...] },
    "pertePoidHomme": { "versions": [...] },
    "pertePoidFemme": { "versions": [...] },
    "vitalite": { "versions": [...] }
  }
}
```

---

## 📡 API Endpoints

### **1. Health Check**

```http
GET /api/health
```

**Réponse:**
```json
{
  "status": "ok",
  "message": "NutriWeek Backend API is running",
  "timestamp": "2025-12-31T15:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

---

### **2. Statistiques Globales**

```http
GET /api/stats
```

**Réponse:**
```json
{
  "totalFiles": 8,
  "totalVersions": 15,
  "fileTypes": {
    "alimentsPetitDej": {
      "versions": 3,
      "latestVersion": { ... }
    },
    ...
  }
}
```

---

### **3. Liste Tous les Fichiers**

```http
GET /api/files
```

**Réponse:**
```json
{
  "success": true,
  "files": {
    "alimentsPetitDej": {
      "current": { ...métadonnées dernière version... },
      "totalVersions": 3
    },
    ...
  },
  "timestamp": "2025-12-31T15:00:00.000Z"
}
```

---

### **4. Obtenir un Fichier Spécifique**

```http
GET /api/files/:type
```

**Exemple:**
```http
GET /api/files/alimentsPetitDej
```

**Réponse:**
```json
{
  "success": true,
  "fileType": "alimentsPetitDej",
  "currentVersion": {
    "version": 1735660800000,
    "originalName": "petit_dej.xlsx",
    "fileName": "alimentsPetitDej_v1735660800000_petit_dej.xlsx",
    "size": 245678,
    "uploadedAt": "2025-12-31T15:00:00.000Z"
  },
  "totalVersions": 3
}
```

---

### **5. Historique des Versions**

```http
GET /api/files/:type/versions
```

**Exemple:**
```http
GET /api/files/alimentsPetitDej/versions
```

**Réponse:**
```json
{
  "success": true,
  "fileType": "alimentsPetitDej",
  "versions": [
    { "version": 1735574400000, ... },
    { "version": 1735660800000, ... },
    { "version": 1735747200000, ... }
  ],
  "totalVersions": 3
}
```

---

### **6. Upload Fichier**

```http
POST /api/files/upload
Content-Type: multipart/form-data
```

**Body (FormData):**
- `file`: Fichier à uploader
- `fileType`: Type de fichier (ex: `alimentsPetitDej`)
- `uploadedBy`: (optionnel) Identifiant de l'uploadeur

**Réponse:**
```json
{
  "success": true,
  "message": "Fichier uploadé avec succès",
  "fileType": "alimentsPetitDej",
  "version": {
    "version": 1735747200000,
    "originalName": "petit_dej.xlsx",
    "size": 245678,
    "uploadedAt": "2025-12-31T15:00:00.000Z"
  },
  "totalVersions": 4
}
```

---

### **7. Télécharger Fichier**

```http
GET /api/files/download/:type/:version?
```

**Exemples:**
```http
# Dernière version
GET /api/files/download/alimentsPetitDej

# Version spécifique
GET /api/files/download/alimentsPetitDej/1735660800000
```

**Réponse:** Fichier en téléchargement

---

### **8. Supprimer une Version** (optionnel)

```http
DELETE /api/files/:type/versions/:version
```

**Exemple:**
```http
DELETE /api/files/alimentsPetitDej/versions/1735574400000
```

**Réponse:**
```json
{
  "success": true,
  "message": "Version supprimée avec succès",
  "remainingVersions": 2
}
```

---

## 🚀 Installation et Démarrage

### **1. Installer les Dépendances Backend**

```bash
cd /home/user/webapp
npm install express cors helmet compression multer dotenv node-json-db
npm install --save-dev nodemon
```

### **2. Copier la Configuration**

```bash
cp .env.backend .env
```

### **3. Démarrer le Backend**

```bash
# Mode développement (avec auto-reload)
npm run server:dev

# Mode production
npm run server
```

### **4. Vérifier le Backend**

```bash
curl http://localhost:3001/api/health
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "message": "NutriWeek Backend API is running",
  ...
}
```

---

## 🔌 Intégration Frontend

### **1. Configurer l'URL de l'API**

Créer `.env` dans la racine du projet:

```env
VITE_API_URL=http://localhost:3001/api
```

Pour production:
```env
VITE_API_URL=https://votre-backend.com/api
```

### **2. Utiliser le Service API**

```javascript
import { 
  uploadFileToBackend,
  getAllFilesFromBackend,
  downloadFileFromBackend,
  syncLocalStorageToBackend
} from './services/backendApi'

// Upload un fichier
const handleUpload = async (file) => {
  try {
    const result = await uploadFileToBackend('alimentsPetitDej', file)
    console.log('✅ Upload réussi:', result)
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

// Récupérer tous les fichiers
const fetchFiles = async () => {
  const files = await getAllFilesFromBackend()
  console.log('Fichiers:', files)
}

// Télécharger un fichier
const download = async () => {
  await downloadFileFromBackend('alimentsPetitDej')
}

// Synchroniser LocalStorage vers Backend
const sync = async () => {
  const result = await syncLocalStorageToBackend()
  console.log(`✅ ${result.uploaded} fichiers synchronisés`)
}
```

---

## 📊 Workflow de Versioning

### **Scénario d'Utilisation**

#### **Upload Initial**
```
Praticien → Upload "petit_dej_v1.xlsx"
Backend → Créé version 1735660800000
Database → versions: [v1]
Application → Utilise v1
```

#### **Upload Mise à Jour**
```
Praticien → Upload "petit_dej_v2.xlsx"
Backend → Créé version 1735747200000
Database → versions: [v1, v2]
Application → Utilise v2 automatiquement
Ancien v1 → Toujours disponible dans l'historique
```

#### **Upload Correction**
```
Praticien → Upload "petit_dej_v3.xlsx"
Backend → Créé version 1735833600000
Database → versions: [v1, v2, v3]
Application → Utilise v3 automatiquement
v1 et v2 → Toujours disponibles
```

### **Avantages**

✅ **Aucune Perte**: Toutes les versions conservées  
✅ **Rollback Possible**: Retour à version précédente si besoin  
✅ **Audit Trail**: Historique complet des modifications  
✅ **Sécurité**: Pas de risque d'écrasement accidentel  

---

## 🔐 Sécurité

### **Mesures Implémentées**

1. **Helmet**: Protection headers HTTP
2. **CORS**: Contrôle des origines autorisées
3. **Validation Fichiers**: Types et tailles validés
4. **Sanitization**: Noms de fichiers nettoyés
5. **Limite de Taille**: 10MB max par fichier

### **À Ajouter (Production)**

- [ ] Authentification JWT
- [ ] Rate Limiting
- [ ] Chiffrement des fichiers sensibles
- [ ] Backup automatique
- [ ] Logs d'audit

---

## 📧 Notification Email (Optionnel)

Ajouter notification email quand fichier uploadé:

```javascript
// Dans server/routes/files.js après upload
const sendEmailNotification = (fileType, version) => {
  // Utiliser nodemailer ou service email
  console.log(`📧 Email envoyé: Nouveau fichier ${fileType} v${version}`)
}
```

---

## 🚀 Déploiement

### **Options de Déploiement**

#### **Option 1: Heroku**
```bash
git push heroku main
```

#### **Option 2: Railway**
```bash
railway up
```

#### **Option 3: Render**
- Connecter repo GitHub
- Auto-deploy activé

#### **Option 4: VPS (DigitalOcean, Linode)**
```bash
pm2 start server/index.js --name nutriweek-backend
```

### **Variables d'Environnement (Production)**

```env
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://nutriweek-es33.vercel.app
MAX_FILE_SIZE=10485760
```

---

## 📈 Monitoring

### **Endpoints de Monitoring**

```javascript
// Health check
GET /api/health

// Stats
GET /api/stats

// Logs (à implémenter)
GET /api/logs
```

---

## 🎯 Prochaines Étapes

1. ✅ Backend créé avec versioning
2. ⏳ Installer les dépendances
3. ⏳ Démarrer le backend
4. ⏳ Tester les endpoints
5. ⏳ Intégrer au frontend
6. ⏳ Déployer en production

---

**🎉 BACKEND PRÊT À L'EMPLOI !**

**Fichiers Créés:**
- `server/index.js` - Serveur principal
- `server/routes/files.js` - Routes API
- `src/services/backendApi.js` - Service frontend
- `.env.backend` - Configuration
- `package-backend.json` - Dépendances

**Commande Démarrage:**
```bash
npm run server:dev
```

**URL Backend:**
```
http://localhost:3001/api
```

---

*Documentation créée le 2025-12-31*  
*NutriWeek Backend v1.0.0*
