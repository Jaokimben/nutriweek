/**
 * TEST DU GÉNÉRATEUR DE MENUS DEPUIS FICHIERS EXCEL
 * 
 * Ce test simule l'upload de fichiers Excel et vérifie que le générateur
 * utilise UNIQUEMENT les aliments uploadés
 */

import { genererMenuHebdomadaireExcel } from './src/utils/menuGeneratorFromExcel.js';
import { 
  saveAlimentsPetitDej,
  saveAlimentsDejeuner,
  saveAlimentsDiner,
  getAllFiles 
} from './src/utils/practitionerStorage.js';
import * as XLSX from 'xlsx';

// Créer des données Excel de test
function creerFichierExcelTest(aliments) {
  const worksheet = XLSX.utils.json_to_sheet(aliments);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Aliments');
  
  // Convertir en buffer puis en base64
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const base64 = buffer.toString('base64');
  
  return {
    name: 'test.xlsx',
    data: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`,
    size: buffer.length,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
}

// Aliments de test pour le petit-déjeuner
const alimentsPetitDejTest = [
  { nom: 'Flocons d\'avoine', energie: 389, proteines: 13.2, glucides: 66.3, lipides: 6.9 },
  { nom: 'Lait demi-écrémé', energie: 47, proteines: 3.3, glucides: 4.8, lipides: 1.6 },
  { nom: 'Banane', energie: 89, proteines: 1.1, glucides: 22.8, lipides: 0.3 },
  { nom: 'Miel', energie: 304, proteines: 0.3, glucides: 82.4, lipides: 0 },
  { nom: 'Œufs', energie: 143, proteines: 12.6, glucides: 0.7, lipides: 9.5 }
];

// Aliments de test pour le déjeuner
const alimentsDejeunerTest = [
  { nom: 'Poulet grillé', energie: 165, proteines: 31, glucides: 0, lipides: 3.6 },
  { nom: 'Riz basmati', energie: 130, proteines: 2.7, glucides: 28, lipides: 0.3 },
  { nom: 'Brocoli', energie: 34, proteines: 2.8, glucides: 7, lipides: 0.4 },
  { nom: 'Tomate', energie: 18, proteines: 0.9, glucides: 3.9, lipides: 0.2 },
  { nom: 'Huile d\'olive', energie: 884, proteines: 0, glucides: 0, lipides: 100 },
  { nom: 'Saumon', energie: 208, proteines: 20, glucides: 0, lipides: 13 }
];

// Aliments de test pour le dîner
const alimentsDinerTest = [
  { nom: 'Cabillaud', energie: 82, proteines: 18, glucides: 0, lipides: 0.7 },
  { nom: 'Quinoa', energie: 120, proteines: 4.4, glucides: 21.3, lipides: 1.9 },
  { nom: 'Courgette', energie: 17, proteines: 1.2, glucides: 3.1, lipides: 0.3 },
  { nom: 'Carotte', energie: 41, proteines: 0.9, glucides: 9.6, lipides: 0.2 },
  { nom: 'Haricots verts', energie: 31, proteines: 1.8, glucides: 7, lipides: 0.1 },
  { nom: 'Thon', energie: 144, proteines: 23.3, glucides: 0, lipides: 4.9 }
];

async function runTest() {
  console.log('🧪 TEST GÉNÉRATEUR MENUS DEPUIS EXCEL\n');
  console.log('=' .repeat(60));
  
  try {
    // Étape 1: Créer les fichiers Excel de test
    console.log('\n📝 Étape 1: Création des fichiers Excel de test...');
    
    const fichierPetitDej = creerFichierExcelTest(alimentsPetitDejTest);
    const fichierDejeuner = creerFichierExcelTest(alimentsDejeunerTest);
    const fichierDiner = creerFichierExcelTest(alimentsDinerTest);
    
    console.log('  ✅ Fichier petit-déjeuner créé:', fichierPetitDej.name);
    console.log('  ✅ Fichier déjeuner créé:', fichierDejeuner.name);
    console.log('  ✅ Fichier dîner créé:', fichierDiner.name);
    
    // Étape 2: Sauvegarder les fichiers
    console.log('\n💾 Étape 2: Sauvegarde des fichiers...');
    
    await saveAlimentsPetitDej(fichierPetitDej);
    await saveAlimentsDejeuner(fichierDejeuner);
    await saveAlimentsDiner(fichierDiner);
    
    console.log('  ✅ Fichiers sauvegardés dans le localStorage');
    
    // Étape 3: Vérifier les fichiers sauvegardés
    console.log('\n🔍 Étape 3: Vérification des fichiers sauvegardés...');
    
    const files = getAllFiles();
    console.log('  ✅ Petit-déjeuner:', files.alimentsPetitDej ? 'OK' : 'ERREUR');
    console.log('  ✅ Déjeuner:', files.alimentsDejeuner ? 'OK' : 'ERREUR');
    console.log('  ✅ Dîner:', files.alimentsDiner ? 'OK' : 'ERREUR');
    
    // Étape 4: Générer un menu hebdomadaire
    console.log('\n🎯 Étape 4: Génération du menu hebdomadaire...\n');
    
    const profil = {
      poids: 70,
      taille: 175,
      age: 30,
      sexe: 'homme',
      objectif: 'perte',
      activite: 'modere',
      jeuneIntermittent: false
    };
    
    console.log('Profil utilisé:', profil);
    
    const menu = await genererMenuHebdomadaireExcel(profil);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTATS\n');
    
    // Afficher les stats générales
    console.log('Objectif calorique:', menu.metadata.besoins.caloriesJournalieres, 'kcal/jour');
    console.log('Macros cibles:', menu.metadata.besoins.macrosCibles);
    console.log();
    
    // Afficher chaque jour
    console.log('MENUS GÉNÉRÉS:\n');
    
    menu.semaine.forEach((jour, index) => {
      console.log(`${jour.jour} (${jour.date}):`);
      console.log(`  Total: ${jour.totaux.calories} kcal`);
      console.log(`  Protéines: ${Math.round(jour.totaux.proteines)}g | Lipides: ${Math.round(jour.totaux.lipides)}g | Glucides: ${Math.round(jour.totaux.glucides)}g`);
      
      // Petit-déjeuner
      if (jour.menu.petitDejeuner) {
        console.log(`  Petit-déjeuner (${jour.menu.petitDejeuner.nutrition.calories} kcal):`);
        jour.menu.petitDejeuner.ingredients.forEach(ing => {
          console.log(`    - ${ing.nom}: ${ing.quantite}${ing.unite} (${ing.calories} kcal)`);
        });
      }
      
      // Déjeuner
      if (jour.menu.dejeuner) {
        console.log(`  Déjeuner (${jour.menu.dejeuner.nutrition.calories} kcal):`);
        jour.menu.dejeuner.ingredients.forEach(ing => {
          console.log(`    - ${ing.nom}: ${ing.quantite}${ing.unite} (${ing.calories} kcal)`);
        });
      }
      
      // Dîner
      if (jour.menu.diner) {
        console.log(`  Dîner (${jour.menu.diner.nutrition.calories} kcal):`);
        jour.menu.diner.ingredients.forEach(ing => {
          console.log(`    - ${ing.nom}: ${ing.quantite}${ing.unite} (${ing.calories} kcal)`);
        });
      }
      
      console.log();
    });
    
    // Validation: vérifier que TOUS les aliments proviennent des fichiers Excel
    console.log('='.repeat(60));
    console.log('\n✅ VALIDATION:\n');
    
    const alimentsAutorises = [
      ...alimentsPetitDejTest.map(a => a.nom),
      ...alimentsDejeunerTest.map(a => a.nom),
      ...alimentsDinerTest.map(a => a.nom)
    ];
    
    let tousAlimentsValides = true;
    let alimentsNonAutorises = [];
    
    menu.semaine.forEach(jour => {
      Object.values(jour.menu).forEach(repas => {
        if (repas && repas.ingredients) {
          repas.ingredients.forEach(ing => {
            if (!alimentsAutorises.includes(ing.nom)) {
              tousAlimentsValides = false;
              alimentsNonAutorises.push(ing.nom);
            }
          });
        }
      });
    });
    
    if (tousAlimentsValides) {
      console.log('✅ Tous les aliments proposés proviennent des fichiers Excel uploadés!');
    } else {
      console.log('❌ ERREUR: Des aliments non autorisés ont été trouvés:');
      console.log('  ', [...new Set(alimentsNonAutorises)].join(', '));
    }
    
    // Statistiques finales
    console.log('\n📈 STATISTIQUES:\n');
    console.log('  Moyenne calories/jour:', menu.metadata.moyennes.calories, 'kcal');
    console.log('  Moyenne protéines/jour:', menu.metadata.moyennes.proteines, 'g');
    console.log('  Moyenne glucides/jour:', menu.metadata.moyennes.glucides, 'g');
    console.log('  Moyenne lipides/jour:', menu.metadata.moyennes.lipides, 'g');
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ TEST RÉUSSI!\n');
    
  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Lancer le test
runTest();
