/**
 * 🧪 TEST PARSER EXCEL v2.4.7 - Règle Absolue
 * 
 * Tests de validation pour la nouvelle version du parser
 * avec règles strictes :
 * - Colonne A = TOUJOURS noms d'aliments
 * - Ligne 1 = TOUJOURS en-têtes
 * - Données = TOUJOURS à partir de ligne 2
 */

import { parseExcelFile } from './src/utils/practitionerExcelParser.js';
import * as XLSX from 'xlsx';

/**
 * Crée un fichier Excel de test en base64
 */
function createTestExcel(data) {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Aliments');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const base64 = buffer.toString('base64');
  
  return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
}

/**
 * Test 1: Format Standard Complet
 */
async function test1_FormatStandard() {
  console.log('\n🧪 TEST 1: Format Standard Complet');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const data = [
    ['Aliment', 'Calories', 'Protéines', 'Glucides', 'Lipides', 'Catégorie'],
    ['Poulet grillé', 165, 31, 0, 3.6, 'Viande'],
    ['Riz basmati', 130, 2.7, 28, 0.3, 'Céréale'],
    ['Brocoli vapeur', 34, 2.8, 7, 0.4, 'Légume'],
    ['Saumon', 208, 20, 0, 13, 'Poisson'],
    ['Quinoa', 120, 4.4, 21, 1.9, 'Céréale']
  ];
  
  const base64 = createTestExcel(data);
  const result = await parseExcelFile(base64);
  
  console.log('\n✅ Résultats:');
  console.log(`   Aliments parsés: ${result.length}`);
  console.log(`   Attendu: 5`);
  console.log(`   Status: ${result.length === 5 ? '✅ PASS' : '❌ FAIL'}`);
  
  return result.length === 5;
}

/**
 * Test 2: Ligne Vide Ignorée
 */
async function test2_LigneVide() {
  console.log('\n🧪 TEST 2: Ligne Vide Ignorée');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const data = [
    ['Nom', 'Énergie', 'Protéines'],
    ['Épinards', 23, 2.9],
    [],  // Ligne vide
    ['Tomate', 18, 0.9],
    [],  // Ligne vide
    ['Courgette', 17, 1.2]
  ];
  
  const base64 = createTestExcel(data);
  const result = await parseExcelFile(base64);
  
  console.log('\n✅ Résultats:');
  console.log(`   Aliments parsés: ${result.length}`);
  console.log(`   Attendu: 3 (lignes vides ignorées)`);
  console.log(`   Status: ${result.length === 3 ? '✅ PASS' : '❌ FAIL'}`);
  
  return result.length === 3;
}

/**
 * Test 3: Colonne A Uniquement (Pas de Composition)
 */
async function test3_ColonneAUniquement() {
  console.log('\n🧪 TEST 3: Colonne A Uniquement (Pas de Composition)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const data = [
    ['Aliment'],  // En-têtes - une seule colonne
    ['Banane'],
    ['Pomme'],
    ['Orange']
  ];
  
  const base64 = createTestExcel(data);
  const result = await parseExcelFile(base64);
  
  console.log('\n✅ Résultats:');
  console.log(`   Aliments parsés: ${result.length}`);
  console.log(`   Attendu: 3`);
  console.log(`   Calories par défaut: ${result.every(a => a.energie === 0) ? '0 (✅)' : 'ERREUR'}`);
  console.log(`   Status: ${result.length === 3 && result.every(a => a.energie === 0) ? '✅ PASS' : '❌ FAIL'}`);
  
  return result.length === 3 && result.every(a => a.energie === 0);
}

/**
 * Test 4: Colonne A Vide (Ligne Ignorée)
 */
async function test4_ColonneAVide() {
  console.log('\n🧪 TEST 4: Colonne A Vide (Ligne Ignorée)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const data = [
    ['Nom', 'Calories'],
    ['Avocat', 160],
    ['', 100],  // Colonne A vide → ignorée
    ['Amande', 579],
    ['', 200]   // Colonne A vide → ignorée
  ];
  
  const base64 = createTestExcel(data);
  const result = await parseExcelFile(base64);
  
  console.log('\n✅ Résultats:');
  console.log(`   Aliments parsés: ${result.length}`);
  console.log(`   Attendu: 2 (lignes sans nom ignorées)`);
  console.log(`   Status: ${result.length === 2 ? '✅ PASS' : '❌ FAIL'}`);
  
  return result.length === 2;
}

/**
 * Test 5: En-têtes Variés (Détection Auto)
 */
async function test5_EntetesVaries() {
  console.log('\n🧪 TEST 5: En-têtes Variés (Détection Auto)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const data = [
    ['Produit', 'Énergie (kcal)', 'Protein', 'Carbs', 'Fats'],
    ['Lentilles', 116, 9, 20, 0.4],
    ['Pois chiches', 164, 8.9, 27, 2.6]
  ];
  
  const base64 = createTestExcel(data);
  const result = await parseExcelFile(base64);
  
  console.log('\n✅ Résultats:');
  console.log(`   Aliments parsés: ${result.length}`);
  console.log(`   Attendu: 2`);
  console.log(`   Énergie détectée: ${result[0]?.energie === 116 ? '✅' : '❌'}`);
  console.log(`   Protéines détectées: ${result[0]?.proteines === 9 ? '✅' : '❌'}`);
  console.log(`   Glucides détectés: ${result[0]?.glucides === 20 ? '✅' : '❌'}`);
  console.log(`   Status: ${result.length === 2 && result[0]?.energie === 116 ? '✅ PASS' : '❌ FAIL'}`);
  
  return result.length === 2 && result[0]?.energie === 116;
}

/**
 * Test 6: Format Minimal (Nom + Calories)
 */
async function test6_FormatMinimal() {
  console.log('\n🧪 TEST 6: Format Minimal (Nom + Calories)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const data = [
    ['Aliment', 'Calories'],
    ['Oeuf', 155],
    ['Pain complet', 247],
    ['Yaourt nature', 59]
  ];
  
  const base64 = createTestExcel(data);
  const result = await parseExcelFile(base64);
  
  console.log('\n✅ Résultats:');
  console.log(`   Aliments parsés: ${result.length}`);
  console.log(`   Attendu: 3`);
  console.log(`   Calories correctes: ${result[0]?.energie === 155 ? '✅' : '❌'}`);
  console.log(`   Protéines par défaut: ${result[0]?.proteines === 0 ? '✅' : '❌'}`);
  console.log(`   Status: ${result.length === 3 && result[0]?.energie === 155 ? '✅ PASS' : '❌ FAIL'}`);
  
  return result.length === 3 && result[0]?.energie === 155;
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log('\n🚀 TESTS PARSER EXCEL v2.4.7 - Règle Absolue');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 Règles testées:');
  console.log('   1. Colonne A = TOUJOURS noms d\'aliments');
  console.log('   2. Ligne 1 = TOUJOURS en-têtes (ignorée)');
  console.log('   3. Données = TOUJOURS à partir de ligne 2');
  console.log('═══════════════════════════════════════════════════════════');
  
  const results = [];
  
  try {
    results.push({ name: 'Test 1: Format Standard', pass: await test1_FormatStandard() });
    results.push({ name: 'Test 2: Ligne Vide', pass: await test2_LigneVide() });
    results.push({ name: 'Test 3: Colonne A Uniquement', pass: await test3_ColonneAUniquement() });
    results.push({ name: 'Test 4: Colonne A Vide', pass: await test4_ColonneAVide() });
    results.push({ name: 'Test 5: En-têtes Variés', pass: await test5_EntetesVaries() });
    results.push({ name: 'Test 6: Format Minimal', pass: await test6_FormatMinimal() });
  } catch (error) {
    console.error('\n❌ ERREUR DURANT LES TESTS:', error);
  }
  
  // Résumé
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  results.forEach(({ name, pass }) => {
    console.log(`   ${pass ? '✅' : '❌'} ${name}`);
  });
  
  const passCount = results.filter(r => r.pass).length;
  const totalCount = results.length;
  const percentage = Math.round((passCount / totalCount) * 100);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`🎯 Résultat: ${passCount}/${totalCount} tests réussis (${percentage}%)`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (passCount === totalCount) {
    console.log('✅ TOUS LES TESTS SONT PASSÉS !');
    console.log('🚀 Parser Excel v2.4.7 - PRODUCTION READY\n');
  } else {
    console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('⚠️  Corrections nécessaires avant déploiement\n');
  }
}

// Exécuter les tests
runAllTests().catch(console.error);
