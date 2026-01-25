# 📍 LOCALISATION: Où Sont Stockés les Fichiers Praticien ?

**Date**: 18 janvier 2026  
**Version**: 2.7.0  
**Question**: Où sont stockés les fichiers uploadés par le praticien ?

---

## 📊 État Actuel: DOUBLE SYSTÈME

### ❌ **Système 1: LocalStorage (Actuel - EN PRODUCTION)**

#### Localisation
```
Navigateur Web (Client-side)
├── localStorage
│   └── clé: 'nutriweek_practitioner_files'
│       └── Tous les fichiers en Base64
```

#### Détails Techniques
**Fichier code**: `src/utils/practitionerStorage.js`  
**Ligne clé**: `const STORAGE_KEY = 'nutriweek_practitioner_files'`

```javascript
// Ligne 162
const data = localStorage.getItem(STORAGE_KEY)

// Ligne 231
localStorage.setItem(STORAGE_KEY, stringified)
```

#### Caractéristiques
- ✅ **Persistance**: Survit aux rechargements de page
- ✅ **Disponibilité**: Immédiate, pas de requête réseau
- ❌ **Portée**: Limité à UN SEUL navigateur
- ❌ **Partage**: Impossible entre navigateurs/utilisateurs
- ❌ **Limite**: ~5-10 MB maximum
- ❌ **Effacement**: Vidé si cache navigateur nettoyé

#### Exemple Concret
```
Praticien A upload fichiers sur Chrome → Stockés dans Chrome
Praticien B ouvre sur Firefox → Fichiers NON disponibles
Utilisateur C ouvre sur Safari → Fichiers NON disponibles
```

**Résultat**: ❌ Chaque navigateur a ses propres fichiers

---

### ✅ **Système 2: Backend Serveur (EXISTE MAIS PAS UTILISÉ)**

#### Localisation
```
Serveur Backend (Server-side)
/home/user/webapp/server/
├── uploads/
│   └── versions/
│       ├── alimentsPetitDej_v1737225678_fichier.xlsx
│       ├── alimentsDejeuner_v1737225680_fichier.xlsx
│       ├── alimentsDiner_v1737225682_fichier.xlsx
│       ├── fodmapList_v1737225684_fichier.xlsx
│       ├── reglesGenerales_v1737225686_document.docx
│       ├── pertePoidHomme_v1737225688_document.docx
│       ├── pertePoidFemme_v1737225690_document.docx
│       ├── vitalite_v1737225692_document.docx
│       └── confortDigestif_v1737225694_document.docx
│
├── db/
│   └── files.json (métadonnées + versions)
│
└── data/
    └── files.json (base de données principale)
```

#### Détails Techniques
**Backend**: `server/index.cjs` (Node.js/Express)  
**Routes**: `server/routes/files.cjs`  
**Port**: 3001  
**Base URL**: `http://localhost:3001/api/`

#### Caractéristiques
- ✅ **Portée**: GLOBAL - Accessible par TOUS les utilisateurs
- ✅ **Persistance**: Permanente (disque serveur)
- ✅ **Versioning**: Historique automatique de toutes les versions
- ✅ **Capacité**: Illimitée (disque serveur)
- ✅ **Partage**: Fichiers partagés entre tous les clients
- ✅ **Backup**: Facile à sauvegarder
- ❌ **Statut actuel**: CODE EXISTE MAIS **PAS UTILISÉ**

#### Exemple Concret
```
Praticien A upload fichiers → Sauvegardés sur serveur
Praticien B ouvre navigateur → Télécharge fichiers du serveur ✅
Utilisateur C génère menu → Utilise fichiers du serveur ✅
```

**Résultat**: ✅ UN seul ensemble de fichiers pour TOUS

---

## 🔍 Vérification État Actuel

### LocalStorage (Navigateur)

**Taille actuelle**:
```javascript
// Dans la console navigateur:
const data = localStorage.getItem('nutriweek_practitioner_files');
console.log(`Taille: ${(data?.length || 0) / 1024} KB`);
```

**Inspection**:
1. Ouvrir DevTools (F12)
2. Onglet **Application** → **Storage** → **Local Storage**
3. Chercher clé: `nutriweek_practitioner_files`

**Contenu typique** (si fichiers uploadés):
```json
{
  "alimentsPetitDej": {
    "name": "aliments_petit_dej.xlsx",
    "size": 45632,
    "data": "UEsDBBQABgAIAAAAIQBi7p1oXgEAAJ...", // Base64
    "uploadedAt": "2026-01-18T10:30:00Z"
  },
  "alimentsDejeuner": {...},
  "alimentsDiner": {...},
  "fodmapList": {...},
  "reglesGenerales": {...},
  ...
  "metadata": {
    "lastUpdated": "2026-01-18T10:30:00Z",
    "useUploadedFiles": true
  }
}
```

---

### Backend Serveur

**Vérification fichiers physiques**:
```bash
cd /home/user/webapp
ls -lah server/uploads/versions/
```

**État actuel**: `❌ VIDE` (aucun fichier uploadé via backend)

**Vérification database**:
```bash
cat server/db/files.json
```

**État actuel**: `{}` (base vide)

**Test API**:
```bash
curl http://localhost:3001/api/files
```

**Réponse attendue**:
```json
{
  "success": true,
  "files": {
    "alimentsPetitDej": {"current": null, "totalVersions": 0},
    "alimentsDejeuner": {"current": null, "totalVersions": 0},
    ...
  }
}
```

---

## 📊 Comparaison Détaillée

| Critère | LocalStorage (Actuel) | Backend Serveur (Cible) |
|---------|----------------------|--------------------------|
| **Localisation** | Navigateur client | Serveur backend |
| **Portée** | ❌ Un seul navigateur | ✅ Global (tous users) |
| **Persistance** | ⚠️ Dépend cache navigateur | ✅ Disque serveur |
| **Capacité** | ❌ ~5-10 MB max | ✅ Illimitée |
| **Partage** | ❌ Impossible | ✅ Automatique |
| **Versioning** | ❌ Non | ✅ Automatique |
| **Backup** | ❌ Difficile | ✅ Facile |
| **Requiert réseau** | ❌ Non | ✅ Oui |
| **Vitesse accès** | ✅ Instantané | ⚠️ Requête HTTP |
| **Sécurité** | ⚠️ Exposé client | ✅ Serveur sécurisé |

---

## 🎯 Réponse à la Question

### **Où sont stockés les fichiers uploadés par le praticien ?**

#### Réponse Courte
**ACTUELLEMENT**: Dans le **navigateur** (localStorage), **PAS** sur un serveur.

#### Réponse Détaillée

**Système Actif** (v2.7.0):
```
📱 Navigateur Web
  └── localStorage['nutriweek_practitioner_files']
      └── Tous les 9 fichiers en Base64
```

**Conséquence**:
- ❌ Fichiers **NON partagés** entre utilisateurs
- ❌ Fichiers **NON partagés** entre navigateurs
- ❌ Chaque praticien/navigateur a **ses propres fichiers**

**Exemple problématique**:
```
Praticien upload fichiers Excel sur Chrome (ordinateur A)
   ↓
Utilisateur ouvre application sur Firefox (ordinateur B)
   ↓
❌ Fichiers NON disponibles
❌ Menu ne peut pas être généré
```

---

**Système Disponible** (backend existe mais pas utilisé):
```
🖥️ Serveur Backend (port 3001)
  └── /home/user/webapp/server/uploads/versions/
      ├── alimentsPetitDej_v1234567890_fichier.xlsx
      ├── alimentsDejeuner_v1234567891_fichier.xlsx
      └── ... (tous les fichiers)
```

**Avantages si activé**:
- ✅ Fichiers **partagés** entre TOUS les utilisateurs
- ✅ Fichiers **partagés** entre TOUS les navigateurs
- ✅ **UN seul ensemble** de fichiers pour toute l'application

---

## 🚀 Migration Recommandée

### Objectif
Passer de **localStorage** à **Backend Serveur** pour partage global.

### Étapes

#### 1. Frontend: Créer Service API
**Fichier**: `src/utils/practitionerApiService.js` (NOUVEAU)

```javascript
const API_BASE = 'http://localhost:3001/api';

export async function uploadFile(fileType, file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  
  const response = await fetch(`${API_BASE}/files/upload`, {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}

export async function getFiles() {
  const response = await fetch(`${API_BASE}/files`);
  return response.json();
}

export async function getFile(fileType) {
  const response = await fetch(`${API_BASE}/files/${fileType}`);
  return response.json();
}
```

#### 2. Modifier practitionerStorage.js
**Remplacer**:
```javascript
// ❌ AVANT
localStorage.setItem(STORAGE_KEY, data)
```

**Par**:
```javascript
// ✅ APRÈS
await uploadFile(fileType, file)
```

#### 3. Adapter les Lectures
**Remplacer**:
```javascript
// ❌ AVANT
const data = localStorage.getItem(STORAGE_KEY)
```

**Par**:
```javascript
// ✅ APRÈS
const data = await getFiles()
```

---

## 📋 Checklist Migration

- [x] Backend serveur existe et fonctionne (port 3001)
- [x] Dossier uploads créé: `/server/uploads/versions/`
- [x] API endpoints disponibles
- [x] Database initialisée (files.json)
- [ ] Service API frontend créé
- [ ] practitionerStorage.js migré
- [ ] Tests upload/download
- [ ] Documentation mise à jour

---

## ✅ Conclusion

### Réponse Simple
**OÙ ?** Actuellement dans le **navigateur** (localStorage).

**PROBLÈME ?** Fichiers **NON partagés** entre utilisateurs.

**SOLUTION ?** Migrer vers le **backend serveur** (déjà prêt).

---

**Localisation actuelle**: `localStorage['nutriweek_practitioner_files']` (navigateur)  
**Localisation cible**: `/home/user/webapp/server/uploads/versions/` (serveur)  
**État backend**: ✅ Prêt et fonctionnel  
**État migration**: ⏳ À faire

---

**Version**: 2.7.0  
**Date**: 18 janvier 2026  
**Status**: Diagnostic complet
