/**
 * API Nutritionnelle Externe - Fallback quand CIQUAL ne trouve pas
 * Utilise Open Food Facts (gratuit, sans clé API)
 */

/**
 * Recherche un aliment dans Open Food Facts
 * @param {string} foodName - Nom de l'aliment
 * @returns {Promise<Object|null>} Données nutritionnelles ou null
 */
export const searchOpenFoodFacts = async (foodName) => {
  try {
    console.log(`🌐 [OpenFoodFacts] Recherche: "${foodName}"`);
    
    // Open Food Facts API (gratuite)
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&json=1&page_size=5`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.warn(`⚠️ [OpenFoodFacts] Erreur HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.products || data.products.length === 0) {
      console.warn(`⚠️ [OpenFoodFacts] Aucun résultat pour "${foodName}"`);
      return null;
    }
    
    // Prendre le premier produit avec données nutritionnelles complètes
    for (const product of data.products) {
      const nutriments = product.nutriments;
      
      if (nutriments && 
          nutriments['energy-kcal_100g'] !== undefined &&
          nutriments['proteins_100g'] !== undefined) {
        
        const result = {
          nom: product.product_name || foodName,
          energie_kcal: nutriments['energy-kcal_100g'] || 0,
          proteines_g: nutriments['proteins_100g'] || 0,
          lipides_g: nutriments['fat_100g'] || 0,
          glucides_g: nutriments['carbohydrates_100g'] || 0,
          source: 'Open Food Facts'
        };
        
        console.log(`✅ [OpenFoodFacts] Trouvé: ${result.nom}`, result);
        return result;
      }
    }
    
    console.warn(`⚠️ [OpenFoodFacts] Pas de données nutritionnelles pour "${foodName}"`);
    return null;
    
  } catch (error) {
    console.error(`❌ [OpenFoodFacts] Erreur:`, error);
    return null;
  }
};

/**
 * Base de données de valeurs nutritionnelles moyennes (pour 100g)
 * Utilisée comme dernier recours si API échoue
 */
const NUTRITION_AVERAGES = {
  // Légumineuses cuites
  'lentille': { energie: 116, proteines: 9, lipides: 0.4, glucides: 20 },
  'pois chiche': { energie: 164, proteines: 9, lipides: 2.6, glucides: 27 },
  'haricot': { energie: 127, proteines: 9, lipides: 0.5, glucides: 23 },
  'fève': { energie: 110, proteines: 8, lipides: 0.5, glucides: 19 },
  
  // Céréales cuites
  'riz complet': { energie: 111, proteines: 2.6, lipides: 0.9, glucides: 23 },
  'riz blanc': { energie: 130, proteines: 2.7, lipides: 0.3, glucides: 28 },
  'quinoa': { energie: 120, proteines: 4.4, lipides: 1.9, glucides: 21 },
  'avoine': { energie: 68, proteines: 2.4, lipides: 1.4, glucides: 12 },
  'flocons': { energie: 68, proteines: 2.4, lipides: 1.4, glucides: 12 },
  
  // Légumes
  'tomate': { energie: 18, proteines: 0.9, lipides: 0.2, glucides: 3.9 },
  'concombre': { energie: 15, proteines: 0.7, lipides: 0.1, glucides: 3.6 },
  'courgette': { energie: 17, proteines: 1.2, lipides: 0.3, glucides: 3.1 },
  'carotte': { energie: 41, proteines: 0.9, lipides: 0.2, glucides: 10 },
  'poivron': { energie: 31, proteines: 1, lipides: 0.3, glucides: 6 },
  'oignon': { energie: 40, proteines: 1.1, lipides: 0.1, glucides: 9 },
  'épinard': { energie: 23, proteines: 2.9, lipides: 0.4, glucides: 3.6 },
  'brocoli': { energie: 34, proteines: 2.8, lipides: 0.4, glucides: 7 },
  
  // Fruits
  'banane': { energie: 89, proteines: 1.1, lipides: 0.3, glucides: 23 },
  'fraise': { energie: 32, proteines: 0.7, lipides: 0.3, glucides: 8 },
  'myrtille': { energie: 57, proteines: 0.7, lipides: 0.3, glucides: 14 },
  'kiwi': { energie: 61, proteines: 1.1, lipides: 0.5, glucides: 15 },
  'fruit': { energie: 50, proteines: 0.8, lipides: 0.2, glucides: 12 }, // Moyenne
  
  // Produits laitiers
  'lait': { energie: 42, proteines: 3.4, lipides: 1, glucides: 5 },
  'yaourt': { energie: 59, proteines: 3.5, lipides: 0.4, glucides: 4.7 },
  'feta': { energie: 264, proteines: 14, lipides: 21, glucides: 4 },
  
  // Huiles et graisses
  'huile': { energie: 884, proteines: 0, lipides: 100, glucides: 0 },
  'olive': { energie: 115, proteines: 0.8, lipides: 11, glucides: 6 },
  
  // Noix et graines
  'noix': { energie: 654, proteines: 15, lipides: 65, glucides: 14 },
  'amande': { energie: 579, proteines: 21, lipides: 50, glucides: 22 },
  'cajou': { energie: 553, proteines: 18, lipides: 44, glucides: 30 },
  'graine': { energie: 500, proteines: 20, lipides: 40, glucides: 20 }, // Moyenne
  
  // Divers
  'miel': { energie: 304, proteines: 0.3, lipides: 0, glucides: 82 },
  'citron': { energie: 29, proteines: 1.1, lipides: 0.3, glucides: 9 },
  'ail': { energie: 149, proteines: 6.4, lipides: 0.5, glucides: 33 },
  'persil': { energie: 36, proteines: 3, lipides: 0.8, glucides: 6 },
  'basilic': { energie: 23, proteines: 3.2, lipides: 0.6, glucides: 2.7 },
  'avocat': { energie: 160, proteines: 2, lipides: 15, glucides: 9 },
  'champignon': { energie: 22, proteines: 3.1, lipides: 0.3, glucides: 3.3 }
};

/**
 * Trouve les valeurs nutritionnelles moyennes
 * @param {string} foodName - Nom de l'aliment
 * @returns {Object|null} Valeurs nutritionnelles ou null
 */
export const getNutritionAverages = (foodName) => {
  const nameLower = foodName.toLowerCase();
  
  // Recherche exacte ou partielle
  for (const [key, values] of Object.entries(NUTRITION_AVERAGES)) {
    if (nameLower.includes(key)) {
      console.log(`📊 [Averages] Valeurs moyennes pour "${foodName}" (basé sur "${key}")`);
      return {
        nom: foodName,
        energie_kcal: values.energie,
        proteines_g: values.proteines,
        lipides_g: values.lipides,
        glucides_g: values.glucides,
        source: 'Valeurs moyennes'
      };
    }
  }
  
  console.warn(`⚠️ [Averages] Pas de valeurs moyennes pour "${foodName}"`);
  return null;
};

/**
 * Recherche nutritionnelle avec fallback en cascade
 * @param {string} foodName - Nom de l'aliment
 * @returns {Promise<Object|null>} Données nutritionnelles
 */
export const findNutritionData = async (foodName) => {
  console.log(`\n🔍 [findNutritionData] Recherche tous azimuts: "${foodName}"`);
  
  // Stratégie 1: Base locale moyenne (instantané)
  const averages = getNutritionAverages(foodName);
  if (averages) {
    return averages;
  }
  
  // Stratégie 2: Open Food Facts API (si échec local)
  // Note: Désactivé par défaut pour éviter trop de requêtes API
  // const apiResult = await searchOpenFoodFacts(foodName);
  // if (apiResult) {
  //   return apiResult;
  // }
  
  console.error(`❌ [findNutritionData] Aucune donnée trouvée pour "${foodName}"`);
  return null;
};
