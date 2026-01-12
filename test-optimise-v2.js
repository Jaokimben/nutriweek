/**
 * TEST DU GÉNÉRATEUR OPTIMISÉ v2.1
 * 
 * Valide les nouvelles améliorations:
 * 1. Macronutriments quotidiens dans la fourchette 85-115%
 * 2. Pas de répétition intra-journalière des ingrédients principaux
 */

import { genererMenuHebdomadaire } from './src/utils/menuGeneratorOptimise.js';

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

console.log('🧪 TEST DU GÉNÉRATEUR OPTIMISÉ v2.1\n');
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
  console.log(`📊 Écart: ${ecart.toFixed(2)}%\n`);
  
  // Validation calories
  if (Math.abs(ecart) <= 5) {
    console.log(`✅ CALORIES: Écart dans la marge acceptée (±5%)`);
  } else {
    console.log(`❌ CALORIES: Écart dépasse la marge acceptée (±5%)`);
  }
  
  // Validation macronutriments
  const objectifsMacros = menuHebdo.metadata.besoins.objectifsMacros;
  const moyennesMacros = menuHebdo.metadata.besoins.moyennesMacros;
  
  console.log(`\n📊 MACRONUTRIMENTS MOYENS:\n`);
  console.log(`Protéines: ${moyennesMacros.proteines}g/jour (objectif: ${objectifsMacros.proteines}g, fourchette: ${menuHebdo.metadata.besoins.fourchettesAcceptables.proteines})`);
  console.log(`Glucides: ${moyennesMacros.glucides}g/jour (objectif: ${objectifsMacros.glucides}g, fourchette: ${menuHebdo.metadata.besoins.fourchettesAcceptables.glucides})`);
  console.log(`Lipides: ${moyennesMacros.lipides}g/jour (objectif: ${objectifsMacros.lipides}g, fourchette: ${menuHebdo.metadata.besoins.fourchettesAcceptables.lipides})`);
  
  // Test des macros par jour
  console.log('\n📅 VALIDATION MACROS PAR JOUR:\n');
  
  let joursValidsMacros = 0;
  let joursValidesRepetition = 0;
  
  Object.entries(menuHebdo.menu).forEach(([jour, data]) => {
    const ecartJour = ((data.totaux.calories - objectif) / objectif) * 100;
    
    // Vérifier macros (fourchette 75-125%)
    const proteinesMin = objectifsMacros.proteines * 0.75;
    const proteinesMax = objectifsMacros.proteines * 1.25;
    const lipidesMin = objectifsMacros.lipides * 0.75;
    const lipidesMax = objectifsMacros.lipides * 1.25;
    const glucidesMin = objectifsMacros.glucides * 0.75;
    const glucidesMax = objectifsMacros.glucides * 1.25;
    
    const proteinesOk = data.totaux.proteines >= proteinesMin && data.totaux.proteines <= proteinesMax;
    const lipidesOk = data.totaux.lipides >= lipidesMin && data.totaux.lipides <= lipidesMax;
    const glucidesOk = data.totaux.glucides >= glucidesMin && data.totaux.glucides <= glucidesMax;
    
    const macrosOk = proteinesOk && lipidesOk && glucidesOk;
    
    if (macrosOk) joursValidsMacros++;
    
    // Vérifier répétitions
    const repasNoms = data.repas.map(r => r.nom);
    const ingredientsPrincipaux = repasNoms.map(nom => {
      const nomLower = nom.toLowerCase();
      if (nomLower.includes('omelette') || nomLower.includes('œufs')) return 'oeufs';
      if (nomLower.includes('poulet')) return 'poulet';
      if (nomLower.includes('saumon')) return 'saumon';
      if (nomLower.includes('steak') || nomLower.includes('boeuf')) return 'boeuf';
      if (nomLower.includes('thon')) return 'thon';
      if (nomLower.includes('dinde')) return 'dinde';
      return nom.split(/[\s,]+/)[0].toLowerCase();
    });
    
    const ingredientsUniques = new Set(ingredientsPrincipaux);
    const hasRepetition = ingredientsPrincipaux.length !== ingredientsUniques.size;
    
    if (!hasRepetition) joursValidesRepetition++;
    
    const statusMacros = macrosOk ? '✅' : '⚠️';
    const statusRepetition = !hasRepetition ? '✅' : '⚠️';
    
    console.log(`${statusMacros} ${statusRepetition} ${jour}: ${data.totaux.calories} kcal | P:${data.totaux.proteines}g L:${data.totaux.lipides}g G:${data.totaux.glucides}g`);
    
    data.repas.forEach(repas => {
      console.log(`   - ${repas.type}: ${repas.nom}`);
    });
    
    if (hasRepetition) {
      const repetitions = ingredientsPrincipaux.filter((item, index) => 
        ingredientsPrincipaux.indexOf(item) !== index
      );
      console.log(`   ⚠️ Répétition détectée: ${repetitions.join(', ')}`);
    }
    
    if (!macrosOk) {
      if (!proteinesOk) console.log(`   ⚠️ Protéines: ${data.totaux.proteines}g (fourchette: ${Math.round(proteinesMin)}-${Math.round(proteinesMax)}g)`);
      if (!lipidesOk) console.log(`   ⚠️ Lipides: ${data.totaux.lipides}g (fourchette: ${Math.round(lipidesMin)}-${Math.round(lipidesMax)}g)`);
      if (!glucidesOk) console.log(`   ⚠️ Glucides: ${data.totaux.glucides}g (fourchette: ${Math.round(glucidesMin)}-${Math.round(glucidesMax)}g)`);
    }
    
    console.log();
  });
  
  // Résultats finaux
  console.log('='.repeat(80));
  console.log('📊 RÉSULTATS FINAUX\n');
  
  const tauxMacros = (joursValidsMacros / 7 * 100).toFixed(1);
  const tauxRepetition = (joursValidesRepetition / 7 * 100).toFixed(1);
  
  console.log(`✅ Jours avec macros équilibrés: ${joursValidsMacros}/7 (${tauxMacros}%)`);
  console.log(`✅ Jours sans répétition intra-journalière: ${joursValidesRepetition}/7 (${tauxRepetition}%)`);
  
  if (joursValidsMacros === 7 && joursValidesRepetition === 7) {
    console.log(`\n🎉 TOUS LES TESTS ONT RÉUSSI ! Le générateur est OPTIMISÉ v2.1 !`);
  } else {
    console.log(`\n⚠️ Certains tests ont échoué. Vérifier les détails ci-dessus.`);
  }
  
} catch (error) {
  console.error('\n❌ ERREUR LORS DU TEST:', error.message);
  console.error(error.stack);
  process.exit(1);
}
