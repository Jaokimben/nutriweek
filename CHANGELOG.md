# Changelog - NutriWeek

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [2.8.10] - 2026-01-22

### 🎯 Correction Majeure - URLs Backend Dynamiques

**Problème résolu** : L'application ne détectait pas les fichiers uploadés malgré leur présence sur le backend.

**Cause racine** : Les URLs du backend étaient calculées une seule fois au chargement du module, causant un fallback permanent vers `localhost:3001` même dans l'environnement sandbox.

**Solution** : Remplacement des constantes `API_BASE_URL` et `API_FILES_ENDPOINT` par des fonctions dynamiques qui recalculent l'URL à chaque appel API.

### Added
- ✅ Fonction `getApiBaseUrl()` - Calcul dynamique de l'URL backend
- ✅ Fonction `getApiFilesEndpoint()` - Calcul dynamique de l'endpoint files
- ✅ Logs de diagnostic détaillés pour chaque calcul d'URL
- ✅ Cache-busting dans les requêtes health check
- ✅ Page de test `/test-backend.html` pour diagnostic
- ✅ Page de test `/test-env.html` pour variables d'environnement
- ✅ Page `/clear-cache.html` avec instructions

### Changed
- ✅ Toutes les références `API_BASE_URL` remplacées par `getApiBaseUrl()`
- ✅ Toutes les références `API_FILES_ENDPOINT` remplacées par `getApiFilesEndpoint()`
- ✅ `checkBackendHealth()` avec URL dynamique et logs
- ✅ `uploadFile()` avec endpoint dynamique
- ✅ `getAllFiles()` avec endpoint dynamique
- ✅ `getLatestVersion()` avec endpoint dynamique
- ✅ `downloadFile()` avec endpoint dynamique
- ✅ `getFileVersions()` avec endpoint dynamique
- ✅ `getStats()` avec URL dynamique

### Fixed
- 🐛 Détection automatique du sandbox via `window.location.hostname`
- 🐛 URLs backend calculées au bon moment (après chargement de la page)
- 🐛 Condition d'erreur trop large dans `WeeklyMenu.jsx`
- 🐛 Fonction `getActivationStatus()` retourne maintenant l'objet complet
- 🐛 Fonction `getStorageStats()` retourne les propriétés formatées
- 🐛 Détection des fichiers Excel avec `await` et vérification `.name`
- 🐛 Chargement des fichiers depuis le backend avec téléchargement

### Technical Details
- **Fichiers modifiés** : 
  - `src/services/practitionerApiService.js` (36 insertions, 16 suppressions)
  - `src/utils/practitionerStorageV2.js` (corrections multiples)
  - `src/utils/menuGeneratorSwitch.js` (fonctions async)
  - `src/utils/menuGeneratorFromExcel.js` (téléchargement backend)
  - `src/components/WeeklyMenu.jsx` (condition d'erreur précise)
  - `src/components/PractitionerPortal.jsx` (gestion désactivation)

- **Configuration** :
  - `.env.local` avec `VITE_BACKEND_URL` pour sandbox
  - `.env.local.example` comme template

---

## [2.8.0-2.8.9] - 2026-01-20 à 2026-01-22

### Migration SQLite & Corrections Multiples

#### v2.8.0 - Migration SQLite
- ✅ Migration complète de JsonDB vers SQLite (better-sqlite3)
- ✅ Nouveau module `server/database.cjs` pour gestion DB
- ✅ Routes backend réécrites pour SQLite
- ✅ 8 versions migrées (85.74 KB)
- ✅ Tests passés à 100%

#### v2.8.1 - Fix Bouton Activer
- 🐛 `getActivationStatus()` retourne objet complet au lieu de boolean
- 🐛 Propriétés : `isActive`, `uploadedFiles`, `hasExcelFiles`, `lastUpdated`

#### v2.8.2 - Fix Statistiques Vides
- 🐛 `getStorageStats()` retourne propriétés formatées
- 🐛 Propriétés : `fileCount`, `formattedSize`, `formattedMax`, `usedPercent`
- 🐛 Correction `mimeType` au lieu de `mimetype`

#### v2.8.3 - Fix Bouton Bloqué
- 🐛 `getActivationStatus()` - `isActive` basé sur présence de fichiers
- 🐛 `handleDeactivate()` gère le cas backend (message explicatif)

#### v2.8.4 - Fix Détection Fichiers
- 🐛 `verifierFichiersExcelPresents()` avec `await getAllFiles()`
- 🐛 Vérification via `.name` au lieu de `.data`
- 🐛 Propagation `async/await` sur 5 fonctions

#### v2.8.5 - Fix Chargement (0 aliments)
- 🐛 `chargerAlimentsExcel()` avec `await getAllFiles()`
- 🐛 Téléchargement des fichiers depuis backend
- 🐛 Parsing des données téléchargées

#### v2.8.6 - Fix Message Final Erroné
- 🐛 Condition d'erreur plus précise dans `WeeklyMenu.jsx`
- 🐛 Cherche `'AUCUN FICHIER EXCEL UPLOADÉ'` au lieu de `'EXCEL'`

#### v2.8.7 - Configuration .env.local
- ✅ Création `.env.local` avec `VITE_BACKEND_URL`
- ✅ Template `.env.local.example`

#### v2.8.8 - Détection Auto Sandbox
- ✅ Hardcode URL sandbox dans le code source
- ✅ Logs de diagnostic ajoutés

#### v2.8.9 - Cache-busting
- ✅ Timestamp dans URL health check
- ✅ Header `cache: 'no-cache'`

---

## État Backend

### Fichiers Présents
- **9 types** de fichiers
- **34 versions** au total
- **459 KB** utilisés (sur 50 MB)

### Fichiers Excel (Aliments)
- ✅ **Aliments Petit Déjeuner** - 11 versions, 15.2 KB
- ✅ **Aliments Déjeuner** - 7 versions, 20.5 KB
- ✅ **Aliments Dîner** - 6 versions, 11.7 KB
- **Total** : 145 aliments disponibles (45 + 62 + 38)

### Fichiers Word (Règles)
- ✅ **FODMAP** - 3 versions, 9.3 KB
- ✅ **Règles Générales** - 3 versions, 15.0 KB
- ✅ **Perte Poids Homme** - 2 versions, 15.4 KB
- ✅ **Perte Poids Femme** - 3 versions, 15.0 KB
- ✅ **Vitalité** - 2 versions, 15.9 KB
- ✅ **Confort Digestif** - 4 versions, 14.7 KB

---

## Architecture

### Backend
- **Technologie** : Node.js + Express + SQLite (better-sqlite3)
- **Port** : 3001
- **Base de données** : `server/data/files.db`
- **Storage** : `server/uploads/versions/`

### Frontend
- **Technologie** : React + Vite
- **Port** : 5173 (dev), 5181 (sandbox)
- **Build** : Production-ready

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/stats` - Statistiques générales
- `GET /api/files` - Liste tous les fichiers
- `GET /api/files/:type` - Dernière version d'un type
- `GET /api/files/:type/versions` - Historique des versions
- `POST /api/files/upload` - Upload nouveau fichier
- `GET /api/files/download/:type/:version` - Téléchargement

---

## Déploiement

### Prérequis
- Node.js 18+
- npm 9+

### Variables d'environnement requises

#### Backend (.env)
```env
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://nutriweek-es33.vercel.app
MAX_FILE_SIZE=10485760
```

#### Frontend (.env.production)
```env
VITE_BACKEND_URL=https://api.nutriweek.app
```

### Installation
```bash
# Backend
cd server
npm install
npm start

# Frontend
npm install
npm run build
npm run preview
```

---

## Notes Techniques

### Gestion du Cache
- Les modules JavaScript sont recalculés dynamiquement
- Pas de cache des URLs backend
- Cache-busting sur les health checks

### CORS
- Backend accepte les requêtes du frontend Vercel
- Sandbox URLs autorisées en développement

### Versioning
- Chaque upload crée une nouvelle version
- Timestamp utilisé comme clé de version
- Historique complet conservé

---

## Auteurs
- **Développement** : Équipe NutriWeek
- **Backend SQLite** : v2.8.0 - 2026-01-20
- **Corrections URLs** : v2.8.10 - 2026-01-22

---

## Licence
Propriétaire - NutriWeek © 2026
