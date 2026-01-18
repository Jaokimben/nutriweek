/**
 * 🧪 TEST DE DIAGNOSTIC: Validation Cohérence Culinaire
 * 
 * Ce script teste le système de validation de cohérence des aliments
 * pour identifier les problèmes potentiels de catégorisation
 */

// Import des fonctions (à adapter selon l'environnement)
import { categoriserIngredient, verifierCoherenceCombinaison } from '../src/utils/recipeSearchEngine.js';

console.log(`
╔══════════════════════════════════════════════════════════════╗
║   🧪 DIAGNOSTIC SYSTÈME DE COHÉRENCE CULINAIRE v2.6.1       ║
╚══════════════════════════════════════════════════════════════╝
`);

// ========================================
// TEST 1: Combinaisons INTERDITES
// ========================================

console.log(`\n${'='.repeat(60)}`);
console.log(`TEST 1: Validation des Combinaisons INTERDITES`);
console.log('='.repeat(60));

const combinaisonsInterdites = [
  {
    nom: "Viande hachée + Moules",
    ingredients: ["Viande hachée", "Moules", "Carottes"],
    attendu: false,
    raison: "Viande rouge + fruits de mer"
  },
  {
    nom: "Steak + Crevettes",
    ingredients: ["Steak", "Crevettes", "Haricots verts"],
    attendu: false,
    raison: "Viande rouge + fruits de mer"
  },
  {
    nom: "Poulet + Saumon",
    ingredients: ["Poulet", "Saumon", "Riz"],
    attendu: false,
    raison: "Volaille + poisson"
  },
  {
    nom: "Boeuf + Cabillaud",
    ingredients: ["Boeuf", "Cabillaud", "Pommes de terre"],
    attendu: false,
    raison: "Viande rouge + poisson"
  },
  {
    nom: "Viande + Poisson (termes génériques)",
    ingredients: ["Viande", "Poisson", "Légumes"],
    attendu: false,
    raison: "Termes génériques viande + poisson"
  },
  {
    nom: "Confiture + Viande",
    ingredients: ["Pain", "Confiture", "Viande hachée"],
    attendu: false,
    raison: "Sucré + salé inapproprié"
  },
  {
    nom: "Chocolat + Poulet",
    ingredients: ["Chocolat", "Poulet", "Riz"],
    attendu: false,
    raison: "Sucré + salé inapproprié"
  }
];

let testsPassesInterdits = 0;
let testsEchouesInterdits = 0;

for (const test of combinaisonsInterdites) {
  console.log(`\n📋 Test: ${test.nom}`);
  console.log(`   Ingrédients: ${test.ingredients.join(', ')}`);
  console.log(`   Attendu: ${test.attendu ? '✅ AUTORISÉ' : '❌ INTERDIT'}`);
  console.log(`   Raison: ${test.raison}`);
  
  const resultat = verifierCoherenceCombinaison(test.ingredients);
  console.log(`   Résultat: coherent=${resultat.coherent}`);
  
  if (resultat.coherent === test.attendu) {
    console.log(`   ✅ TEST RÉUSSI`);
    testsPassesInterdits++;
  } else {
    console.log(`   ❌ TEST ÉCHOUÉ`);
    console.log(`   📊 Raisons retournées:`, resultat.raisons);
    testsEchouesInterdits++;
  }
}

console.log(`\n📊 Résultats Tests Interdits:`);
console.log(`   ✅ Réussis: ${testsPassesInterdits}/${combinaisonsInterdites.length}`);
console.log(`   ❌ Échoués: ${testsEchouesInterdits}/${combinaisonsInterdites.length}`);
console.log(`   📈 Taux de réussite: ${((testsPassesInterdits / combinaisonsInterdites.length) * 100).toFixed(1)}%`);

// ========================================
// TEST 2: Combinaisons AUTORISÉES
// ========================================

console.log(`\n${'='.repeat(60)}`);
console.log(`TEST 2: Validation des Combinaisons AUTORISÉES`);
console.log('='.repeat(60));

const combinaisonsAutorisees = [
  {
    nom: "Poulet + Légumes",
    ingredients: ["Poulet", "Carottes", "Courgettes", "Huile d'olive"],
    attendu: true,
    raison: "Volaille + légumes = OK"
  },
  {
    nom: "Saumon + Légumes",
    ingredients: ["Saumon", "Brocoli", "Carottes", "Citron"],
    attendu: true,
    raison: "Poisson + légumes = OK"
  },
  {
    nom: "Boeuf + Légumes",
    ingredients: ["Boeuf", "Haricots verts", "Pommes de terre"],
    attendu: true,
    raison: "Viande rouge + légumes = OK"
  },
  {
    nom: "Oeufs + Pain + Beurre",
    ingredients: ["Oeufs", "Pain", "Beurre"],
    attendu: true,
    raison: "Petit-déjeuner classique = OK"
  },
  {
    nom: "Pâtes + Viande hachée",
    ingredients: ["Pâtes", "Viande hachée", "Tomates", "Oignons"],
    attendu: true,
    raison: "Pâtes bolognaise = OK"
  },
  {
    nom: "Moules + Frites",
    ingredients: ["Moules", "Pommes de terre", "Huile"],
    attendu: true,
    raison: "Moules-frites classique = OK"
  },
  {
    nom: "Salade de Crevettes",
    ingredients: ["Crevettes", "Salade", "Tomates", "Concombre"],
    attendu: true,
    raison: "Fruits de mer + légumes = OK"
  }
];

let testsPassesAutorises = 0;
let testsEchouesAutorises = 0;

for (const test of combinaisonsAutorisees) {
  console.log(`\n📋 Test: ${test.nom}`);
  console.log(`   Ingrédients: ${test.ingredients.join(', ')}`);
  console.log(`   Attendu: ${test.attendu ? '✅ AUTORISÉ' : '❌ INTERDIT'}`);
  console.log(`   Raison: ${test.raison}`);
  
  const resultat = verifierCoherenceCombinaison(test.ingredients);
  console.log(`   Résultat: coherent=${resultat.coherent}`);
  
  if (resultat.coherent === test.attendu) {
    console.log(`   ✅ TEST RÉUSSI`);
    testsPassesAutorises++;
  } else {
    console.log(`   ❌ TEST ÉCHOUÉ`);
    console.log(`   📊 Raisons retournées:`, resultat.raisons);
    testsEchouesAutorises++;
  }
}

console.log(`\n📊 Résultats Tests Autorisés:`);
console.log(`   ✅ Réussis: ${testsPassesAutorises}/${combinaisonsAutorisees.length}`);
console.log(`   ❌ Échoués: ${testsEchouesAutorises}/${combinaisonsAutorisees.length}`);
console.log(`   📈 Taux de réussite: ${((testsPassesAutorises / combinaisonsAutorisees.length) * 100).toFixed(1)}%`);

// ========================================
// TEST 3: Catégorisation des Ingrédients
// ========================================

console.log(`\n${'='.repeat(60)}`);
console.log(`TEST 3: Catégorisation des Ingrédients`);
console.log('='.repeat(60));

const ingredientsATest = [
  // Viandes rouges
  { nom: "Viande", categoriesAttendues: ['viandes_rouges'] },
  { nom: "Viande hachée", categoriesAttendues: ['viandes_rouges'] },
  { nom: "Boeuf", categoriesAttendues: ['viandes_rouges'] },
  { nom: "Steak", categoriesAttendues: ['viandes_rouges'] },
  { nom: "Veau", categoriesAttendues: ['viandes_rouges'] },
  
  // Viandes blanches
  { nom: "Poulet", categoriesAttendues: ['viandes_blanches'] },
  { nom: "Dinde", categoriesAttendues: ['viandes_blanches'] },
  { nom: "Volaille", categoriesAttendues: ['viandes_blanches'] },
  
  // Poissons
  { nom: "Poisson", categoriesAttendues: ['poissons_maigres'] },
  { nom: "Saumon", categoriesAttendues: ['poissons_gras'] },
  { nom: "Cabillaud", categoriesAttendues: ['poissons_maigres'] },
  { nom: "Thon", categoriesAttendues: ['poissons_gras'] },
  
  // Fruits de mer
  { nom: "Moules", categoriesAttendues: ['fruits_mer'] },
  { nom: "Crevettes", categoriesAttendues: ['fruits_mer'] },
  { nom: "Calamar", categoriesAttendues: ['fruits_mer'] },
  { nom: "Calamars", categoriesAttendues: ['fruits_mer'] },
  { nom: "Fruits de mer", categoriesAttendues: ['fruits_mer'] },
  
  // Variantes orthographiques
  { nom: "Viande haché", categoriesAttendues: ['viandes_rouges'] }, // Sans 'e'
  { nom: "Moule", categoriesAttendues: ['fruits_mer'] }, // Singulier
  { nom: "Crevette", categoriesAttendues: ['fruits_mer'] }, // Singulier
  { nom: "Calmar", categoriesAttendues: ['fruits_mer'] }, // Orthographe alternative
];

let categorisationReussie = 0;
let categorisationEchouee = 0;
let categorisationPartielle = 0;

for (const test of ingredientsATest) {
  console.log(`\n📋 Ingrédient: "${test.nom}"`);
  console.log(`   Catégories attendues: ${test.categoriesAttendues.join(', ')}`);
  
  const categoriesDetectees = categoriserIngredient(test.nom);
  console.log(`   Catégories détectées: ${categoriesDetectees.length > 0 ? categoriesDetectees.join(', ') : '⚠️ AUCUNE'}`);
  
  if (categoriesDetectees.length === 0) {
    console.log(`   ❌ AUCUNE CATÉGORIE DÉTECTÉE`);
    categorisationEchouee++;
  } else {
    const toutesPresentes = test.categoriesAttendues.every(cat => categoriesDetectees.includes(cat));
    if (toutesPresentes) {
      console.log(`   ✅ CATÉGORISATION CORRECTE`);
      categorisationReussie++;
    } else {
      console.log(`   ⚠️ CATÉGORISATION PARTIELLE`);
      categorisationPartielle++;
    }
  }
}

console.log(`\n📊 Résultats Catégorisation:`);
console.log(`   ✅ Correctes: ${categorisationReussie}/${ingredientsATest.length}`);
console.log(`   ⚠️ Partielles: ${categorisationPartielle}/${ingredientsATest.length}`);
console.log(`   ❌ Échouées: ${categorisationEchouee}/${ingredientsATest.length}`);
console.log(`   📈 Taux de réussite: ${((categorisationReussie / ingredientsATest.length) * 100).toFixed(1)}%`);

// ========================================
// RÉSUMÉ GLOBAL
// ========================================

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 RÉSUMÉ GLOBAL DES TESTS`);
console.log('='.repeat(60));

const totalTests = combinaisonsInterdites.length + combinaisonsAutorisees.length + ingredientsATest.length;
const totalReussis = testsPassesInterdits + testsPassesAutorises + categorisationReussie;
const totalEchoues = testsEchouesInterdits + testsEchouesAutorises + categorisationEchouee + categorisationPartielle;

console.log(`\n🎯 Tests totaux: ${totalTests}`);
console.log(`   ✅ Réussis: ${totalReussis}`);
console.log(`   ❌ Échoués: ${totalEchoues}`);
console.log(`   📈 Taux de réussite global: ${((totalReussis / totalTests) * 100).toFixed(1)}%`);

console.log(`\n🔍 Détails par catégorie:`);
console.log(`   1. Combinaisons interdites: ${testsPassesInterdits}/${combinaisonsInterdites.length} (${((testsPassesInterdits / combinaisonsInterdites.length) * 100).toFixed(1)}%)`);
console.log(`   2. Combinaisons autorisées: ${testsPassesAutorises}/${combinaisonsAutorisees.length} (${((testsPassesAutorises / combinaisonsAutorisees.length) * 100).toFixed(1)}%)`);
console.log(`   3. Catégorisation ingrédients: ${categorisationReussie}/${ingredientsATest.length} (${((categorisationReussie / ingredientsATest.length) * 100).toFixed(1)}%)`);

if (totalEchoues > 0) {
  console.log(`\n⚠️ ATTENTION: ${totalEchoues} test(s) ont échoué`);
  console.log(`   Vérifiez les logs ci-dessus pour identifier les problèmes`);
} else {
  console.log(`\n✅ TOUS LES TESTS ONT RÉUSSI! Système de cohérence fonctionnel à 100%`);
}

console.log(`\n${'='.repeat(60)}`);
console.log(`FIN DU DIAGNOSTIC`);
console.log('='.repeat(60));

// Export pour utilisation dans d'autres scripts
export {
  combinaisonsInterdites,
  combinaisonsAutorisees,
  ingredientsATest
};
