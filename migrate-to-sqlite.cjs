#!/usr/bin/env node

/**
 * Script de Migration JsonDB → SQLite
 * 
 * Migre toutes les données existantes de JsonDB vers la nouvelle base SQLite
 */

const path = require('path');
const fs = require('fs');
const FileDatabase = require('./server/database.cjs');

const JSON_DB_PATH = path.join(__dirname, 'server/data/files.json');
const SQLITE_DB_PATH = path.join(__dirname, 'server/data/files.db');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║   MIGRATION JsonDB → SQLite                            ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Vérifier si JsonDB existe
if (!fs.existsSync(JSON_DB_PATH)) {
  console.log('⚠️  Aucune base JsonDB trouvée à', JSON_DB_PATH);
  console.log('✅ Rien à migrer, la base SQLite sera créée vide.\n');
  process.exit(0);
}

try {
  // Lire les données JsonDB
  console.log('📖 Lecture de JsonDB...');
  const jsonData = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
  
  if (!jsonData.files) {
    console.log('⚠️  Pas de données "files" dans JsonDB');
    process.exit(0);
  }

  // Créer/ouvrir la base SQLite
  console.log('🗄️  Connexion à SQLite...');
  const db = new FileDatabase(SQLITE_DB_PATH);

  let totalMigrated = 0;
  let totalErrors = 0;

  // Migrer chaque type de fichier
  for (const [fileType, data] of Object.entries(jsonData.files)) {
    const versions = data.versions || [];
    
    if (versions.length === 0) {
      console.log(`⏭️  ${fileType}: aucune version à migrer`);
      continue;
    }

    console.log(`\n📦 Migration de ${fileType} (${versions.length} versions)...`);

    versions.forEach((version, index) => {
      try {
        // Mapper les champs JsonDB vers SQLite
        const versionData = {
          version: version.version || Date.now() + index,
          originalName: version.originalName || version.name || 'unknown',
          fileName: version.fileName || version.name || 'unknown',
          filePath: version.filePath || version.path || '',
          size: version.size || 0,
          mimeType: version.mimeType || version.type || 'application/octet-stream',
          uploadedAt: version.uploadedAt || new Date().toISOString(),
          uploadedBy: version.uploadedBy || 'praticien'
        };

        db.addFileVersion(fileType, versionData);
        console.log(`  ✅ v${versionData.version}: ${versionData.originalName}`);
        totalMigrated++;
      } catch (error) {
        console.error(`  ❌ Erreur migration version:`, error.message);
        totalErrors++;
      }
    });
  }

  // Afficher le résumé
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                  RÉSUMÉ MIGRATION                      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`✅ Versions migrées: ${totalMigrated}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📊 Total traité: ${totalMigrated + totalErrors}\n`);

  // Vérifier les données migrées
  const stats = db.getStats();
  console.log('📊 Statistiques SQLite:');
  console.log(`   - Types de fichiers: ${stats.totalFileTypes}`);
  console.log(`   - Versions totales: ${stats.totalVersions}`);
  console.log(`   - Taille totale: ${(stats.totalSize / 1024).toFixed(2)} KB\n`);

  // Lister les fichiers migrés
  const allFiles = db.getAllFiles();
  if (allFiles.length > 0) {
    console.log('📁 Fichiers disponibles:');
    allFiles.forEach(file => {
      console.log(`   ✓ ${file.fileType}: ${file.totalVersions} version(s)`);
    });
  }

  db.close();

  console.log('\n✅ Migration terminée avec succès!\n');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
}
