/**
 * Parser pour le fichier aliments_simple.csv
 * Version simplifiée avec mapping intelligent
 */

import { findWithManualMapping } from './alimentMapper';

/**
 * Charge et parse le fichier aliments_simple.csv
 * @returns {Promise<Object>} Map d'aliments
 */
export const loadAlimentsSimple = async () => {
  try {
    console.log('🔍 Chargement aliments_simple.csv...');
    const response = await fetch('/aliments_simple.csv');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log(`📄 Fichier chargé: ${text.length} caractères`);
    
    const aliments = parseAlimentsSimple(text);
    console.log(`✅ ${aliments.length} aliments chargés`);
    
    return aliments;
  } catch (error) {
    console.error('❌ Erreur chargement aliments_simple.csv:', error);
    return [];
  }
};

/**
 * Parse le CSV simplifié
 * @param {string} csvText - Contenu du CSV
 * @returns {Array} Liste d'aliments
 */
const parseAlimentsSimple = (csvText) => {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];
  
  // Lire l'en-tête
  const header = lines[0].split(',').map(h => h.trim());
  
  const aliments = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parser avec gestion des guillemets
    const values = parseCSVLine(line);
    
    if (values.length < header.length) continue;
    
    const aliment = {};
    header.forEach((col, index) => {
      let value = values[index]?.trim() || '';
      
      // Nettoyer les guillemets
      value = value.replace(/^"|"$/g, '');
      
      // Convertir en nombre si nécessaire
      if (index > 0) {
        // Remplacer les valeurs manquantes par 0
        if (!value || value === '-' || value === 'NaN' || value.trim() === '' || 
            value.toLowerCase().includes('traces') || value.startsWith('<')) {
          value = 0;
        } else {
          // Nettoyer et convertir
          value = value.replace(',', '.'); // Virgule européenne → point
          const num = parseFloat(value);
          if (!isNaN(num)) {
            value = num;
          } else {
            value = 0;
          }
        }
      }
      
      aliment[col] = value;
    });
    
    // Vérifier que l'aliment a un nom valide
    if (aliment.alim_nom_fr && aliment.alim_nom_fr !== 'NaN' && aliment.alim_nom_fr !== '') {
      aliments.push(aliment);
    }
  }
  
  return aliments;
};

/**
 * Parse une ligne CSV avec gestion des virgules dans les guillemets
 * @param {string} line - Ligne CSV
 * @returns {Array<string>} Valeurs
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
};

/**
 * Calcule les valeurs nutritionnelles d'une recette avec le système de mapping
 * @param {Array} ingredients - Liste des ingrédients
 * @param {Array} alimentsDB - Base de données d'aliments
 * @returns {Object} Valeurs nutritionnelles
 */
export const calculateRecipeNutritionSimple = (ingredients, alimentsDB) => {
  console.log(`🔬 Calcul nutrition avec ${ingredients?.length || 0} ingrédients`);
  console.log(`📚 Base de données: ${alimentsDB?.length || 0} aliments`);
  
  if (!alimentsDB || alimentsDB.length === 0) {
    console.warn('⚠️ Base de données vide');
    return { calories: 0, proteines: 0, lipides: 0, glucides: 0 };
  }
  
  // Créer un objet pour la recherche plus facile
  const alimentsMap = {};
  alimentsDB.forEach(aliment => {
    if (aliment.alim_nom_fr) {
      alimentsMap[aliment.alim_nom_fr] = aliment;
    }
  });
  
  let totalCalories = 0;
  let totalProteines = 0;
  let totalLipides = 0;
  let totalGlucides = 0;
  
  const details = [];
  
  ingredients.forEach(ing => {
    console.log(`\n🔍 Recherche: "${ing.nom}"`);
    
    // Utiliser le système de mapping intelligent
    const result = findWithManualMapping(ing.nom, alimentsMap);
    
    if (result) {
      const aliment = result.aliment;
      const quantiteGrammes = convertToGrams(ing.quantite, ing.unite);
      
      // Extraire les valeurs nutritionnelles (pour 100g)
      const energieKey = Object.keys(aliment).find(k => k.includes('Energie') || k.includes('kcal'));
      const proteinesKey = Object.keys(aliment).find(k => k.includes('Protéines') || k.includes('Prot'));
      const lipidesKey = Object.keys(aliment).find(k => k.includes('Lipides'));
      const glucidesKey = Object.keys(aliment).find(k => k.includes('Glucides'));
      
      let energiePer100g = aliment[energieKey] || 0;
      let proteinesPer100g = aliment[proteinesKey] || 0;
      let lipidesPer100g = aliment[lipidesKey] || 0;
      let glucidesPer100g = aliment[glucidesKey] || 0;
      
      // Si l'énergie est manquante mais on a les macros, on peut l'estimer
      if ((energiePer100g === 0 || energiePer100g === '-' || isNaN(energiePer100g)) && 
          (proteinesPer100g > 0 || lipidesPer100g > 0 || glucidesPer100g > 0)) {
        // Formule : Prot * 4 + Lip * 9 + Gluc * 4
        energiePer100g = (proteinesPer100g * 4) + (lipidesPer100g * 9) + (glucidesPer100g * 4);
        console.log(`  ⚠️ Énergie estimée: ${energiePer100g.toFixed(0)} kcal`);
      }
      
      // Nettoyer les valeurs (convertir '-' en 0)
      energiePer100g = parseFloat(energiePer100g) || 0;
      proteinesPer100g = parseFloat(proteinesPer100g) || 0;
      lipidesPer100g = parseFloat(lipidesPer100g) || 0;
      glucidesPer100g = parseFloat(glucidesPer100g) || 0;
      
      // Calculer pour la quantité demandée
      const factor = quantiteGrammes / 100;
      
      const cal = energiePer100g * factor;
      const prot = proteinesPer100g * factor;
      const lip = lipidesPer100g * factor;
      const gluc = glucidesPer100g * factor;
      
      totalCalories += cal;
      totalProteines += prot;
      totalLipides += lip;
      totalGlucides += gluc;
      
      console.log(`  ✅ ${aliment.alim_nom_fr}`);
      console.log(`  📊 ${quantiteGrammes}g = ${cal.toFixed(0)} kcal`);
      
      details.push({
        ingredient: ing.nom,
        trouve: aliment.alim_nom_fr,
        quantite: quantiteGrammes,
        calories: Math.round(cal),
        score: result.score
      });
    } else {
      console.warn(`  ❌ Non trouvé: "${ing.nom}"`);
      details.push({
        ingredient: ing.nom,
        trouve: 'NON TROUVÉ',
        quantite: convertToGrams(ing.quantite, ing.unite),
        calories: 0
      });
    }
  });
  
  console.log(`\n📊 TOTAL: ${Math.round(totalCalories)} kcal | P: ${totalProteines.toFixed(1)}g | L: ${totalLipides.toFixed(1)}g | G: ${totalGlucides.toFixed(1)}g`);
  
  return {
    calories: Math.round(totalCalories),
    proteines: parseFloat(totalProteines.toFixed(1)),
    lipides: parseFloat(totalLipides.toFixed(1)),
    glucides: parseFloat(totalGlucides.toFixed(1)),
    details
  };
};

/**
 * Convertit différentes unités en grammes
 * @param {number} quantite - Quantité
 * @param {string} unite - Unité
 * @returns {number} Quantité en grammes
 */
const convertToGrams = (quantite, unite) => {
  const uniteClean = unite.toLowerCase();
  
  // Grammes
  if (uniteClean.includes('g') && !uniteClean.includes('kg')) {
    return quantite;
  }
  
  // Millilitres (approximation: 1ml = 1g)
  if (uniteClean.includes('ml')) {
    return quantite;
  }
  
  // Cuillères à soupe (~15g)
  if (uniteClean.includes('soupe')) {
    return quantite * 15;
  }
  
  // Cuillères à café (~5g)
  if (uniteClean.includes('café')) {
    return quantite * 5;
  }
  
  // Gousses d'ail (~5g)
  if (uniteClean.includes('gousse')) {
    return quantite * 5;
  }
  
  // Fruits moyens (~120g)
  if (uniteClean.includes('moyen')) {
    return quantite * 120;
  }
  
  // Branches d'herbes (~2g)
  if (uniteClean.includes('branche')) {
    return quantite * 2;
  }
  
  return quantite;
};
