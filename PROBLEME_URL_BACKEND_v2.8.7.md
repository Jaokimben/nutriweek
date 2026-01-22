# 🚨 PROBLÈME CRITIQUE IDENTIFIÉ: Configuration Backend

**Date**: 2026-01-22  
**Version**: v2.8.7 (en cours)  
**Problème**: L'application ne trouve pas les fichiers uploadés

---

## 🔍 DIAGNOSTIC COMPLET

### Symptôme
- ✅ Backend opérationnel (port 3001)
- ✅ 9 fichiers uploadés (459 KB, 34 versions)
- ✅ API `/api/files` répond correctement
- ❌ **Frontend ne détecte AUCUN fichier**
- ❌ Message "AUCUN FICHIER EXCEL UPLOADÉ" persiste

---

## 🎯 CAUSE RACINE (IDENTIFIÉE)

### URL Backend Incorrecte

**Fichier problématique**: `src/services/practitionerApiService.js`  
**Ligne 8**:
```javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
```

**Problème**:
1. ❌ Variable `VITE_BACKEND_URL` **non définie**
2. ❌ Fallback: `http://localhost:3001`
3. ❌ Dans le **navigateur**, `localhost` ne fonctionne **PAS**
4. ❌ Le frontend ne peut **pas** joindre le backend

### Environnement Sandbox

**Backend**: https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai  
**Frontend**: https://5181-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai

**Réseau**:
- ✅ Backend écoute sur `0.0.0.0:3001` (accessible publiquement)
- ✅ Frontend écoute sur `0.0.0.0:5181` (accessible publiquement)
- ❌ Frontend essaie d'appeler `http://localhost:3001` depuis le **navigateur**
- ❌ Le navigateur ne peut **pas** résoudre `localhost` vers le backend du sandbox

---

## ✅ SOLUTION APPLIQUÉE

### 1. Fichier `.env.local` Créé

**Fichier**: `/home/user/webapp/.env.local`
```env
# Configuration frontend pour le sandbox
# Ces variables sont utilisées par Vite (préfixe VITE_)

# URL du backend (publique sandbox)
VITE_BACKEND_URL=https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai
```

**Effet**:
- ✅ Vite charge automatiquement `.env.local`
- ✅ `import.meta.env.VITE_BACKEND_URL` défini
- ✅ Frontend utilise l'URL publique du backend
- ✅ CORS autorisé (backend accepte sandbox URLs)

### 2. Redémarrage Vite

**Commande**:
```bash
pkill -f "node.*vite"
npx vite --host 0.0.0.0 --port 5181
```

**Raison**: Vite charge les variables d'environnement **au démarrage uniquement**

---

## 🧪 TESTS REQUIS

### Test 1: Vérifier la Configuration

1. **Ouvrir** l'app: https://5181-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai
2. **Console** (F12)
3. **Exécuter**:
```javascript
console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
// Attendu: https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai
```

### Test 2: getAllFiles() dans la Console

```javascript
// Dans la console du navigateur
const { getAllFiles } = await import('./src/utils/practitionerStorageV2.js');
const files = await getAllFiles();

console.log('Fichiers:', files);
console.log('alimentsPetitDej:', files.alimentsPetitDej?.name);
console.log('alimentsDejeuner:', files.alimentsDejeuner?.name);
console.log('alimentsDiner:', files.alimentsDiner?.name);
```

**Résultat attendu**:
```
alimentsPetitDej: "Aliments Petit Dejeuner n.xlsx"
alimentsDejeuner: "Aliments Dejeuner n.xlsx"
alimentsDiner: "Aliments Diner n.xlsx"
```

### Test 3: Génération de Menu

1. **Remplir** le questionnaire
2. **Générer** le menu
3. **Console** (F12): Vérifier les logs
```
🔍 Vérification fichiers Excel praticien:
  Petit-déjeuner: ✅ Aliments Petit Dejeuner n.xlsx
  Déjeuner: ✅ Aliments Dejeuner n.xlsx
  Dîner: ✅ Aliments Diner n.xlsx
✅ 3/3 fichiers Excel détectés
```

4. **Résultat attendu**: ✅ Menu généré **SANS** message "aucun fichier"

---

## 📊 Comparaison Avant/Après

### ❌ AVANT (Problème)

**Configuration**:
```javascript
// practitionerApiService.js
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
// → VITE_BACKEND_URL non défini
// → Utilise 'http://localhost:3001'
```

**Réseau**:
```
Frontend (navigateur) → http://localhost:3001
                       ❌ ÉCHEC: localhost ne résout pas vers le backend
```

**Logs**:
```
⚠️ Backend indisponible, utilisation localStorage
📦 [getAllFiles] Lecture depuis localStorage (fallback)
⚠️ localStorage vide, retour valeurs par défaut
```

**Résultat**:
```
❌ 0 fichiers détectés
❌ Message "AUCUN FICHIER EXCEL UPLOADÉ"
```

---

### ✅ APRÈS (Solution)

**Configuration**:
```env
# .env.local
VITE_BACKEND_URL=https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai
```

```javascript
// practitionerApiService.js
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
// → VITE_BACKEND_URL = https://3001-..sandbox.novita.ai
// → Utilise l'URL publique
```

**Réseau**:
```
Frontend (navigateur) → https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai
                       ✅ SUCCÈS: URL publique accessible
```

**Logs**:
```
🔌 Backend disponible
✅ [getAllFiles] Fichiers récupérés du backend
🔍 Vérification fichiers Excel praticien:
  Petit-déjeuner: ✅ Aliments Petit Dejeuner n.xlsx
  Déjeuner: ✅ Aliments Dejeuner n.xlsx
  Dîner: ✅ Aliments Diner n.xlsx
✅ 3/3 fichiers Excel détectés
```

**Résultat**:
```
✅ 9 fichiers détectés
✅ Menu généré avec succès
```

---

## 🚀 DÉPLOIEMENT

### Fichiers Modifiés
- ✅ `.env.local` (nouveau)
- ✅ `public/test-backend-config.js` (test)
- ✅ `test-getAllFiles.html` (test)
- ✅ `PROBLEME_URL_BACKEND_v2.8.7.md` (documentation)

### Actions Requises
1. ✅ Vite redémarré sur port 5181
2. 🧪 **TEST IMMÉDIAT**: Ouvrir l'app et vérifier la console
3. 🧪 **TEST GÉNÉRATION**: Remplir questionnaire et générer menu
4. ✅ Commit si tests OK

---

## 🎓 Leçons Apprises

### 1. Variables d'Environnement Vite
- **Préfixe obligatoire**: `VITE_*` pour être accessible côté client
- **Fichiers**: `.env`, `.env.local`, `.env.production`
- **Rechargement**: Redémarrer Vite après modification

### 2. Environnement Sandbox vs Production
- **Sandbox**: URLs dynamiques par session
- **Production**: URLs fixes (ex: api.nutriweek.app)
- **Solution**: Variables d'environnement par environnement

### 3. Réseau Frontend/Backend
- **Frontend** exécute dans le **navigateur** (client)
- **Backend** exécute sur le **serveur**
- **localhost** fonctionne **uniquement** pour le serveur lui-même
- **Solution**: URLs publiques ou proxies

---

## ✅ VALIDATION FINALE

- [x] Backend accessible (health check OK)
- [x] `.env.local` créé avec URL publique
- [x] Vite redémarré avec nouvelle config
- [ ] **TEST**: Console vérifier `import.meta.env.VITE_BACKEND_URL`
- [ ] **TEST**: `getAllFiles()` retourne les fichiers
- [ ] **TEST**: Génération de menu fonctionne
- [ ] Commit v2.8.7

---

**⚠️ ACTION CRITIQUE REQUISE**: 
1. **Rafraîchir** la page (Ctrl+Shift+R pour forcer reload)
2. **Ouvrir** la console (F12)
3. **Vérifier** que `VITE_BACKEND_URL` est défini
4. **Tester** la génération de menu

Si le problème persiste, exécuter dans la console :
```javascript
console.log(import.meta.env);
```
et partager le résultat.
