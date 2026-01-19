# 📧 GUIDE DE RÉCUPÉRATION DES FICHIERS PRATICIEN

## 🎯 Objectif

Vérifier si des fichiers ont été uploadés via le portail praticien et les récupérer pour envoi par email à `joakimben1234@gmail.com`.

---

## ❌ Limitation Technique

### **Pourquoi je ne peux pas accéder directement ?**

Les fichiers sont stockés dans le **LocalStorage du navigateur** (côté client), pas sur un serveur. C'est comme un coffre-fort dans votre ordinateur - je ne peux pas l'ouvrir à distance.

**Avantages de ce système:**
- ✅ Sécurité et confidentialité
- ✅ Pas de coût serveur
- ✅ Instantané et rapide

**Inconvénient:**
- ❌ Pas d'accès distant

---

## ✅ SOLUTION 1: Vérification Manuelle (Recommandée)

### **Étape par Étape (2 minutes)**

#### **1. Ouvrir le Site**
```
https://5181-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/practitioner
```

#### **2. Ouvrir la Console Développeur**

**Windows/Linux:**
- Appuyer sur `F12`
- OU `Ctrl + Shift + I`

**Mac:**
- Appuyer sur `Cmd + Option + I`

#### **3. Aller dans l'Onglet "Application"**

```
Console Développeur
  ↓
Onglet "Application" (Chrome/Edge)
  OU
Onglet "Stockage" (Firefox)
  OU
Onglet "Storage" (Safari)
```

#### **4. Naviguer vers Local Storage**

```
Application
  └── Storage
      └── Local Storage
          └── https://5181-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai
```

#### **5. Chercher la Clé**

Chercher cette clé dans la liste:
```
nutriweek_practitioner_files
```

#### **6. Interpréter le Résultat**

**Cas A: La clé existe** ✅
```
nutriweek_practitioner_files: {...}
```
→ **Des fichiers ont été uploadés !**
→ Passer à l'étape 7

**Cas B: La clé n'existe pas** ❌
```
(vide ou clé absente)
```
→ **Aucun fichier uploadé**
→ Le portail n'a pas encore été utilisé

#### **7. Voir le Contenu (si la clé existe)**

Cliquer sur la clé `nutriweek_practitioner_files` pour voir:
```json
{
  "alimentsPetitDej": {
    "name": "petit_dej.xlsx",
    "size": 245678,
    "type": "application/vnd.openxmlformats...",
    "uploadedAt": "2025-12-31T15:00:00.000Z"
  },
  "alimentsDejeuner": { ... },
  "alimentsDiner": { ... },
  "fodmapList": { ... },
  // ...
  "metadata": {
    "useUploadedFiles": true,
    "lastUpdated": "2025-12-31T15:00:00.000Z"
  }
}
```

---

## ✅ SOLUTION 2: Export Automatique (Facile) 📤

### **Si des fichiers ont été uploadés:**

#### **Méthode A: Via le Portail (Interface)**

1. **Aller au Portail Praticien**
   ```
   https://5181-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/practitioner
   ```

2. **Descendre en bas de la page**

3. **Cliquer sur le bouton:**
   ```
   📤 Exporter Tous les Fichiers
   ```

4. **Un fichier JSON est téléchargé**
   ```
   nutriweek_practitioner_files_2025-12-31.json
   ```

5. **Envoyer ce fichier par email**
   - À: `joakimben1234@gmail.com`
   - Objet: "Fichiers Portail Praticien NutriWeek"
   - Pièce jointe: Le fichier JSON

---

## ✅ SOLUTION 3: Script d'Extraction (Avancée) 🔧

### **Pour les utilisateurs avancés:**

#### **Étapes:**

1. **Ouvrir le Site**
   ```
   https://5181-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/practitioner
   ```

2. **Ouvrir la Console (F12)**
   - Aller dans l'onglet "Console"

3. **Copier le Script**
   - Ouvrir le fichier: `extract_practitioner_files.js`
   - Copier tout le contenu

4. **Coller dans la Console**
   - Coller le script
   - Appuyer sur `Entrée`

5. **Voir le Rapport**
   ```
   ==============================================
   📂 EXTRACTION DES FICHIERS PRATICIEN
   ==============================================

   ✅ FICHIERS TROUVÉS!

   ==============================================
   📊 RÉSUMÉ DES FICHIERS
   ==============================================

   🌅 Excel Petit-Déjeuner
      Nom: petit_dej.xlsx
      Taille: 240 KB
      Type: application/vnd.openxmlformats...
      Uploadé: 31/12/2025 à 15:00:00

   🍽️ Excel Déjeuner
      Nom: dejeuner.xlsx
      Taille: 305 KB
      ...

   ==============================================
   📈 STATISTIQUES GLOBALES
   ==============================================

   Nombre de fichiers: 6
   Taille totale: 1.8 MB
   Capacité max: 5 MB
   Pourcentage utilisé: 36%
   ```

6. **Exporter depuis la Console**
   - Taper dans la console:
   ```javascript
   exportFiles()
   ```
   - Un fichier JSON est téléchargé automatiquement

7. **Envoyer par Email**
   - Envoyer le JSON à: `joakimben1234@gmail.com`

---

## 📋 Template d'Email

### **Si vous trouvez des fichiers:**

```
À: joakimben1234@gmail.com
Objet: Fichiers Portail Praticien NutriWeek

Bonjour,

J'ai exporté les fichiers uploadés via le portail praticien de NutriWeek.

Informations:
- Nombre de fichiers: [X]
- Taille totale: [X] MB
- Date d'upload: [Date]
- Fichiers activés: [Oui/Non]

Liste des fichiers:
- 🌅 Excel Petit-Déjeuner: [nom_fichier.xlsx]
- 🍽️ Excel Déjeuner: [nom_fichier.xlsx]
- 🌙 Excel Dîner: [nom_fichier.xlsx]
- 🚫 Liste FODMAP: [nom_fichier.txt]
- (etc.)

Le fichier JSON complet est en pièce jointe.

Cordialement
```

### **Si aucun fichier trouvé:**

```
À: joakimben1234@gmail.com
Objet: Portail Praticien NutriWeek - Aucun Fichier

Bonjour,

J'ai vérifié le portail praticien de NutriWeek.

Résultat: Aucun fichier n'a encore été uploadé.

Le portail n'a pas encore été utilisé pour uploader des fichiers Excel, FODMAP ou Word.

Cordialement
```

---

## 🔍 Fichier Script d'Extraction

Le script complet est disponible dans:
```
/home/user/webapp/extract_practitioner_files.js
```

**Contenu:**
- ✅ Détecte les fichiers uploadés
- ✅ Affiche un rapport détaillé
- ✅ Calcule les statistiques
- ✅ Permet l'export automatique
- ✅ Génère une liste pour email

---

## 📊 Que Contient le Fichier JSON Exporté ?

### **Structure:**

```json
{
  "alimentsPetitDej": {
    "name": "petit_dej.xlsx",
    "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "size": 245678,
    "data": "data:application/...;base64,UEsDBBQABgAIA...",
    "uploadedAt": "2025-12-31T15:00:00.000Z"
  },
  "alimentsDejeuner": { ... },
  "alimentsDiner": { ... },
  "fodmapList": { ... },
  "reglesGenerales": { ... },
  "pertePoidHomme": { ... },
  "pertePoidFemme": { ... },
  "vitalite": { ... },
  "metadata": {
    "useUploadedFiles": true,
    "lastUpdated": "2025-12-31T15:00:00.000Z"
  }
}
```

### **Données Incluses:**

Pour chaque fichier:
- ✅ **name**: Nom du fichier original
- ✅ **type**: Type MIME du fichier
- ✅ **size**: Taille en octets
- ✅ **data**: Contenu du fichier en Base64
- ✅ **uploadedAt**: Date et heure d'upload

### **Utilisation du JSON:**

Avec ce fichier JSON, vous pouvez:
1. ✅ Voir quels fichiers ont été uploadés
2. ✅ Extraire les fichiers originaux (décoder Base64)
3. ✅ Réimporter les fichiers dans un autre navigateur
4. ✅ Faire un backup des données praticien

---

## 🚀 Étapes Recommandées

### **Ordre d'Actions:**

1. ✅ **Vérifier** (Solution 1)
   - Ouvrir le site
   - Ouvrir les outils développeur
   - Vérifier si la clé existe

2. ✅ **Exporter** (Solution 2)
   - Si fichiers trouvés
   - Cliquer sur "📤 Exporter Tous"
   - Télécharger le JSON

3. ✅ **Envoyer**
   - Email à: `joakimben1234@gmail.com`
   - Joindre le fichier JSON
   - Utiliser le template ci-dessus

---

## ⏱️ Temps Estimé

- **Vérification manuelle**: 2-3 minutes
- **Export + Email**: 2-3 minutes
- **Total**: ~5 minutes maximum

---

## 🆘 En Cas de Problème

### **Problème 1: Clé introuvable**
→ Aucun fichier n'a été uploadé encore

### **Problème 2: Erreur lors de l'export**
→ Utiliser le script d'extraction (Solution 3)

### **Problème 3: Fichier JSON trop gros pour email**
→ Utiliser WeTransfer ou Google Drive pour partager

---

## 📝 Notes Importantes

1. ✅ Les fichiers sont **stockés localement** dans votre navigateur
2. ✅ Ils **persistent** même après déconnexion
3. ✅ Ils ne s'effacent que si vous les supprimez
4. ✅ Chaque navigateur a son propre stockage
5. ⚠️ Si vous changez de navigateur, les fichiers ne suivent pas

---

## ✅ Résumé des Solutions

| Solution | Difficulté | Temps | Résultat |
|----------|-----------|-------|----------|
| Solution 1: Vérification Manuelle | ⭐ Facile | 2 min | Voir si fichiers existent |
| Solution 2: Export via Portail | ⭐⭐ Facile | 2 min | Télécharger JSON complet |
| Solution 3: Script Extraction | ⭐⭐⭐ Avancé | 3 min | Rapport détaillé + Export |

**Recommandation**: Commencer par Solution 1, puis Solution 2 si fichiers trouvés.

---

**🎯 OBJECTIF FINAL:**

Obtenir le fichier JSON et l'envoyer à `joakimben1234@gmail.com` pour analyse des fichiers uploadés par les praticiens.

---

*Guide créé le 2025-12-31*  
*NutriWeek - Portail Praticien*
