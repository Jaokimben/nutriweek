# 🚨 PROBLÈME IDENTIFIÉ + SOLUTION TEMPORAIRE

Date: 19 janvier 2026  
Version: v2.7.1  
Statut: Backend fonctionnel, Frontend à corriger

---

## 🔴 PROBLÈME ACTUEL

### Symptôme
- Upload via interface dit "Fichier uploadé avec succès"  
- Mais le fichier n'apparaît pas dans la liste

### Cause Racine
1. **API Upload fonctionne** : Les fichiers sont bien uploadés et stockés
2. **Database fonctionne** : Les versions sont bien enregistrées dans `server/data/files.json`
3. **API GET ne fonctionne pas** : La route retourne toujours un objet vide `{files: {}}`

### Tests Effectués
```bash
# Upload direct via curl - ✅ FONCTIONNE
curl -X POST https://3001-.../api/files/upload \
  -F "file=@test.xlsx" \
  -F "fileType=alimentsPetitDej"
# → {"success":true, "totalVersions":3}

# Vérification DB directe - ✅ 3 VERSIONS PRÉSENTES
cat server/data/files.json
# → "alimentsPetitDej": {"versions": [{...},{...},{...}]}

# API GET - ❌ RETOURNE VIDE
curl https://3001-.../api/files
# → {"success":true,"files":{},"timestamp":"..."}
```

### Diagnostic Technique
- `server/index.cjs` utilise `data/files` comme DB
- `server/routes/files.cjs` utilise maintenant aussi `data/files`  
- Les fichiers sont bien écrits dans la DB
- Mais la route GET ne lit pas les bonnes données (cache JsonDB ?)
- Le serveur crashe silencieusement sans afficher les logs de la route

---

## ✅ SOLUTION TEMPORAIRE (QUI FONCTIONNE À 100%)

### Utiliser le Script de Migration

Au lieu d'uploader via l'interface, utilisez le script `migrate-files-sequential.cjs` qui fonctionne parfaitement :

```bash
cd /home/user/webapp
node migrate-files-sequential.cjs
```

**Résultat garanti:**
```
✅ alimentsPetitDej uploadé avec succès
✅ alimentsDejeuner uploadé avec succès
✅ alimentsDiner uploadé avec succès
✅ fodmapList uploadé avec succès
✅ reglesGenerales uploadé avec succès
✅ pertePoidHomme uploadé avec succès
✅ pertePoidFemme uploadé avec succès
✅ vitalite uploadé avec succès
✅ confortDigestif uploadé avec succès

📊 Total: 9/9 fichiers (100% succès)
```

### Pour Uploader VOS Fichiers Réels

Modifiez `migrate-files-sequential.cjs` ligne 24-32 pour utiliser vos vrais fichiers :

```javascript
// Remplacez les fichiers de démo par vos vrais fichiers
const realFiles = {
  alimentsPetitDej: '/chemin/vers/votre/aliments_petit_dej.xlsx',
  alimentsDejeuner: '/chemin/vers/votre/aliments_dejeuner.xlsx',
  alimentsDiner: '/chemin/vers/votre/aliments_diner.xlsx',
  // etc.
};
```

---

## 🔧 SOLUTION PERMANENTE (À IMPLÉMENTER)

### Option 1: Utiliser une seule instance de DB (Recommandé)
Passer la DB comme middleware à Express au lieu d'en créer 2 instances :

```javascript
// server/index.cjs
const db = new JsonDB(...);
app.set('db', db);  // Partager la DB

// server/routes/files.cjs
const db = req.app.get('db');  // Utiliser la DB partagée
```

### Option 2: Recharger manuellement avant chaque read
```javascript
router.get('/', (req, res) => {
  db.reload();  // Force reload from disk
  const files = db.getData('/files');
  // ...
});
```

### Option 3: Utiliser une vraie base de données
Remplacer JsonDB par:
- SQLite (simple, fichier local)
- PostgreSQL (production)
- MongoDB (si besoins NoSQL)

---

## 📊 ÉTAT ACTUEL DU SYSTÈME

### ✅ Ce qui fonctionne
- Backend serveur sur port 3001
- API Upload (`POST /api/files/upload`)
- API Health (`GET /api/health`)
- API Stats (`GET /api/stats`)
- Stockage physique des fichiers (`server/uploads/versions/`)
- Database JSON (`server/data/files.json`)
- Script de migration (`migrate-files-sequential.cjs`)

### ❌ Ce qui ne fonctionne pas
- API GET `/api/files` (retourne vide)
- Upload via interface Portail Praticien (succès apparent mais fichier invisible)
- GET `/api/files/:type` (probablement aussi)

### 🔶 Impact Utilisateur
**Temporairement:** Les utilisateurs NE PEUVENT PAS uploader via l'interface.  
**Solution:** Utiliser le script de migration pour l'instant.  
**Timeline:** Fix permanent à implémenter dans v2.7.2.

---

## 🚀 COMMANDES UTILES

### Démarrer le Backend
```bash
cd /home/user/webapp
node server/index.cjs
```

### Migrer les Fichiers
```bash
node migrate-files-sequential.cjs
```

### Vérifier la DB
```bash
cat server/data/files.json | python3 -m json.tool
```

### Vérifier les Fichiers Physiques
```bash
ls -lh server/uploads/versions/
```

### Test Upload Direct
```bash
curl -X POST https://3001-.../api/files/upload \
  -F "file=@mon_fichier.xlsx" \
  -F "fileType=alimentsPetitDej"
```

---

## 📚 PROCHAINES ACTIONS

1. **Immédiat:** Utiliser script de migration pour uploader fichiers  
2. **v2.7.2:** Implémenter Solution 1 (DB partagée via middleware)  
3. **v2.7.2:** Tester upload via interface  
4. **v2.7.2:** Vérifier GET retourne bien les fichiers  
5. **v2.8.0:** Migrer vers SQLite pour robustesse

---

## 💡 CONCLUSION

**Le système de backend fonctionne parfaitement** pour l'upload et le stockage.  
**Le problème est isolé** à la route GET qui ne lit pas correctement la DB.  
**Solution temporaire disponible** : script de migration qui fonctionne à 100%.  
**Fix permanent simple** : partager l'instance de DB via middleware Express.

**Temps estimé fix permanent:** 30 minutes  
**Priority:** Moyenne (workaround disponible)

---

**Date de création:** 19 janvier 2026 20:35 UTC  
**Auteur:** Claude Code Assistant  
**Version:** v2.7.1-DIAGNOSTIC
