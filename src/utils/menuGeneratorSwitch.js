/**
 * SWITCH INTELLIGENT ENTRE GÉNÉRATEURS DE MENUS
 * 
 * Ce module détecte automatiquement si le praticien a uploadé des fichiers Excel
 * et choisit le générateur approprié :
 * - Si fichiers Excel uploadés → menuGeneratorFromExcel (STRICT)
 * - Sinon → menuGeneratorOptimise (recettes par défaut)
 */

import { getAllFiles } from './practitionerStorage.js';
import { genererMenuHebdomadaireExcel, regenererRepasExcel } from './menuGeneratorFromExcel.js';
import { genererMenuHebdomadaire as genererMenuDefaut, regenererRepas as regenererRepasDefaut } from './menuGeneratorOptimise.js';

/**
 * Vérifie si le praticien a uploadé des fichiers Excel
 */
function praticionAUploadeFichiers() {
  const files = getAllFiles();
  
  const aFichierPetitDej = files.alimentsPetitDej && files.alimentsPetitDej.data;
  const aFichierDejeuner = files.alimentsDejeuner && files.alimentsDejeuner.data;
  const aFichierDiner = files.alimentsDiner && files.alimentsDiner.data;
  
  const aAuMoinsUnFichier = aFichierPetitDej || aFichierDejeuner || aFichierDiner;
  
  console.log('🔍 Détection fichiers Excel uploadés:');
  console.log('  Petit-déjeuner:', aFichierPetitDej ? '✅' : '❌');
  console.log('  Déjeuner:', aFichierDejeuner ? '✅' : '❌');
  console.log('  Dîner:', aFichierDiner ? '✅' : '❌');
  console.log('  Mode sélectionné:', aAuMoinsUnFichier ? 'EXCEL (Strict)' : 'DÉFAUT (Recettes pré-définies)');
  
  return aAuMoinsUnFichier;
}

/**
 * Génère un menu hebdomadaire en choisissant automatiquement le bon générateur
 */
export async function genererMenuHebdomadaire(profil) {
  const utiliserExcel = praticionAUploadeFichiers();
  
  if (utiliserExcel) {
    console.log('📊 Utilisation des fichiers Excel uploadés par le praticien');
    return await genererMenuHebdomadaireExcel(profil);
  } else {
    console.log('📚 Utilisation des recettes par défaut');
    return genererMenuDefaut(profil);
  }
}

/**
 * Régénère un repas en choisissant automatiquement le bon générateur
 */
export async function regenererRepas(jourIndex, typeRepas, profil) {
  const utiliserExcel = praticionAUploadeFichiers();
  
  if (utiliserExcel) {
    console.log('📊 Régénération depuis fichiers Excel');
    return await regenererRepasExcel(jourIndex, typeRepas, profil);
  } else {
    console.log('📚 Régénération depuis recettes par défaut');
    return regenererRepasDefaut(jourIndex, typeRepas, profil);
  }
}

/**
 * Obtient des informations sur le mode actuel
 */
export function getModeInfo() {
  const utiliserExcel = praticionAUploadeFichiers();
  const files = getAllFiles();
  
  return {
    mode: utiliserExcel ? 'excel' : 'default',
    modeLabel: utiliserExcel ? 'Fichiers Excel du praticien' : 'Recettes par défaut',
    fichiers: {
      petitDejeuner: !!files.alimentsPetitDej,
      dejeuner: !!files.alimentsDejeuner,
      diner: !!files.alimentsDiner
    },
    description: utiliserExcel 
      ? 'Les menus sont générés UNIQUEMENT avec les aliments autorisés par le praticien'
      : 'Les menus sont générés avec la base de recettes par défaut'
  };
}
