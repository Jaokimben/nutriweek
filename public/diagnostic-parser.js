/**
 * 🔍 SCRIPT DE DIAGNOSTIC COMPLET - Parser Excel
 * 
 * Ce script vérifie:
 * 1. État du localStorage
 * 2. Activation des fichiers
 * 3. Parsing des fichiers Excel
 * 4. Logs détaillés
 */

console.log('\n🔍 ═══════════════════════════════════════════════════════════════');
console.log('🔍 DIAGNOSTIC COMPLET - Parser Excel');
console.log('🔍 ═══════════════════════════════════════════════════════════════\n');

// 1. Vérifier localStorage
console.log('📦 1. VÉRIFICATION LOCALSTORAGE\n');
const storageData = localStorage.getItem('nutriweek_practitioner_files');

if (!storageData) {
  console.log('❌ Aucune donnée trouvée dans localStorage');
  console.log('   Clé: nutriweek_practitioner_files\n');
} else {
  try {
    const parsed = JSON.parse(storageData);
    console.log('✅ Données trouvées dans localStorage');
    
    // Vérifier chaque fichier Excel
    const excelFiles = ['alimentsPetitDej', 'alimentsDejeuner', 'alimentsDiner'];
    
    console.log('\n📋 Fichiers Excel uploadés:\n');
    excelFiles.forEach(key => {
      const file = parsed[key];
      if (file && file.data) {
        console.log(`   ✅ ${key}:`);
        console.log(`      - Nom: ${file.name}`);
        console.log(`      - Taille: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(`      - Type: ${file.type}`);
        console.log(`      - Uploadé: ${file.uploadedAt}`);
        console.log(`      - Data présente: ${file.data ? 'OUI' : 'NON'}`);
        console.log(`      - Data commence par: ${file.data ? file.data.substring(0, 50) + '...' : 'N/A'}\n`);
      } else {
        console.log(`   ❌ ${key}: NON UPLOADÉ\n`);
      }
    });
    
    // Vérifier metadata
    console.log('📊 Metadata:\n');
    if (parsed.metadata) {
      console.log(`   - lastUpdated: ${parsed.metadata.lastUpdated}`);
      console.log(`   - uploadedBy: ${parsed.metadata.uploadedBy}`);
      console.log(`   - useUploadedFiles: ${parsed.metadata.useUploadedFiles} ${parsed.metadata.useUploadedFiles ? '✅' : '❌'}\n`);
    }
    
  } catch (error) {
    console.error('❌ Erreur parsing localStorage:', error);
  }
}

// 2. Tester le parsing
console.log('\n📋 2. TEST DU PARSER\n');

if (storageData) {
  try {
    const parsed = JSON.parse(storageData);
    
    // Charger le module de parsing
    import('./src/utils/practitionerExcelParser.js').then(async (module) => {
      const { parseExcelFile } = module;
      
      console.log('🔄 Parsing des fichiers...\n');
      
      const excelFiles = [
        { key: 'alimentsPetitDej', name: 'Petit-Déjeuner' },
        { key: 'alimentsDejeuner', name: 'Déjeuner' },
        { key: 'alimentsDiner', name: 'Dîner' }
      ];
      
      for (const { key, name } of excelFiles) {
        const file = parsed[key];
        
        if (file && file.data) {
          console.log(`📋 Test parsing: ${name}\n`);
          
          try {
            const aliments = await parseExcelFile(file.data);
            
            console.log(`\n✅ Résultat ${name}:`);
            console.log(`   - Aliments détectés: ${aliments.length}`);
            
            if (aliments.length > 0) {
              console.log(`\n   📝 Exemples d'aliments:\n`);
              aliments.slice(0, 5).forEach((aliment, idx) => {
                console.log(`      ${idx + 1}. ${aliment.nom} | ${aliment.energie} kcal | P:${aliment.proteines}g G:${aliment.glucides}g L:${aliment.lipides}g`);
              });
            } else {
              console.log(`\n   ⚠️ AUCUN ALIMENT DÉTECTÉ - C'EST LE PROBLÈME !`);
            }
            
            console.log('\n' + '─'.repeat(80) + '\n');
            
          } catch (error) {
            console.error(`❌ Erreur parsing ${name}:`, error.message);
            console.error('   Stack:', error.stack);
          }
        } else {
          console.log(`⚠️ ${name}: Pas de données à parser\n`);
        }
      }
      
    }).catch(err => {
      console.error('❌ Erreur import module:', err);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

console.log('\n🔍 ═══════════════════════════════════════════════════════════════');
console.log('🔍 FIN DU DIAGNOSTIC');
console.log('🔍 ═══════════════════════════════════════════════════════════════\n');
