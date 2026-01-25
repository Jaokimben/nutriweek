# 🐛 Bug Fix: Erreur "Cannot read properties of undefined (reading 'Lundi')"

**Date**: 2026-01-18
**Version**: 2.4.4
**Bug**: Impossible de générer le menu - erreur lors de la transformation

---

## 📋 Problème

**Erreur**: `Cannot read properties of undefined (reading 'Lundi')`

**Contexte**: Après implémentation de la validation stricte du genre et du module BMR Calculator, la génération de menu échouait avec cette erreur.

### Cause Racine

**Incohérence de format** entre le générateur Excel et la fonction de transformation.

#### Format Attendu par `transformerMenuPourAffichage()`

```javascript
{
  menu: {
    Lundi: { repas: [...], totaux: {...} },
    Mardi: { repas: [...], totaux: {...} },
    ...
  },
  metadata: {...}
}
```

#### Format Retourné par le Générateur Excel

```javascript
{
  semaine: [
    { jour: "Lundi", date: "...", menu: {...}, totaux: {...} },
    { jour: "Mardi", date: "...", menu: {...}, totaux: {...} },
    ...
  ],
  metadata: {...}
}
```

**Résultat**: `menu[jour]` était `undefined` car `menu` n'existait pas dans le format Excel.

---

## 🔍 Diagnostic Détaillé

### 1. **Structure de Données Incohérente**

**Dans `transformerMenuPourAffichage()` (AVANT)**:
```javascript
function transformerMenuPourAffichage(menuData) {
  const { menu, metadata } = menuData  // ❌ menu n'existe pas dans le format Excel
  const jours = ['Lundi', 'Mardi', ...]
  
  const semaine = jours.map((jour, index) => {
    const jourData = menu[jour]  // ❌ undefined - ERREUR !
    // ...
  })
}
```

**Générateur Excel retourne**:
```javascript
return {
  semaine: [...],  // ✅ Array avec les jours
  metadata: {...}
}
// Pas de propriété "menu" !
```

### 2. **Structure Interne du Jour Redondante**

**Dans le générateur Excel (AVANT)**:
```javascript
semaine.push({
  jour: jourNom,
  date: date.toLocaleDateString('fr-FR'),
  jeune: profil.jeuneIntermittent,
  menu: menuJour,           // Contient { petitDejeuner, dejeuner, diner, totaux }
  totaux: menuJour.totaux   // ❌ DOUBLON - totaux est déjà dans menu
});
```

**Problème**: `totaux` était présent à la fois dans:
- `jour.menu.totaux`
- `jour.totaux`

---

## ✅ Solutions Implémentées

### 1. **Détection Automatique du Format**

**Nouveau code dans `transformerMenuPourAffichage()`**:

```javascript
function transformerMenuPourAffichage(menuData) {
  console.log('🔄 [transformerMenuPourAffichage] Transformation du menu:', menuData)
  
  let semaine
  const { metadata } = menuData
  
  if (menuData.semaine && Array.isArray(menuData.semaine)) {
    // ✅ FORMAT EXCEL: { semaine: [...], metadata: {...} }
    console.log('✅ Format Excel détecté (semaine array)')
    semaine = menuData.semaine.map((jour) => {
      return {
        jour: jour.jour,
        date: jour.date,
        jeune: jour.jeune || false,
        menu: {
          petitDejeuner: jour.menu.petitDejeuner ? transformerRepasPourAffichage(jour.menu.petitDejeuner) : null,
          dejeuner: jour.menu.dejeuner ? transformerRepasPourAffichage(jour.menu.dejeuner) : null,
          diner: jour.menu.diner ? transformerRepasPourAffichage(jour.menu.diner) : null
        },
        totaux: jour.totaux
      }
    })
  } else if (menuData.menu) {
    // ✅ FORMAT CLASSIQUE: { menu: { Lundi: {...}, ... }, metadata: {...} }
    console.log('✅ Format classique détecté (menu object)')
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    const { menu } = menuData
    
    semaine = jours.map((jour, index) => {
      const jourData = menu[jour]
      const date = new Date()
      date.setDate(date.getDate() + index)
      
      return {
        jour,
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
        jeune: false,
        menu: {
          petitDejeuner: transformerRepasPourAffichage(jourData.repas.find(r => r.type === 'petit_dejeuner')),
          dejeuner: transformerRepasPourAffichage(jourData.repas.find(r => r.type === 'dejeuner')),
          diner: transformerRepasPourAffichage(jourData.repas.find(r => r.type === 'diner'))
        },
        totaux: jourData.totaux
      }
    })
  } else {
    // ❌ FORMAT NON RECONNU
    console.error('❌ Format de menu non reconnu:', menuData)
    throw new Error('Format de menu non reconnu. Attendu: { menu: {...} } ou { semaine: [...] }')
  }
  
  return {
    semaine,
    nutritionNeeds: { ... },
    conseils: [ ... ],
    rawMenu: menuData.menu || menuData.semaine,
    metadata
  }
}
```

**Avantages**:
- ✅ Supporte les **deux formats** (Excel et classique)
- ✅ Détection automatique
- ✅ Logs détaillés pour diagnostic
- ✅ Erreur claire si format inconnu

### 2. **Suppression de la Redondance `totaux`**

**Dans le générateur Excel (APRÈS)**:

```javascript
// Calculer la date
const date = new Date();
date.setDate(date.getDate() + i);

// ✅ Extraire les repas SANS le champ totaux
const { totaux, ...repasSeuls } = menuJour;

semaine.push({
  jour: jourNom,
  date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
  jeune: profil.jeuneIntermittent,
  menu: repasSeuls,  // ✅ Uniquement { petitDejeuner, dejeuner, diner }
  totaux: totaux      // ✅ totaux à part
});

console.log(`✅ ${jourNom} généré: ${totaux.calories} kcal`);
```

**Avant**:
```javascript
{
  jour: "Lundi",
  menu: {
    petitDejeuner: {...},
    dejeuner: {...},
    diner: {...},
    totaux: {...}  // ❌ DOUBLON
  },
  totaux: {...}    // ❌ DOUBLON
}
```

**Après**:
```javascript
{
  jour: "Lundi",
  menu: {
    petitDejeuner: {...},
    dejeuner: {...},
    diner: {...}
    // ✅ Pas de totaux ici
  },
  totaux: {...}  // ✅ totaux uniquement ici
}
```

### 3. **Format de Date Harmonisé**

**Avant**:
```javascript
date: date.toLocaleDateString('fr-FR')  // Format court: "18/01/2026"
```

**Après**:
```javascript
date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
// Format long: "18 janvier"
```

**Raison**: Harmonisation avec le format classique pour uniformité de l'affichage.

---

## 🧪 Tests de Vérification

### Test 1: Génération avec Fichiers Excel

**Actions**:
1. Uploader fichiers Excel (Petit-déjeuner, Déjeuner, Dîner)
2. Compléter le questionnaire avec genre sélectionné
3. Générer le menu

**Logs Attendus**:
```
🔄 [transformerMenuPourAffichage] Transformation du menu: { semaine: [...], metadata: {...} }
✅ Format Excel détecté (semaine array)
```

**Résultat**: ✅ Menu généré avec succès

### Test 2: Génération sans Fichiers Excel

**Actions**:
1. Ne pas uploader de fichiers Excel
2. Compléter le questionnaire
3. Tenter de générer le menu

**Résultat Attendu**: 
```
❌ Erreur: Aucun fichier Excel uploadé. Le praticien doit d'abord uploader les aliments autorisés.
```

### Test 3: Vérification Structure

**Vérifier dans la console**:
```javascript
console.log(weeklyMenu)
```

**Structure Attendue**:
```javascript
{
  semaine: [
    {
      jour: "Lundi",
      date: "18 janvier",
      jeune: false,
      menu: {
        petitDejeuner: { nom, moment, calories, proteines, glucides, lipides, ingredients },
        dejeuner: { ... },
        diner: { ... }
      },
      totaux: { calories, proteines, glucides, lipides }
    },
    // ... autres jours
  ],
  nutritionNeeds: { bmr, tdee, dailyCalories, macros, macroRatio },
  conseils: [...],
  rawMenu: [...],
  metadata: {...}
}
```

---

## 📊 Résultats

### Avant

| Aspect | État |
|--------|------|
| Génération menu | ❌ Erreur "Cannot read properties of undefined" |
| Format Excel | ❌ Non supporté |
| Format classique | ✅ Fonctionnel |
| Logs diagnostic | ❌ Absents |
| Structure jour | ❌ Redondance totaux |

### Après

| Aspect | État |
|--------|------|
| Génération menu | ✅ Fonctionne |
| Format Excel | ✅ **Supporté** |
| Format classique | ✅ Fonctionnel |
| Logs diagnostic | ✅ Détaillés |
| Structure jour | ✅ Propre (pas de doublon) |

---

## 🎯 Garanties

1. ✅ **Support Multi-Format**: La fonction de transformation détecte et gère automatiquement les deux formats
2. ✅ **Pas de Régression**: Le format classique continue de fonctionner
3. ✅ **Logs Détaillés**: Traçabilité du format détecté
4. ✅ **Structure Propre**: Suppression de la redondance `totaux`
5. ✅ **Format Date Uniforme**: Harmonisation du format de date
6. ✅ **Erreur Claire**: Message explicite si format inconnu

---

## 📝 Fichiers Modifiés

### 1. `/src/components/WeeklyMenu.jsx`
- ✅ Détection automatique du format (Excel vs classique)
- ✅ Gestion des deux formats dans `transformerMenuPourAffichage()`
- ✅ Logs détaillés pour diagnostic
- ✅ Erreur explicite si format non reconnu

### 2. `/src/utils/menuGeneratorFromExcel.js`
- ✅ Suppression de la redondance `totaux` dans la structure jour
- ✅ Format de date harmonisé
- ✅ Logs améliorés

---

## 🚀 Version

- **Version**: 2.4.4 - Bug Fix: Format Menu Excel
- **Date**: 2026-01-18
- **Status**: ✅ **Production Ready**
- **Branche**: `develop`

---

## ✅ Conclusion

Le bug **"Cannot read properties of undefined (reading 'Lundi')"** a été **complètement résolu**.

**Cause**: Incohérence de format entre générateur Excel et fonction de transformation

**Solution**: Détection automatique et support des deux formats

**Résultat**: 
- ✅ Génération de menu fonctionnelle avec fichiers Excel
- ✅ Pas de régression sur le format classique
- ✅ Code plus robuste et maintenable
- ✅ Logs détaillés pour diagnostic

---

**🎉 Version 2.4.4 - Bug Fix: Format Menu Excel - Production Ready**
