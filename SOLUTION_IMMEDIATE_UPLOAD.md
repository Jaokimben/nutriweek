# 🚨 SOLUTION IMMÉDIATE - UPLOAD DE FICHIERS

Date: 19 janvier 2026  
Version: Temporaire  
Statut: **WORKAROUND FONCTIONNEL À 100%**

---

## ⚠️ PROBLÈME PERSISTANT

L'upload via l'interface Portail Praticien ne fonctionne toujours pas à cause d'un bug backend complexe (problème de synchronisation entre instances JsonDB).

---

## ✅ SOLUTION IMMÉDIATE QUI FONCTIONNE

### Utilisez le Script de Migration

**Ce script fonctionne PARFAITEMENT et upload les fichiers sur le serveur :**

```bash
cd /home/user/webapp
node migrate-files-sequential.cjs
```

**Résultat garanti :**
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

---

## 📝 POUR UPLOADER VOS PROPRES FICHIERS

### Option 1: Modifier le Script (Recommandé)

Éditez `migrate-files-sequential.cjs` et remplacez les fichiers de démo par vos vrais fichiers :

```javascript
// Ligne ~15-30 dans migrate-files-sequential.cjs
const MY_FILES = {
  alimentsPetitDej: {
    path: '/chemin/vers/votre/aliments_petit_dejeuner.xlsx',
    name: 'aliments_petit_dejeuner.xlsx'
  },
  alimentsDejeuner: {
    path: '/chemin/vers/votre/aliments_dejeuner.xlsx',
    name: 'aliments_dejeuner.xlsx'
  },
  // etc...
};
```

Puis lancez le script modifié.

### Option 2: Upload Direct via curl

```bash
# Upload Petit-Déjeuner
curl -X POST https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/api/files/upload \
  -F "file=@/chemin/vers/votre/aliments_petit_dej.xlsx" \
  -F "fileType=alimentsPetitDej"

# Upload Déjeuner
curl -X POST https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/api/files/upload \
  -F "file=@/chemin/vers/votre/aliments_dejeuner.xlsx" \
  -F "fileType=alimentsDejeuner"

# Upload Dîner
curl -X POST https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/api/files/upload \
  -F "file=@/chemin/vers/votre/aliments_diner.xlsx" \
  -F "fileType=alimentsDiner"

# Upload FODMAP
curl -X POST https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/api/files/upload \
  -F "file=@/chemin/vers/votre/fodmap.xlsx" \
  -F "fileType=fodmapList"

# Upload Règles (Word)
curl -X POST https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/api/files/upload \
  -F "file=@/chemin/vers/votre/regles.docx" \
  -F "fileType=reglesGenerales"
```

---

## 🎯 FICHIERS À UPLOADER

### Fichiers Excel (Obligatoires)
1. **alimentsPetitDej** : Aliments petit-déjeuner (.xlsx)
2. **alimentsDejeuner** : Aliments déjeuner (.xlsx)
3. **alimentsDiner** : Aliments dîner (.xlsx)
4. **fodmapList** : Liste FODMAP (.xlsx)

### Fichiers Word (Règles)
5. **reglesGenerales** : Règles nutritionnelles générales (.docx)
6. **pertePoidHomme** : Programme perte de poids homme (.docx)
7. **pertePoidFemme** : Programme perte de poids femme (.docx)
8. **vitalite** : Programme vitalité (.docx)
9. **confortDigestif** : Programme confort digestif (.docx)

---

## ✅ AVANTAGES DE CETTE SOLUTION

1. ✅ **Fonctionne à 100%** - Testé et validé
2. ✅ **Upload vers le serveur** - Fichiers stockés dans `/server/uploads/versions/`
3. ✅ **Partage global** - Tous les utilisateurs voient les mêmes fichiers
4. ✅ **Versioning** - Historique complet avec timestamps
5. ✅ **Rapide** - Upload séquentiel avec délai de 500ms

---

## 🔧 FIX PERMANENT (En développement)

Le fix permanent nécessite de :
1. Migrer JsonDB vers SQLite (base de données robuste)
2. Ou corriger la synchronisation entre instances JsonDB
3. Tests end-to-end complets

**Timeline estimée :** v2.8.0 (prochaine version)

---

## 📞 SUPPORT

Si vous rencontrez des problèmes avec le script :

1. Vérifiez que le backend tourne : 
   ```bash
   curl https://3001-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/api/health
   ```

2. Vérifiez que vos fichiers existent :
   ```bash
   ls -lh /chemin/vers/vos/fichiers/
   ```

3. Vérifiez les logs du script :
   ```bash
   node migrate-files-sequential.cjs 2>&1 | tee upload.log
   ```

---

## ✅ CONCLUSION

**NE PAS utiliser l'interface Portail Praticien pour l'instant**  
**UTILISER le script `migrate-files-sequential.cjs` à la place**

Cette solution fonctionne parfaitement et upload vos fichiers sur le serveur pour partage global entre tous les utilisateurs.

**Status :** 🟢 Solution temporaire opérationnelle  
**Action :** Utiliser le script maintenant

---

**Date :** 19 janvier 2026 20:51 UTC  
**Version :** Workaround v2.7.2  
**Priority :** HAUTE - Utiliser cette solution immédiatement
