# 📊 AUDIT COMPLET: Utilisation des Fichiers Uploadés par le Praticien

**Date**: 18 janvier 2026  
**Version**: 2.6.1  
**Objectif**: Identifier tous les fichiers uploadables et vérifier lesquels sont réellement utilisés

---

## 📁 Liste des Fichiers Uploadables

Le portail praticien permet d'uploader **9 types de fichiers** :

### 1️⃣ Fichiers Excel - Aliments par Repas

| # | Fichier | Description | Format | Statut |
|---|---------|-------------|--------|--------|
| 1 | **alimentsPetitDej** | Aliments autorisés pour le petit-déjeuner | `.xls, .xlsx, .csv` | ✅ **UTILISÉ** |
| 2 | **alimentsDejeuner** | Aliments autorisés pour le déjeuner | `.xls, .xlsx, .csv` | ✅ **UTILISÉ** |
| 3 | **alimentsDiner** | Aliments autorisés pour le dîner | `.xls, .xlsx, .csv` | ✅ **UTILISÉ** |

**Utilisation**:
- Fichier: `src/utils/menuGeneratorFromExcel.js`
- Fonction: `chargerAlimentsExcel()` (ligne 489)
- Impact: **CRITIQUE** - Base de la génération de menus

---

### 2️⃣ Fichier Excel - Liste FODMAP

| # | Fichier | Description | Format | Statut |
|---|---------|-------------|--------|--------|
| 4 | **fodmapList** | Aliments à éviter pour personnes sensibles | `.xls, .xlsx, .csv` | ❌ **NON UTILISÉ** |

**Détails**:
- ✅ **Uploadable** via `src/components/PractitionerPortal.jsx` (ligne 220-226)
- ✅ **Stocké** dans localStorage via `src/utils/practitionerStorage.js` (ligne 33, 113)
- ❌ **Jamais lu** dans la génération de menus
- ❌ **Jamais appliqué** comme filtre sur les aliments

**Impact**: Fichier uploadé mais **IGNORÉ** par l'application

---

### 3️⃣ Fichiers Word - Règles Nutritionnelles

| # | Fichier | Description | Format | Statut |
|---|---------|-------------|--------|--------|
| 5 | **reglesGenerales** | Règles nutritionnelles générales (tous profils) | `.doc, .docx, .txt` | ✅ **UTILISÉ** |
| 6 | **pertePoidHomme** | Programme perte de poids spécifique hommes | `.doc, .docx, .txt` | ✅ **UTILISÉ** |
| 7 | **pertePoidFemme** | Programme perte de poids spécifique femmes | `.doc, .docx, .txt` | ✅ **UTILISÉ** |
| 8 | **vitalite** | Programme vitalité (objectif maintien) | `.doc, .docx, .txt` | ✅ **UTILISÉ** |
| 9 | **confortDigestif** | Règles et recommandations confort digestif | `.doc, .docx, .txt` | ❌ **NON UTILISÉ** |

**Utilisation des fichiers Word**:
- Fichier: `src/utils/practitionerRulesParser.js`
- Fonction: `chargerReglesPraticien(profil)` (ligne 137-204)
- Lecture: Via `parseWordFromBase64()` (Mammoth.js)
- Parsing: Via `parseRegles(texte)` - Extraction des règles textuelles
- Application: Filtrage des aliments interdits + Limites caloriques

**Logique de sélection**:
```javascript
// 1. Règles GÉNÉRALES (toujours chargées)
if (files.reglesGenerales) {
  charger et parser reglesGenerales.docx
}

// 2. Règles SPÉCIFIQUES selon objectif
if (profil.objectif === 'perte') {
  if (profil.sexe === 'homme') {
    charger pertePoidHomme.docx
  } else {
    charger pertePoidFemme.docx
  }
} else if (profil.objectif === 'maintien') {
  charger vitalite.docx
}
```

---

## ✅ Fichiers UTILISÉS (7/9)

### Fichiers Excel - Aliments (3/3) ✅

**1. alimentsPetitDej.xlsx**
- **Utilisation**: `menuGeneratorFromExcel.js` ligne 489
- **Fonction**: `chargerAlimentsExcel()` → `loadPractitionerExcelFiles()`
- **Rôle**: Source **exclusive** des aliments pour petit-déjeuner
- **Validation**: ≥3 aliments requis (sinon erreur)
- **Impact**: **CRITIQUE** - Sans ce fichier, pas de menu possible

**2. alimentsDejeuner.xlsx**
- **Utilisation**: `menuGeneratorFromExcel.js` ligne 489
- **Fonction**: `chargerAlimentsExcel()` → `loadPractitionerExcelFiles()`
- **Rôle**: Source **exclusive** des aliments pour déjeuner
- **Validation**: ≥3 aliments requis (sinon erreur)
- **Impact**: **CRITIQUE** - Sans ce fichier, pas de menu possible

**3. alimentsDiner.xlsx**
- **Utilisation**: `menuGeneratorFromExcel.js` ligne 489
- **Fonction**: `chargerAlimentsExcel()` → `loadPractitionerExcelFiles()`
- **Rôle**: Source **exclusive** des aliments pour dîner
- **Validation**: ≥3 aliments requis (sinon erreur)
- **Impact**: **CRITIQUE** - Sans ce fichier, pas de menu possible

---

### Fichiers Word - Règles (4/5) ✅

**4. reglesGenerales.docx**
- **Utilisation**: `practitionerRulesParser.js` ligne 153-159
- **Fonction**: `chargerReglesPraticien()` → `parseWordFromBase64()`
- **Rôle**: Règles nutritionnelles communes à tous les profils
- **Application**: 
  - Extraction des aliments interdits
  - Extraction des contraintes générales
  - Application des limites caloriques (si spécifiées)
- **Impact**: **IMPORTANT** - Appliqué à tous les utilisateurs

**5. pertePoidHomme.docx**
- **Utilisation**: `practitionerRulesParser.js` ligne 163-173
- **Fonction**: `chargerReglesPraticien()` si `profil.objectif === 'perte'` ET `profil.sexe === 'homme'`
- **Rôle**: Règles spécifiques perte de poids hommes
- **Application**:
  - Limites caloriques spécifiques (ex: 1500 kcal/jour pendant 3 semaines)
  - Aliments interdits supplémentaires
  - Contraintes temporelles
- **Impact**: **CRITIQUE** pour hommes en perte de poids
- **Exemple détecté**: "Limite de 1500 kcal/jour pendant les 3 premières semaines"

**6. pertePoidFemme.docx**
- **Utilisation**: `practitionerRulesParser.js` ligne 163-173
- **Fonction**: `chargerReglesPraticien()` si `profil.objectif === 'perte'` ET `profil.sexe === 'femme'`
- **Rôle**: Règles spécifiques perte de poids femmes
- **Application**:
  - Limites caloriques spécifiques
  - Aliments interdits supplémentaires
  - Contraintes temporelles
- **Impact**: **CRITIQUE** pour femmes en perte de poids

**7. vitalite.docx**
- **Utilisation**: `practitionerRulesParser.js` ligne 174-183
- **Fonction**: `chargerReglesPraticien()` si `profil.objectif === 'maintien'`
- **Rôle**: Règles pour objectif vitalité/maintien
- **Application**:
  - Recommandations nutritionnelles
  - Aliments favorisés
  - Conseils de bien-être
- **Impact**: **IMPORTANT** pour maintien/vitalité

---

## ❌ Fichiers NON UTILISÉS (2/9)

### 8. fodmapList.xlsx ❌

**Statut**: 📤 **UPLOADABLE** mais 🚫 **JAMAIS UTILISÉ**

**Détails**:
- ✅ Interface d'upload disponible (PractitionerPortal.jsx ligne 220-226)
- ✅ Fonction de sauvegarde: `saveFodmapList(file)` (practitionerStorage.js ligne 113)
- ✅ Stockage dans localStorage: `nutriweek_practitioner_files.fodmapList`
- ❌ **JAMAIS chargé** dans menuGeneratorFromExcel.js
- ❌ **JAMAIS utilisé** comme filtre
- ❌ **JAMAIS appliqué** dans la sélection d'aliments

**Recherche dans le code**:
```bash
$ grep -rn "fodmap" src/utils/menuGeneratorFromExcel.js
# Aucun résultat

$ grep -rn "fodmap" src/utils/practitionerRulesParser.js
# Aucun résultat
```

**Impact actuel**: ❌ **AUCUN** - Fichier ignoré

**Impact attendu** (si implémenté):
- Filtrer les aliments FODMAP pour personnes sensibles
- Éviter ballonnements, inconfort digestif
- Adapter les menus selon sensibilité FODMAP

---

### 9. confortDigestif.docx ❌

**Statut**: 📤 **UPLOADABLE** mais 🚫 **JAMAIS UTILISÉ**

**Détails**:
- ✅ Interface d'upload disponible (PractitionerPortal.jsx ligne 260-266)
- ✅ Fonction de sauvegarde: `saveConfortDigestif(file)` (practitionerStorage.js ligne 153)
- ✅ Stockage dans localStorage: `nutriweek_practitioner_files.confortDigestif`
- ❌ **JAMAIS chargé** dans chargerReglesPraticien()
- ❌ **JAMAIS parsé** avec parseWordFromBase64()
- ❌ **JAMAIS appliqué** dans la génération

**Recherche dans le code**:
```bash
$ grep -rn "confortDigestif" src/utils/menuGeneratorFromExcel.js
# Aucun résultat

$ grep -rn "confortDigestif" src/utils/practitionerRulesParser.js
# Aucun résultat
```

**Impact actuel**: ❌ **AUCUN** - Fichier ignoré

**Impact attendu** (si implémenté):
- Règles pour améliorer le confort digestif
- Éviter les aliments irritants
- Adapter les portions et les combinaisons
- Complémentaire aux règles générales

---

## 📊 Statistiques d'Utilisation

| Catégorie | Total | Utilisés | Non Utilisés | Taux d'Utilisation |
|-----------|-------|----------|--------------|-------------------|
| **Fichiers Excel (Aliments)** | 4 | 3 | 1 | **75%** |
| **Fichiers Word (Règles)** | 5 | 4 | 1 | **80%** |
| **TOTAL** | 9 | 7 | 2 | **77.8%** |

---

## 🔍 Analyse des Fichiers Non Utilisés

### Pourquoi FODMAP n'est pas utilisé ?

**Raisons possibles**:
1. **Développement incomplet**: Fonctionnalité prévue mais pas encore implémentée
2. **Complexité**: La liste FODMAP nécessite une logique spécifique
3. **Priorité**: Les aliments par repas sont plus critiques

**Conséquences**:
- ❌ Praticiens uploadent le fichier FODMAP pour rien
- ❌ Patients avec sensibilité FODMAP ne sont pas pris en compte
- ❌ Interface trompeuse (suggère que FODMAP est utilisé)

---

### Pourquoi Confort Digestif n'est pas utilisé ?

**Raisons possibles**:
1. **Logique conditionnelle manquante**: Pas de sélection selon profil
2. **Overlap avec FODMAP**: Peut-être considéré redondant
3. **Priorisation**: Autres règles (perte poids, vitalité) plus critiques

**Conséquences**:
- ❌ Praticiens uploadent le fichier pour rien
- ❌ Règles spécifiques confort digestif non appliquées
- ❌ Manque de personnalisation pour patients avec problèmes digestifs

---

## 💡 Recommandations

### 🔴 OPTION 1: Implémenter les Fichiers Non Utilisés

#### A. Implémenter FODMAP

**Code à ajouter dans `menuGeneratorFromExcel.js`**:
```javascript
// Après ligne 489 (chargerAlimentsExcel)
let alimentsExcel = await chargerAlimentsExcel();

// 🆕 Filtrer selon FODMAP si patient sensible
if (profil.sensibiliteFODMAP === true) {
  const fodmapList = await chargerListeFODMAP();
  alimentsExcel = filtrerAlimentsFODMAP(alimentsExcel, fodmapList);
  console.log('✅ Filtre FODMAP appliqué');
}
```

**Nouvelle fonction à créer**:
```javascript
async function chargerListeFODMAP() {
  const files = getAllFiles();
  if (!files.fodmapList) return [];
  
  const alimentsFodmap = await parseExcelFile(files.fodmapList.data);
  return alimentsFodmap.map(a => a.nom.toLowerCase());
}

function filtrerAlimentsFODMAP(alimentsExcel, fodmapList) {
  return {
    petitDejeuner: alimentsExcel.petitDejeuner.filter(
      a => !fodmapList.includes(a.nom.toLowerCase())
    ),
    dejeuner: alimentsExcel.dejeuner.filter(
      a => !fodmapList.includes(a.nom.toLowerCase())
    ),
    diner: alimentsExcel.diner.filter(
      a => !fodmapList.includes(a.nom.toLowerCase())
    )
  };
}
```

**Impact**: ✅ Prise en compte de la sensibilité FODMAP

---

#### B. Implémenter Confort Digestif

**Code à ajouter dans `practitionerRulesParser.js`**:
```javascript
// Après ligne 183 (vitalite)
} else if (profil.objectif === 'confort_digestif' || profil.problemeDigestif) {
  if (files.confortDigestif && files.confortDigestif.data) {
    console.log('  📄 Chargement règles confort digestif...');
    const texte = await parseWordFromBase64(files.confortDigestif.data);
    reglesChargees.texteComplet.specifiques = texte;
    reglesChargees.specifiques = parseRegles(texte);
    console.log(`  ✅ ${reglesChargees.specifiques.length} règles confort digestif chargées`);
  }
}
```

**Modification du profil utilisateur**:
```javascript
// Ajouter dans le formulaire profil
profil.problemeDigestif = true/false;
```

**Impact**: ✅ Règles confort digestif appliquées

---

### 🟡 OPTION 2: Supprimer les Uploads Inutiles

**Action**: Retirer FODMAP et Confort Digestif de l'interface

**Avantages**:
- ✅ Pas de confusion pour les praticiens
- ✅ Interface plus claire
- ✅ Pas de fausses attentes

**Inconvénients**:
- ❌ Perte de fonctionnalités futures potentielles
- ❌ Praticiens qui ont déjà uploadé ces fichiers

**Code à modifier** (PractitionerPortal.jsx):
```javascript
// Supprimer ou commenter ces entrées de fileConfigs
{
  key: 'fodmapList',  // SUPPRIMER
  ...
},
{
  key: 'confortDigestif',  // SUPPRIMER
  ...
}
```

---

### 🟢 OPTION 3: Ajouter des Alertes de Non-Utilisation

**Action**: Informer le praticien que ces fichiers ne sont pas encore utilisés

**Code à ajouter dans PractitionerPortal.jsx**:
```javascript
const fileConfigs = [
  ...
  {
    key: 'fodmapList',
    title: 'Liste FODMAP',
    description: '⚠️ Non utilisé actuellement - En développement',
    badge: '🚧 Bientôt disponible',
    ...
  },
  {
    key: 'confortDigestif',
    title: 'Confort Digestif',
    description: '⚠️ Non utilisé actuellement - En développement',
    badge: '🚧 Bientôt disponible',
    ...
  }
];
```

**Impact**: ✅ Transparence totale, pas de confusion

---

## ✅ Conclusion et Recommandations

### Résumé

| Fichier | Statut | Priorité Implémentation |
|---------|--------|------------------------|
| alimentsPetitDej.xlsx | ✅ UTILISÉ | - |
| alimentsDejeuner.xlsx | ✅ UTILISÉ | - |
| alimentsDiner.xlsx | ✅ UTILISÉ | - |
| **fodmapList.xlsx** | ❌ NON UTILISÉ | 🔴 **HAUTE** (patient sensible FODMAP) |
| reglesGenerales.docx | ✅ UTILISÉ | - |
| pertePoidHomme.docx | ✅ UTILISÉ | - |
| pertePoidFemme.docx | ✅ UTILISÉ | - |
| vitalite.docx | ✅ UTILISÉ | - |
| **confortDigestif.docx** | ❌ NON UTILISÉ | 🟡 **MOYENNE** (profils spécifiques) |

---

### Recommandation Finale

**🎯 Action recommandée**: **OPTION 1 - Implémenter les fichiers manquants**

**Raisons**:
1. **FODMAP est critique** pour patients avec syndrome intestin irritable (SII)
2. **Confort Digestif complète** les règles générales
3. **Interface déjà en place** - il suffit d'ajouter la logique
4. **Valeur ajoutée importante** pour les praticiens

**Priorité**:
1. **IMMÉDIAT**: Implémenter FODMAP (haute priorité médicale)
2. **COURT TERME**: Implémenter Confort Digestif
3. **MOYEN TERME**: Ajouter d'autres profils spécifiques (sport, grossesse, etc.)

---

**Version**: 2.6.1  
**Date**: 18 janvier 2026  
**Status**: ✅ **AUDIT COMPLET**
