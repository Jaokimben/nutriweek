/**
 * TEST DU SYSTÈME DE SWITCH ENTRE GÉNÉRATEURS
 * 
 * Ce test simule le comportement du système lorsque :
 * 1. Aucun fichier n'est uploadé (utilise recettes par défaut)
 * 2. Des fichiers sont uploadés (utilise fichiers Excel)
 */

import { genererMenuHebdomadaire, getModeInfo } from './src/utils/menuGeneratorSwitch.js';

async function testSwitch() {
  console.log('🧪 TEST SWITCH GÉNÉRATEUR DE MENUS\n');
  console.log('='.repeat(60));
  
  const profil = {
    poids: 70,
    taille: 175,
    age: 30,
    sexe: 'homme',
    objectif: 'perte',
    activite: 'modere',
    jeuneIntermittent: false
  };
  
  console.log('\nProfil de test:', profil);
  
  try {
    console.log('\n📊 Détection du mode actuel...\n');
    
    const modeInfo = getModeInfo();
    console.log('Mode:', modeInfo.mode);
    console.log('Label:', modeInfo.modeLabel);
    console.log('Description:', modeInfo.description);
    console.log('Fichiers uploadés:');
    console.log('  Petit-déjeuner:', modeInfo.fichiers.petitDejeuner ? '✅' : '❌');
    console.log('  Déjeuner:', modeInfo.fichiers.dejeuner ? '✅' : '❌');
    console.log('  Dîner:', modeInfo.fichiers.diner ? '✅' : '❌');
    
    console.log('\n🎯 Génération du menu hebdomadaire...\n');
    
    const menu = await genererMenuHebdomadaire(profil);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTATS\n');
    
    console.log('Objectif calorique:', menu.metadata.besoins.caloriesJournalieres, 'kcal/jour');
    console.log('Source des aliments:', menu.metadata.source || modeInfo.modeLabel);
    console.log();
    
    console.log('MENUS GÉNÉRÉS:\n');
    
    menu.semaine.forEach((jour) => {
      console.log(`${jour.jour} (${jour.date}):`);
      console.log(`  Total: ${jour.totaux.calories} kcal`);
      console.log(`  P: ${Math.round(jour.totaux.proteines)}g | L: ${Math.round(jour.totaux.lipides)}g | G: ${Math.round(jour.totaux.glucides)}g`);
      
      // Afficher les noms de plats
      if (jour.menu.petitDejeuner) {
        console.log(`  Petit-déjeuner: ${jour.menu.petitDejeuner.nom || 'Menu du jour'}`);
      }
      if (jour.menu.dejeuner) {
        console.log(`  Déjeuner: ${jour.menu.dejeuner.nom || 'Menu du jour'}`);
      }
      if (jour.menu.diner) {
        console.log(`  Dîner: ${jour.menu.diner.nom || 'Menu du jour'}`);
      }
      
      console.log();
    });
    
    console.log('='.repeat(60));
    console.log('\n✅ TEST RÉUSSI!\n');
    console.log('📝 NOTES:');
    console.log('  - Si mode = "default": utilise les recettes pré-définies');
    console.log('  - Si mode = "excel": utilise les fichiers uploadés par le praticien');
    console.log('  - Pour tester le mode Excel, le praticien doit uploader des fichiers via l\'interface');
    console.log();
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testSwitch();
