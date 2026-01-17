/**
 * GÉNÉRATEUR DE MENUS STRICTEMENT BASÉ SUR LES FICHIERS EXCEL PRATICIEN
 * 
 * ⚠️ RÈGLE ABSOLUE : AUCUN aliment ne doit être ajouté en dehors des fichiers Excel
 * 
 * Comportement :
 * - Si fichiers Excel uploadés → Génération stricte depuis Excel
 * - Sinon → ERREUR - Refus de générer (pas de mode par défaut)
 */

import { getAllFiles } from './practitionerStorage.js';
import { genererMenuHebdomadaireExcel, regenererRepasExcel } from './menuGeneratorFromExcel.js';

/**
 * Vérifie si le praticien a uploadé des fichiers Excel
 * ⚠️ OBLIGATOIRE - Sans fichiers Excel, la génération est REFUSÉE
 */
function verifierFichiersExcelPresents() {
  const files = getAllFiles();
  
  const aFichierPetitDej = files.alimentsPetitDej && files.alimentsPetitDej.data;
  const aFichierDejeuner = files.alimentsDejeuner && files.alimentsDejeuner.data;
  const aFichierDiner = files.alimentsDiner && files.alimentsDiner.data;
  
  console.log('🔍 Vérification fichiers Excel praticien:');
  console.log('  Petit-déjeuner:', aFichierPetitDej ? '✅' : '❌');
  console.log('  Déjeuner:', aFichierDejeuner ? '✅' : '❌');
  console.log('  Dîner:', aFichierDiner ? '✅' : '❌');
  
  const nbFichiers = [aFichierPetitDej, aFichierDejeuner, aFichierDiner].filter(Boolean).length;
  
  if (nbFichiers === 0) {
    throw new Error(
      '❌ AUCUN FICHIER EXCEL UPLOADÉ\n\n' +
      'Le praticien doit obligatoirement uploader les fichiers Excel contenant les aliments autorisés.\n' +
      'Fichiers requis :\n' +
      '  - alimentsPetitDejeuner.xlsx\n' +
      '  - alimentsDejeuner.xlsx\n' +
      '  - alimentsDiner.xlsx\n\n' +
      'Aucun menu ne peut être généré sans ces fichiers.'
    );
  }
  
  console.log(`✅ ${nbFichiers}/3 fichiers Excel détectés - Génération STRICTE depuis Excel`);
  
  return {
    petitDejeuner: aFichierPetitDej,
    dejeuner: aFichierDejeuner,
    diner: aFichierDiner,
    nbFichiers
  };
}

/**
 * Génère un menu hebdomadaire STRICTEMENT depuis les fichiers Excel
 * ⚠️ REFUSE de générer si aucun fichier Excel n'est présent
 */
export async function genererMenuHebdomadaire(profil) {
  // Vérification obligatoire - lance une erreur si pas de fichiers
  const fichiersPresents = verifierFichiersExcelPresents();
  
  console.log('📊 MODE STRICT ACTIVÉ : Utilisation EXCLUSIVE des fichiers Excel praticien');
  console.log(`   ${fichiersPresents.nbFichiers}/3 fichiers disponibles`);
  console.log('   ⚠️ AUCUN aliment externe ne sera utilisé');
  
  return await genererMenuHebdomadaireExcel(profil);
}

/**
 * Régénère un repas STRICTEMENT depuis les fichiers Excel
 * ⚠️ REFUSE de générer si aucun fichier Excel n'est présent
 */
export async function regenererRepas(jourIndex, typeRepas, profil) {
  // Vérification obligatoire - lance une erreur si pas de fichiers
  verifierFichiersExcelPresents();
  
  console.log('📊 Régénération STRICTE depuis fichiers Excel praticien');
  return await regenererRepasExcel(jourIndex, typeRepas, profil);
}

/**
 * Obtient des informations sur le mode actuel
 * ⚠️ MODE STRICT UNIQUEMENT - Plus de mode par défaut
 */
export function getModeInfo() {
  try {
    const fichiersPresents = verifierFichiersExcelPresents();
    const files = getAllFiles();
    
    return {
      mode: 'excel_strict',
      modeLabel: 'Fichiers Excel du praticien (MODE STRICT)',
      fichiers: {
        petitDejeuner: !!files.alimentsPetitDej,
        dejeuner: !!files.alimentsDejeuner,
        diner: !!files.alimentsDiner
      },
      nbFichiers: fichiersPresents.nbFichiers,
      description: `MODE STRICT ACTIVÉ : Les menus sont générés EXCLUSIVEMENT avec les ${fichiersPresents.nbFichiers} fichiers Excel uploadés. AUCUN aliment externe n'est utilisé.`,
      avertissement: 'Les 3 fichiers Excel doivent être uploadés pour une génération complète.'
    };
  } catch (error) {
    // Si pas de fichiers Excel, retourner info d'erreur
    return {
      mode: 'error',
      modeLabel: 'AUCUN FICHIER EXCEL',
      fichiers: {
        petitDejeuner: false,
        dejeuner: false,
        diner: false
      },
      nbFichiers: 0,
      description: 'GÉNÉRATION IMPOSSIBLE : Aucun fichier Excel uploadé.',
      erreur: error.message,
      avertissement: 'Le praticien doit uploader les fichiers Excel avant toute génération de menu.'
    };
  }
}

/**
 * Vérifie si le système peut générer des menus
 */
export function peutGenererMenus() {
  try {
    verifierFichiersExcelPresents();
    return true;
  } catch (error) {
    return false;
  }
}
