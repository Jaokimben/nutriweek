/**
 * 🔍 SCRIPT D'EXTRACTION DES FICHIERS PRATICIEN
 * 
 * Ce script extrait les fichiers uploadés du LocalStorage
 * et génère un rapport détaillé.
 * 
 * UTILISATION:
 * 1. Ouvrir https://5181-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/practitioner
 * 2. Appuyer sur F12 (Console développeur)
 * 3. Aller dans l'onglet "Console"
 * 4. Copier-coller ce script complet
 * 5. Appuyer sur Entrée
 * 6. Voir le rapport dans la console
 */

(function() {
  console.clear();
  console.log('==============================================');
  console.log('📂 EXTRACTION DES FICHIERS PRATICIEN');
  console.log('==============================================\n');

  const STORAGE_KEY = 'nutriweek_practitioner_files';

  try {
    // Lire le LocalStorage
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      console.log('❌ AUCUN FICHIER TROUVÉ');
      console.log('Le portail praticien n\'a pas encore été utilisé.\n');
      console.log('Pour uploader des fichiers:');
      console.log('1. Aller au portail praticien');
      console.log('2. Uploader vos fichiers Excel, FODMAP, Word');
      console.log('3. Relancer ce script\n');
      return;
    }

    // Parser les données
    const files = JSON.parse(data);

    console.log('✅ FICHIERS TROUVÉS!\n');
    console.log('==============================================');
    console.log('📊 RÉSUMÉ DES FICHIERS');
    console.log('==============================================\n');

    let fileCount = 0;
    let totalSize = 0;

    // Analyser chaque type de fichier
    const fileTypes = [
      { key: 'alimentsPetitDej', label: '🌅 Excel Petit-Déjeuner' },
      { key: 'alimentsDejeuner', label: '🍽️ Excel Déjeuner' },
      { key: 'alimentsDiner', label: '🌙 Excel Dîner' },
      { key: 'fodmapList', label: '🚫 Liste FODMAP' },
      { key: 'reglesGenerales', label: '📄 Règles Générales' },
      { key: 'pertePoidHomme', label: '💪 Programme Homme' },
      { key: 'pertePoidFemme', label: '💃 Programme Femme' },
      { key: 'vitalite', label: '⚡ Programme Vitalité' }
    ];

    fileTypes.forEach(type => {
      const file = files[type.key];
      if (file) {
        fileCount++;
        totalSize += file.size || 0;
        
        console.log(`${type.label}`);
        console.log(`   Nom: ${file.name}`);
        console.log(`   Taille: ${Math.round(file.size / 1024)} KB`);
        console.log(`   Type: ${file.type}`);
        console.log(`   Uploadé: ${new Date(file.uploadedAt).toLocaleString('fr-FR')}`);
        console.log('');
      }
    });

    // Métadonnées
    if (files.metadata) {
      console.log('==============================================');
      console.log('⚙️ MÉTADONNÉES');
      console.log('==============================================\n');
      console.log(`Fichiers activés: ${files.metadata.useUploadedFiles ? '✅ OUI' : '⚠️ NON'}`);
      if (files.metadata.lastUpdated) {
        console.log(`Dernière mise à jour: ${new Date(files.metadata.lastUpdated).toLocaleString('fr-FR')}`);
      }
      console.log('');
    }

    // Statistiques globales
    console.log('==============================================');
    console.log('📈 STATISTIQUES GLOBALES');
    console.log('==============================================\n');
    console.log(`Nombre de fichiers: ${fileCount}`);
    console.log(`Taille totale: ${Math.round(totalSize / 1024)} KB (${(totalSize / (1024 * 1024)).toFixed(2)} MB)`);
    console.log(`Capacité max: 5 MB`);
    console.log(`Pourcentage utilisé: ${Math.round((totalSize / (5 * 1024 * 1024)) * 100)}%`);
    console.log('');

    // Proposer l'export
    console.log('==============================================');
    console.log('📤 EXPORTER LES FICHIERS');
    console.log('==============================================\n');
    console.log('Pour récupérer tous les fichiers:');
    console.log('1. Cliquer sur le bouton "📤 Exporter Tous les Fichiers" en bas de la page');
    console.log('2. Un fichier JSON sera téléchargé');
    console.log('3. Envoyer ce fichier à: joakimben1234@gmail.com');
    console.log('');

    // Bouton d'export automatique
    console.log('💡 OU exécuter cette fonction pour exporter maintenant:');
    console.log('');
    console.log('%cexportFiles()', 'color: blue; font-weight: bold; font-size: 14px;');
    console.log('');

    // Créer la fonction d'export
    window.exportFiles = function() {
      const json = JSON.stringify(files, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutriweek_files_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('✅ Fichier exporté: ' + a.download);
    };

    // Liste des fichiers pour copie
    console.log('==============================================');
    console.log('📋 LISTE DES FICHIERS (pour email)');
    console.log('==============================================\n');
    
    const fileList = fileTypes
      .filter(type => files[type.key])
      .map(type => {
        const file = files[type.key];
        return `${type.label}: ${file.name} (${Math.round(file.size / 1024)} KB)`;
      })
      .join('\n');
    
    console.log(fileList);
    console.log('');
    console.log('Copier cette liste et l\'envoyer par email si besoin.');
    console.log('');

  } catch (error) {
    console.error('❌ ERREUR lors de la lecture:', error);
    console.log('\nVérifiez que vous êtes bien sur:');
    console.log('https://5181-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai/practitioner');
  }

  console.log('==============================================');
  console.log('✅ EXTRACTION TERMINÉE');
  console.log('==============================================\n');
})();
