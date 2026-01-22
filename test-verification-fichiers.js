/**
 * Test de vérification des fichiers Excel
 * Ce script teste la fonction verifierFichiersExcelPresents
 */

import { getAllFiles } from './src/utils/practitionerStorageV2.js';

async function testVerificationFichiers() {
  console.log('\n🧪 TEST: Vérification détection fichiers Excel');
  console.log('='.repeat(60));
  
  try {
    // 1. Récupérer tous les fichiers
    console.log('\n1️⃣ Appel getAllFiles()...');
    const files = await getAllFiles();
    
    console.log('\n2️⃣ Structure retournée:');
    console.log('  Type:', typeof files);
    console.log('  Clés:', Object.keys(files));
    
    // 2. Vérifier les 3 fichiers Excel
    console.log('\n3️⃣ Vérification des fichiers Excel:');
    
    console.log('\n  📄 alimentsPetitDej:');
    if (files.alimentsPetitDej) {
      console.log('    ✅ Existe');
      console.log('    - name:', files.alimentsPetitDej.name);
      console.log('    - type:', files.alimentsPetitDej.type);
      console.log('    - size:', files.alimentsPetitDej.size);
      console.log('    - data:', files.alimentsPetitDej.data ? 'présent' : 'null');
    } else {
      console.log('    ❌ N\'existe pas');
    }
    
    console.log('\n  📄 alimentsDejeuner:');
    if (files.alimentsDejeuner) {
      console.log('    ✅ Existe');
      console.log('    - name:', files.alimentsDejeuner.name);
      console.log('    - type:', files.alimentsDejeuner.type);
      console.log('    - size:', files.alimentsDejeuner.size);
      console.log('    - data:', files.alimentsDejeuner.data ? 'présent' : 'null');
    } else {
      console.log('    ❌ N\'existe pas');
    }
    
    console.log('\n  📄 alimentsDiner:');
    if (files.alimentsDiner) {
      console.log('    ✅ Existe');
      console.log('    - name:', files.alimentsDiner.name);
      console.log('    - type:', files.alimentsDiner.type);
      console.log('    - size:', files.alimentsDiner.size);
      console.log('    - data:', files.alimentsDiner.data ? 'présent' : 'null');
    } else {
      console.log('    ❌ N\'existe pas');
    }
    
    // 3. Simuler la vérification
    const aFichierPetitDej = files.alimentsPetitDej && files.alimentsPetitDej.name;
    const aFichierDejeuner = files.alimentsDejeuner && files.alimentsDejeuner.name;
    const aFichierDiner = files.alimentsDiner && files.alimentsDiner.name;
    
    const nbFichiers = [aFichierPetitDej, aFichierDejeuner, aFichierDiner].filter(Boolean).length;
    
    console.log('\n4️⃣ Résultat de la vérification:');
    console.log('  Nombre de fichiers détectés:', nbFichiers, '/3');
    console.log('  Status:', nbFichiers > 0 ? '✅ OK - Génération possible' : '❌ ERREUR - Aucun fichier');
    
    console.log('\n' + '='.repeat(60));
    
    if (nbFichiers === 0) {
      console.log('❌ TEST ÉCHOUÉ: Aucun fichier détecté alors que les fichiers existent sur le backend');
      process.exit(1);
    } else {
      console.log('✅ TEST RÉUSSI: Fichiers correctement détectés');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR lors du test:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testVerificationFichiers();
