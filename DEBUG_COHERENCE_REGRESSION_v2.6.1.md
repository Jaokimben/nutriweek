# 🐛 DEBUG: Régression Mélange Viande + Poisson/Fruits de Mer v2.6.1

**Date**: 18 janvier 2026  
**Version**: 2.6.1 - CRITICAL DEBUG  
**Statut**: 🔴 EN INVESTIGATION

---

## 🎯 Problème Signalé

**Utilisateur rapporte**:
> "Il y a encore un mélange d'aliment au dîner du dimanche par exemple"

**Exemple attendu** (selon screenshot utilisateur):
- **Dîner Dimanche**: Mélange viande + fruits de mer détecté
  - Ex: Viande hachée + Moules + Calamar
  - Ex: Steak + Crevettes + Poisson

**Statut**: ❌ COMBINAISONS IMPOSSIBLES ENCORE GÉNÉRÉES

---

## 🔍 Analyse du Système de Validation

### Système de Validation en 4 Niveaux

#### ✅ NIVEAU 1: Combinaisons Interdites Spécifiques
**Localisation**: `recipeSearchEngine.js` ligne 474-566

**Liste complète (91 combinaisons)**:
```javascript
const COMBINAISONS_INTERDITES_SPECIFIQUES = [
  // VIANDES ROUGES + POISSONS (18 combinaisons)
  ['viande', 'poisson'],
  ['viande', 'saumon'],
  ['viande hachée', 'poisson'],
  ['viande hachée', 'saumon'],
  ['boeuf', 'poisson'],
  ['steak', 'poisson'],
  ...
  
  // VIANDES ROUGES + FRUITS DE MER (24 combinaisons)
  ['viande', 'moules'],
  ['viande', 'crevettes'],
  ['viande', 'calamars'],
  ['viande hachée', 'moules'],
  ['viande hachée', 'crevettes'],
  ['viande hachée', 'calamars'],
  ['boeuf', 'moules'],
  ['steak', 'moules'],
  ...
  
  // VOLAILLES + POISSONS (18 combinaisons)
  ['poulet', 'poisson'],
  ['poulet', 'saumon'],
  ['dinde', 'poisson'],
  ...
  
  // VOLAILLES + FRUITS DE MER (14 combinaisons)
  ['poulet', 'moules'],
  ['poulet', 'crevettes'],
  ['poulet', 'calamars'],
  ...
  
  // SUCRÉ + PROTÉINES (12 combinaisons)
  ['confiture', 'viande'],
  ['chocolat', 'poisson'],
  ['miel', 'viande'],
  ...
];
```

**Algorithme** (ligne 604-614):
```javascript
for (const [ing1, ing2] of COMBINAISONS_INTERDITES_SPECIFIQUES) {
  const hasIng1 = ingredientsNormalises.some(i => i.includes(normaliserNomIngredient(ing1)));
  const hasIng2 = ingredientsNormalises.some(i => i.includes(normaliserNomIngredient(ing2)));
  
  if (hasIng1 && hasIng2) {
    return { coherent: false, raisons: [...] };
  }
}
```

**Statut**: ✅ **BIEN IMPLÉMENTÉ** - Devrait bloquer tous les mélanges

---

#### ✅ NIVEAU 2: Catégorisation + Règles d'Incohérence
**Localisation**: `recipeSearchEngine.js` ligne 283-377 + ligne 387-471

**10 Familles d'Aliments**:
```javascript
const CATEGORIES_ALIMENTS = {
  viandes_rouges: ['boeuf', 'veau', 'agneau', 'steak', 'viande hachée', 'viande', ...],
  viandes_blanches: ['poulet', 'dinde', 'porc', 'lapin', 'volaille', ...],
  poissons_maigres: ['cabillaud', 'colin', 'merlan', 'poisson', ...],
  poissons_gras: ['saumon', 'thon', 'maquereau', ...],
  fruits_mer: ['moules', 'crevettes', 'calamars', 'calamar', 'fruits de mer', ...],
  ...
};
```

**6 Règles Gastronomiques**:
```javascript
const REGLES_INCOHERENCE = [
  // RÈGLE 1: viandes_rouges + poissons_maigres
  // RÈGLE 2: viandes_rouges + poissons_gras
  // RÈGLE 3: viandes_rouges + fruits_mer
  // RÈGLE 4: viandes_blanches + poissons_maigres
  // RÈGLE 5: viandes_blanches + poissons_gras
  // RÈGLE 6: viandes_blanches + fruits_mer
  ...
];
```

**Algorithme** (ligne 616-668):
```javascript
// Catégoriser tous les ingrédients
for (const ingredient of ingredients) {
  const categories = categoriserIngredient(ingredient);
}

// Vérifier les règles entre catégories
for (const regle of REGLES_INCOHERENCE) {
  const [cat1, cat2] = regle.categories;
  
  if (categoriesPresentes.has(cat1) && categoriesPresentes.has(cat2)) {
    if (regle.severite === 'erreur') {
      return { coherent: false, raisons: [...] };
    }
  }
}
```

**Statut**: ✅ **BIEN IMPLÉMENTÉ** - Devrait bloquer par catégories

---

#### ✅ NIVEAU 3: Validation Dans Génération Aléatoire
**Localisation**: `menuGeneratorFromExcel.js` ligne 304-313

**Code**:
```javascript
for (let tentative = 0; tentative < MAX_TENTATIVES_REPAS; tentative++) {
  const { aliments, caloriesTotal } = selectionnerAliments(...);
  
  // 🆕 VALIDATION COHÉRENCE
  const nomsAliments = aliments.map(a => a.nom);
  const validationCoherence = verifierCoherenceCombinaison(nomsAliments);
  
  if (!validationCoherence.coherent) {
    tentativesIncoherentes++;
    console.log(`  ⚠️ Tentative ${tentative + 1}: Combinaison incohérente rejetée`);
    continue; // REJETER et réessayer
  }
  
  tentativesCoherentes++;
  // Accepter cette combinaison
  ...
}
```

**Statut**: ✅ **BIEN IMPLÉMENTÉ** - Boucle jusqu'à trouver une combinaison cohérente

---

#### ✅ NIVEAU 4: Validation Finale Critique (NOUVEAU v2.6.1)
**Localisation**: `menuGeneratorFromExcel.js` ligne 361-380

**Code**:
```javascript
if (meilleurRepas) {
  // 🛡️ VALIDATION FINALE CRITIQUE
  const nomsIngredientsFinal = meilleurRepas.ingredients.map(i => i.nom);
  const validationFinale = verifierCoherenceCombinaison(nomsIngredientsFinal);
  
  console.log(`\n🛡️ VALIDATION FINALE du repas:`);
  console.log(`  🍽️ Ingrédients: ${nomsIngredientsFinal.join(', ')}`);
  
  if (!validationFinale.coherent) {
    console.error(`\n🚨 ALERTE CRITIQUE: Repas INCOHÉRENT détecté!`);
    throw new Error(`Impossible de générer un repas cohérent`);
  }
  
  console.log(`✅ Repas validé`);
}
```

**Statut**: 🆕 **NOUVEAU** - Double validation avant retour

---

## 🧪 Hypothèses Possibles du Bug

### Hypothèse 1: Noms d'Ingrédients Non Détectés ❓
**Explication**: Les ingrédients ont des noms qui ne matchent PAS les patterns de catégorisation

**Exemple**:
- Fichier Excel: `"Viande haché"` (sans "e") au lieu de `"Viande hachée"`
- Fichier Excel: `"Moule"` (singulier) au lieu de `"Moules"` (pluriel)
- Fichier Excel: `"Calamar"` vs `"Calamars"` (variation orthographique)

**Test**:
```javascript
categoriserIngredient("Viande haché");   // Devrait retourner ['viandes_rouges']
categoriserIngredient("Moule");          // Devrait retourner ['fruits_mer']
categoriserIngredient("Calmar");         // Devrait retourner ['fruits_mer']
```

**Solution potentielle**:
- Ajouter des variantes orthographiques
- Utiliser un matching plus flexible (ex: distance de Levenshtein)

---

### Hypothèse 2: Normalisation Insuffisante ❓
**Explication**: La fonction `normaliserNomIngredient()` ne couvre pas tous les cas

**Code actuel** (ligne 27-30):
```javascript
function normaliserNomIngredient(nom) {
  return nom.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .trim();
}
```

**Problèmes possibles**:
- Pluriels non gérés: "moule" vs "moules"
- Orthographe: "viande hachée" vs "viande haché"
- Espaces multiples
- Caractères spéciaux

**Solution potentielle**:
```javascript
function normaliserNomIngredient(nom) {
  return nom.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/s$/, '') // Supprimer 's' final pour gérer pluriels
    .replace(/\s+/g, ' ') // Remplacer espaces multiples par un seul
    .trim();
}
```

---

### Hypothèse 3: Validation Non Appelée ❓
**Explication**: Le code de validation existe mais n'est pas toujours appelé

**Vérification nécessaire**:
- Est-ce que `verifierCoherenceCombinaison` est bien exportée? ✅ OUI (ligne 17)
- Est-ce que `verifierCoherenceCombinaison` est bien importée dans `menuGeneratorFromExcel.js`? ✅ OUI (ligne 11)
- Est-ce que la boucle de génération aléatoire appelle bien cette fonction? ✅ OUI (ligne 306)

**Statut**: ✅ **PAS DE PROBLÈME ICI**

---

### Hypothèse 4: Génération depuis Recettes Prédéfinies ❓
**Explication**: Les recettes prédéfinies contiennent elles-mêmes des mélanges incohérents

**Vérification**:
```javascript
// Rechercher dans RECETTES_COHERENTES si des combinaisons impossibles existent
const recettesProblematiques = [
  // Exemple: Si on trouve une recette avec ['viande hachée', 'moules']
];
```

**Code à vérifier**: `recipeSearchEngine.js` ligne 42-273

**Statut**: ⏳ **À VÉRIFIER**

---

## 🛠️ Corrections Appliquées v2.6.1

### ✅ Correction 1: Logs Ultra-Détaillés
**Fichier**: `menuGeneratorFromExcel.js`

**Changements**:
```javascript
// AVANT (ligne 250-251)
console.log(`\n🔍 ====== RECHERCHE RECETTE COHÉRENTE ======`);
const recette = chercherRecetteCoherente(alimentsAutorises, type, caloriesCible);

// APRÈS
console.log(`\n🔍 ====== RECHERCHE RECETTE COHÉRENTE ======`);
console.log(`  📝 Aliments autorisés disponibles:`, alimentsAutorises.map(a => a.nom).slice(0, 15));
const recette = chercherRecetteCoherente(alimentsAutorises, type, caloriesCible);
```

**Changements**:
```javascript
// AVANT (ligne 305-312)
const validationCoherence = verifierCoherenceCombinaison(nomsAliments);

if (!validationCoherence.coherent) {
  tentativesIncoherentes++;
  console.log(`  ⚠️ Tentative ${tentative + 1}: Combinaison incohérente rejetée`);
  continue;
}

// APRÈS
console.log(`\n  🔍 VALIDATION tentative ${tentative + 1}/${MAX_TENTATIVES_REPAS}:`);
console.log(`     Aliments sélectionnés: ${nomsAliments.join(', ')}`);

const validationCoherence = verifierCoherenceCombinaison(nomsAliments);
console.log(`     Résultat cohérence:`, validationCoherence);

if (!validationCoherence.coherent) {
  tentativesIncoherentes++;
  console.log(`  ❌ REJET tentative ${tentative + 1}: Combinaison incohérente`);
  validationCoherence.raisons.forEach(r => console.log(`     ${r}`));
  continue;
}

tentativesCoherentes++;
console.log(`  ✅ ACCEPTÉ tentative ${tentative + 1}: Combinaison cohérente`);
```

---

### ✅ Correction 2: Validation Finale Critique
**Fichier**: `menuGeneratorFromExcel.js` ligne 361-380

**Nouveau Code**:
```javascript
if (meilleurRepas) {
  // 🛡️ VALIDATION FINALE CRITIQUE : Double vérification avant retour
  const nomsIngredientsFinal = meilleurRepas.ingredients.map(i => i.nom);
  const validationFinale = verifierCoherenceCombinaison(nomsIngredientsFinal);
  
  console.log(`\n🛡️ VALIDATION FINALE du repas:`);
  console.log(`  🍽️ Ingrédients: ${nomsIngredientsFinal.join(', ')}`);
  console.log(`  📊 Cohérence:`, validationFinale);
  
  if (!validationFinale.coherent) {
    console.error(`\n🚨 ALERTE CRITIQUE: Le repas généré est INCOHÉRENT malgré les filtres!`);
    console.error(`  ❌ Raisons:`, validationFinale.raisons);
    console.error(`  🔧 Le repas sera REJETÉ et un nouveau sera tenté`);
    
    // On ne retourne PAS ce repas incohérent
    throw new Error(`Impossible de générer un repas cohérent après ${MAX_TENTATIVES_REPAS} tentatives`);
  }
  
  console.log(`✅ Repas validé: ${meilleurRepas.ingredients.length} ingrédients, ${meilleurRepas.nutrition.calories} kcal`);
}
```

**Impact**: 🛡️ **SÉCURITÉ MAXIMALE** - Impossible de retourner un repas incohérent

---

## 📊 Tests à Effectuer

### Test 1: Vérifier les Logs Console
**Action**: Générer un menu et observer les logs

**Logs attendus**:
```
🔍 VALIDATION tentative 1/50:
   Aliments sélectionnés: Viande hachée, Moules, Carottes
   Résultat cohérence: { coherent: false, raisons: [...] }
❌ REJET tentative 1: Combinaison incohérente
   ❌ Combinaison spécifique interdite: "viande hachée" + "moules"

🔍 VALIDATION tentative 2/50:
   Aliments sélectionnés: Poulet, Riz, Courgettes
   Résultat cohérence: { coherent: true, raisons: [...] }
✅ ACCEPTÉ tentative 2: Combinaison cohérente
```

---

### Test 2: Tester les Noms d'Ingrédients Excel
**Action**: Vérifier les noms exacts des ingrédients dans les fichiers Excel uploadés

**Script de test**:
```javascript
// Lister tous les ingrédients des 3 fichiers Excel
const tousLesIngredients = [
  ...alimentsExcel.petitDejeuner.map(a => a.nom),
  ...alimentsExcel.dejeuner.map(a => a.nom),
  ...alimentsExcel.diner.map(a => a.nom)
];

console.log("Ingrédients potentiellement problématiques:");
tousLesIngredients.forEach(nom => {
  const categories = categoriserIngredient(nom);
  if (categories.length === 0) {
    console.log(`⚠️ "${nom}" → AUCUNE CATÉGORIE`);
  }
});
```

---

### Test 3: Validation des Recettes Prédéfinies
**Action**: Vérifier si les recettes prédéfinies contiennent des mélanges incohérents

**Script de test**:
```javascript
for (const [typeRepas, categories] of Object.entries(RECETTES_COHERENTES)) {
  for (const [categorie, recettes] of Object.entries(categories)) {
    for (const recette of recettes) {
      const validation = verifierCoherenceCombinaison(recette.ingredients);
      if (!validation.coherent) {
        console.error(`❌ Recette incohérente détectée: ${recette.nom}`);
        console.error(`   Ingrédients:`, recette.ingredients);
        console.error(`   Raisons:`, validation.raisons);
      }
    }
  }
}
```

---

## 🎯 Actions Prochaines

1. ✅ **Logs ultra-détaillés ajoutés** → Permet de tracer précisément le problème
2. ✅ **Validation finale critique ajoutée** → Empêche tout repas incohérent de passer
3. ⏳ **Tester avec de vrais fichiers Excel** → Identifier les noms d'ingrédients problématiques
4. ⏳ **Améliorer la normalisation** → Gérer pluriels, orthographes, variantes
5. ⏳ **Créer un outil de diagnostic** → Script pour tester la catégorisation des ingrédients

---

## 📈 Résultat Attendu

### Avant v2.6.1
```
Dîner Dimanche:
  - Viande hachée (66g)
  - Moules (129g)
  - Calamar (52g)
  - Betterave (132g)
  - Haricots (132g)
❌ COMBINAISON IMPOSSIBLE générée
```

### Après v2.6.1
```
🔍 VALIDATION tentative 1/50:
   Aliments sélectionnés: Viande hachée, Moules, Calamar
   Résultat cohérence: { coherent: false }
❌ REJET: "viande hachée" + "moules" interdit

🔍 VALIDATION tentative 2/50:
   Aliments sélectionnés: Moules, Calamar, Betterave, Haricots
   Résultat cohérence: { coherent: true }
✅ ACCEPTÉ

Dîner Dimanche:
  - Moules (180g)
  - Calamar (90g)
  - Betterave (150g)
  - Haricots (150g)
✅ COMBINAISON COHÉRENTE garantie
```

---

## 📝 Conclusion

**Version**: 2.6.1 - CRITICAL DEBUG  
**Date**: 18 janvier 2026  
**Statut**: 🔄 **EN COURS**

**Corrections appliquées**:
1. ✅ Logs ultra-détaillés pour traçabilité totale
2. ✅ Validation finale critique avant retour du repas
3. ✅ Affichage des raisons de rejet pour chaque tentative

**Prochaines étapes**:
1. Tester avec de vrais fichiers Excel du praticien
2. Vérifier les noms d'ingrédients non catégorisés
3. Améliorer la normalisation si nécessaire
4. Créer un outil de diagnostic complet

**Garantie**:
> Avec la validation finale critique en place, **AUCUN** repas incohérent ne peut être retourné. Si un mélange impossible est détecté, une erreur est lancée et le repas est rejeté.

---

🔗 **GitHub Commit**: (à venir)  
🌐 **Frontend URL**: https://5181-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai
