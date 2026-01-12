/**
 * TEST DU GÉNÉRATEUR DE MENUS CORRIGÉ
 * 
 * Teste que les menus générés atteignent bien l'objectif calorique (±5%)
 */

import { genererMenuHebdomadaire } from './src/utils/menuGeneratorCorrige.js';

// Profil de test
const profilTest = {
  poids: 70,
  taille: 170,
  age: 30,
  sexe: 'homme',
  objectif: 'perte',
  niveauActivite: 'modere',
  allergies: [],
  preferences: [],
  jeuneIntermittent: false
};

console.log('🧪 TEST DU GÉNÉRATEUR DE MENUS CORRIGÉ\n');
console.log('📋 Profil de test:', profilTest);
console.log('\n' + '='.repeat(80) + '\n');

try {
  const menuHebdo = await genererMenuHebdomadaire(profilTest);
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 RÉSULTATS DU TEST\n');
  
  const objectif = menuHebdo.metadata.besoins.caloriesJournalieres;
  const moyenne = menuHebdo.metadata.besoins.moyenneRéelle;
  const ecart = ((moyenne - objectif) / objectif) * 100;
  
  console.log(`🎯 Objectif calorique: ${objectif} kcal/jour`);
  console.log(`📈 Moyenne réelle: ${moyenne} kcal/jour`);
  console.log(`📊 Écart: ${ecart.toFixed(2)}%`);
  
  // Validation
  if (Math.abs(ecart) <= 5) {
    console.log(`\n✅ TEST RÉUSSI: L'écart est dans la marge acceptée (±5%)`);
  } else {
    console.log(`\n❌ TEST ÉCHOUÉ: L'écart dépasse la marge acceptée (±5%)`);
  }
  
  // Détails par jour
  console.log('\n📅 DÉTAILS PAR JOUR:\n');
  
  Object.entries(menuHebdo.menu).forEach(([jour, data]) => {
    const ecartJour = ((data.totaux.calories - objectif) / objectif) * 100;
    const status = Math.abs(ecartJour) <= 5 ? '✅' : '⚠️';
    
    console.log(`${status} ${jour}: ${data.totaux.calories} kcal (écart: ${ecartJour.toFixed(1)}%)`);
    
    data.repas.forEach(repas => {
      console.log(`   - ${repas.type}: ${repas.nom} → ${repas.nutrition.calories} kcal`);
    });
    console.log();
  });
  
  // Macros
  console.log('📊 MACRONUTRIMENTS MOYENS:\n');
  console.log(`Protéines: ${menuHebdo.metadata.besoins.moyennesMacros.proteines}g/jour`);
  console.log(`Glucides: ${menuHebdo.metadata.besoins.moyennesMacros.glucides}g/jour`);
  console.log(`Lipides: ${menuHebdo.metadata.besoins.moyennesMacros.lipides}g/jour`);
  
} catch (error) {
  console.error('\n❌ ERREUR LORS DU TEST:', error.message);
  console.error(error.stack);
  process.exit(1);
}
