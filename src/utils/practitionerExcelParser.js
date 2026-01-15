/**
 * 🩺 PARSER EXCEL PRATICIEN
 * 
 * Parse les fichiers Excel uploadés par les praticiens pour extraire
 * les aliments autorisés et générer des menus personnalisés.
 * 
 * Supporte:
 * - Fichiers Excel (.xls, .xlsx)
 * - Fichiers CSV
 * - Formats variés de colonnes
 */

import * as XLSX from 'xlsx';
import { getAllFiles, isUsingUploadedFiles } from './practitionerStorage.js';

/**
 * Colonnes possibles dans les fichiers Excel
 */
const COLUMN_MAPPINGS = {
  nom: ['nom', 'aliment', 'name', 'produit', 'ingredient'],
  calories: ['calories', 'energie', 'kcal', 'energy', 'cal'],
  proteines: ['proteines', 'protéines', 'protein', 'proteins'],
  glucides: ['glucides', 'carbs', 'carbohydrates', 'sucres'],
  lipides: ['lipides', 'graisses', 'fat', 'fats', 'matières grasses'],
  categorie: ['categorie', 'catégorie', 'category', 'type', 'groupe']
};

/**
 * Normalise un nom de colonne pour le matching
 */
function normalizeColumnName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Trouve le nom de colonne correspondant dans l'Excel
 */
function findColumnName(headers, possibleNames) {
  const normalizedHeaders = headers.map(h => ({
    original: h,
    normalized: normalizeColumnName(h)
  }));
  
  for (const possibleName of possibleNames) {
    const normalizedPossible = normalizeColumnName(possibleName);
    const match = normalizedHeaders.find(h => 
      h.normalized.includes(normalizedPossible) || 
      normalizedPossible.includes(h.normalized)
    );
    if (match) return match.original;
  }
  
  return null;
}

/**
 * Parse un fichier Excel en base64
 */
async function parseExcelFromBase64(base64Data) {
  try {
    // Retirer le préfixe data:...;base64, si présent
    const base64Content = base64Data.includes(',') 
      ? base64Data.split(',')[1] 
      : base64Data;
    
    // Convertir base64 en buffer
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Lire le fichier Excel
    const workbook = XLSX.read(bytes, { type: 'array' });
    
    // Prendre la première feuille
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convertir en JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    return jsonData;
  } catch (error) {
    console.error('❌ Erreur parsing Excel:', error);
    throw new Error(`Impossible de parser le fichier Excel: ${error.message}`);
  }
}

/**
 * Parse et structure les données d'un fichier Excel
 */
async function parseAlimentsExcel(excelData) {
  if (!excelData || excelData.length < 2) {
    throw new Error('Fichier Excel vide ou invalide');
  }
  
  // Première ligne = en-têtes
  const headers = excelData[0];
  
  // Trouver les colonnes correspondantes
  const colIndexes = {
    nom: headers.findIndex(h => findColumnName([h], COLUMN_MAPPINGS.nom)),
    calories: headers.findIndex(h => findColumnName([h], COLUMN_MAPPINGS.calories)),
    proteines: headers.findIndex(h => findColumnName([h], COLUMN_MAPPINGS.proteines)),
    glucides: headers.findIndex(h => findColumnName([h], COLUMN_MAPPINGS.glucides)),
    lipides: headers.findIndex(h => findColumnName([h], COLUMN_MAPPINGS.lipides)),
    categorie: headers.findIndex(h => findColumnName([h], COLUMN_MAPPINGS.categorie))
  };
  
  // Vérifier que les colonnes essentielles existent
  if (colIndexes.nom === -1) {
    throw new Error('Colonne "nom" ou "aliment" introuvable dans le fichier Excel');
  }
  
  // Parser les lignes de données
  const aliments = [];
  for (let i = 1; i < excelData.length; i++) {
    const row = excelData[i];
    
    // Ignorer les lignes vides
    if (!row || row.length === 0 || !row[colIndexes.nom]) continue;
    
    const aliment = {
      nom: String(row[colIndexes.nom]).trim(),
      energie: colIndexes.calories !== -1 ? parseFloat(row[colIndexes.calories]) || 0 : 0,
      proteines: colIndexes.proteines !== -1 ? parseFloat(row[colIndexes.proteines]) || 0 : 0,
      glucides: colIndexes.glucides !== -1 ? parseFloat(row[colIndexes.glucides]) || 0 : 0,
      lipides: colIndexes.lipides !== -1 ? parseFloat(row[colIndexes.lipides]) || 0 : 0,
      categorie: colIndexes.categorie !== -1 ? String(row[colIndexes.categorie] || '').trim() : 'autre',
      source: 'praticien'
    };
    
    // Valider que l'aliment a au moins un nom
    if (aliment.nom && aliment.nom.length > 0) {
      aliments.push(aliment);
    }
  }
  
  console.log(`✅ ${aliments.length} aliments parsés depuis Excel praticien`);
  
  return aliments;
}

/**
 * Parse un fichier Excel (usage public)
 * @param {string} base64Data - Données base64 du fichier
 * @returns {Array} Liste d'aliments
 */
export async function parseExcelFile(base64Data) {
  try {
    const excelData = await parseExcelFromBase64(base64Data);
    return await parseAlimentsExcel(excelData);
  } catch (error) {
    console.error('❌ Erreur parsing fichier Excel:', error);
    return [];
  }
}

/**
 * Charge tous les aliments des fichiers Excel praticien
 */
export async function loadAlimentsFromPractitioner() {
  try {
    // Vérifier si les fichiers uploadés doivent être utilisés
    const files = getAllFiles();
    
    if (!isUsingUploadedFiles()) {
      console.log('ℹ️ Fichiers praticien non activés, utilisation des données par défaut');
      return null;
    }
    
    const alimentsByRepas = {
      petitDejeuner: [],
      dejeuner: [],
      diner: []
    };
    
    // Parser petit-déjeuner
    if (files.alimentsPetitDej && files.alimentsPetitDej.data) {
      const excelData = await parseExcelFromBase64(files.alimentsPetitDej.data);
      alimentsByRepas.petitDejeuner = await parseAlimentsExcel(excelData);
      console.log(`✅ Petit-déjeuner: ${alimentsByRepas.petitDejeuner.length} aliments`);
    }
    
    // Parser déjeuner
    if (files.alimentsDejeuner && files.alimentsDejeuner.data) {
      const excelData = await parseExcelFromBase64(files.alimentsDejeuner.data);
      alimentsByRepas.dejeuner = await parseAlimentsExcel(excelData);
      console.log(`✅ Déjeuner: ${alimentsByRepas.dejeuner.length} aliments`);
    }
    
    // Parser dîner
    if (files.alimentsDiner && files.alimentsDiner.data) {
      const excelData = await parseExcelFromBase64(files.alimentsDiner.data);
      alimentsByRepas.diner = await parseAlimentsExcel(excelData);
      console.log(`✅ Dîner: ${alimentsByRepas.diner.length} aliments`);
    }
    
    // Vérifier qu'il y a au moins des aliments
    const totalAliments = 
      alimentsByRepas.petitDejeuner.length + 
      alimentsByRepas.dejeuner.length + 
      alimentsByRepas.diner.length;
    
    if (totalAliments === 0) {
      console.warn('⚠️ Aucun aliment trouvé dans les fichiers praticien');
      return null;
    }
    
    console.log(`✅ Total: ${totalAliments} aliments chargés depuis fichiers praticien`);
    
    return alimentsByRepas;
    
  } catch (error) {
    console.error('❌ Erreur chargement aliments praticien:', error);
    return null;
  }
}

/**
 * Génère des recettes automatiques à partir des aliments du praticien
 */
export function generateRecipesFromAliments(alimentsByRepas) {
  const recipes = {
    petitDejeuner: [],
    dejeuner: [],
    diner: []
  };
  
  // Générer recettes petit-déjeuner
  if (alimentsByRepas.petitDejeuner.length > 0) {
    const aliments = alimentsByRepas.petitDejeuner;
    
    // Stratégie: Combiner 2-4 aliments pour créer des recettes équilibrées
    for (let i = 0; i < Math.min(aliments.length, 10); i++) {
      const aliment1 = aliments[i];
      const aliment2 = aliments[(i + 1) % aliments.length];
      const aliment3 = aliments[(i + 2) % aliments.length];
      
      // Créer une recette combinée
      const ingredients = [
        { nom: aliment1.nom, quantite: 100, unite: 'g' },
        { nom: aliment2.nom, quantite: 80, unite: 'g' },
        { nom: aliment3.nom, quantite: 50, unite: 'g' }
      ];
      
      // Calculer nutrition totale
      const nutrition = {
        calories: Math.round(aliment1.energie + aliment2.energie * 0.8 + aliment3.energie * 0.5),
        proteines: Math.round((aliment1.proteines + aliment2.proteines * 0.8 + aliment3.proteines * 0.5) * 10) / 10,
        glucides: Math.round((aliment1.glucides + aliment2.glucides * 0.8 + aliment3.glucides * 0.5) * 10) / 10,
        lipides: Math.round((aliment1.lipides + aliment2.lipides * 0.8 + aliment3.lipides * 0.5) * 10) / 10
      };
      
      recipes.petitDejeuner.push({
        id: `pd_praticien_${i}`,
        nom: `${aliment1.nom} et ${aliment2.nom}`,
        type: 'petit_dejeuner',
        ingredients,
        nutrition,
        preparation: 'Recette générée automatiquement depuis les aliments du praticien.',
        tags: ['praticien', 'personnalisé'],
        source: 'praticien'
      });
    }
  }
  
  // Générer recettes déjeuner
  if (alimentsByRepas.dejeuner.length > 0) {
    const aliments = alimentsByRepas.dejeuner;
    
    for (let i = 0; i < Math.min(aliments.length, 10); i++) {
      const aliment1 = aliments[i];
      const aliment2 = aliments[(i + 1) % aliments.length];
      const aliment3 = aliments[(i + 2) % aliments.length];
      const aliment4 = aliments[(i + 3) % aliments.length];
      
      const ingredients = [
        { nom: aliment1.nom, quantite: 150, unite: 'g' },
        { nom: aliment2.nom, quantite: 120, unite: 'g' },
        { nom: aliment3.nom, quantite: 100, unite: 'g' },
        { nom: aliment4.nom, quantite: 80, unite: 'g' }
      ];
      
      const nutrition = {
        calories: Math.round(aliment1.energie * 1.5 + aliment2.energie * 1.2 + aliment3.energie + aliment4.energie * 0.8),
        proteines: Math.round((aliment1.proteines * 1.5 + aliment2.proteines * 1.2 + aliment3.proteines + aliment4.proteines * 0.8) * 10) / 10,
        glucides: Math.round((aliment1.glucides * 1.5 + aliment2.glucides * 1.2 + aliment3.glucides + aliment4.glucides * 0.8) * 10) / 10,
        lipides: Math.round((aliment1.lipides * 1.5 + aliment2.lipides * 1.2 + aliment3.lipides + aliment4.lipides * 0.8) * 10) / 10
      };
      
      recipes.dejeuner.push({
        id: `dej_praticien_${i}`,
        nom: `${aliment1.nom}, ${aliment2.nom} et légumes`,
        type: 'dejeuner',
        ingredients,
        nutrition,
        preparation: 'Recette générée automatiquement depuis les aliments du praticien.',
        tags: ['praticien', 'personnalisé', 'complet'],
        source: 'praticien'
      });
    }
  }
  
  // Générer recettes dîner
  if (alimentsByRepas.diner.length > 0) {
    const aliments = alimentsByRepas.diner;
    
    for (let i = 0; i < Math.min(aliments.length, 10); i++) {
      const aliment1 = aliments[i];
      const aliment2 = aliments[(i + 1) % aliments.length];
      const aliment3 = aliments[(i + 2) % aliments.length];
      
      const ingredients = [
        { nom: aliment1.nom, quantite: 120, unite: 'g' },
        { nom: aliment2.nom, quantite: 100, unite: 'g' },
        { nom: aliment3.nom, quantite: 80, unite: 'g' }
      ];
      
      const nutrition = {
        calories: Math.round(aliment1.energie * 1.2 + aliment2.energie + aliment3.energie * 0.8),
        proteines: Math.round((aliment1.proteines * 1.2 + aliment2.proteines + aliment3.proteines * 0.8) * 10) / 10,
        glucides: Math.round((aliment1.glucides * 1.2 + aliment2.glucides + aliment3.glucides * 0.8) * 10) / 10,
        lipides: Math.round((aliment1.lipides * 1.2 + aliment2.lipides + aliment3.lipides * 0.8) * 10) / 10
      };
      
      recipes.diner.push({
        id: `din_praticien_${i}`,
        nom: `${aliment1.nom} et ${aliment2.nom}`,
        type: 'diner',
        ingredients,
        nutrition,
        preparation: 'Recette générée automatiquement depuis les aliments du praticien.',
        tags: ['praticien', 'personnalisé', 'léger'],
        source: 'praticien'
      });
    }
  }
  
  const totalRecipes = recipes.petitDejeuner.length + recipes.dejeuner.length + recipes.diner.length;
  console.log(`✅ ${totalRecipes} recettes générées depuis aliments praticien`);
  
  return recipes;
}

export default {
  loadAlimentsFromPractitioner,
  generateRecipesFromAliments,
  parseExcelFromBase64,
  parseAlimentsExcel
};
