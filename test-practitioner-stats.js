/**
 * Script de test pour vérifier les statistiques du Portail Praticien
 */

import { getAllFiles, getStorageStats, getActivationStatus } from './src/utils/practitionerStorageV2.js';

console.log('🧪 Test des fonctions du Portail Praticien\n');

// Test 1: getAllFiles
console.log('📁 Test 1: getAllFiles()');
try {
  const files = await getAllFiles();
  console.log('✅ Fichiers récupérés:', Object.keys(files).filter(k => k !== 'metadata' && files[k]));
  console.log('📍 Source:', files.metadata?.source);
  console.log('');
} catch (error) {
  console.error('❌ Erreur getAllFiles:', error.message);
}

// Test 2: getStorageStats
console.log('📊 Test 2: getStorageStats()');
try {
  const stats = await getStorageStats();
  console.log('✅ Statistiques:');
  console.log('   - Fichiers:', stats.fileCount);
  console.log('   - Taille utilisée:', stats.formattedSize);
  console.log('   - Taille max:', stats.formattedMax);
  console.log('   - Pourcentage:', stats.usedPercent + '%');
  console.log('   - Backend disponible:', stats.backendAvailable);
  console.log('');
} catch (error) {
  console.error('❌ Erreur getStorageStats:', error.message);
}

// Test 3: getActivationStatus
console.log('✓ Test 3: getActivationStatus()');
try {
  const status = await getActivationStatus();
  console.log('✅ Statut d\'activation:');
  console.log('   - Actif:', status.isActive);
  console.log('   - Fichiers Excel:', status.hasExcelFiles);
  console.log('   - Fichiers uploadés:', status.uploadedFiles.join(', '));
  console.log('   - Dernière MAJ:', status.lastUpdated);
  console.log('');
} catch (error) {
  console.error('❌ Erreur getActivationStatus:', error.message);
}

console.log('🎉 Tests terminés !');
