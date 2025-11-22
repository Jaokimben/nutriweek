/**
 * Parser pour la base de données CIQUAL
 * Format: ALIM_CODE;FOOD_LABEL;indic_combl;LB;UB;MB;CONST_CODE;CONST_LABEL
 */

/**
 * Charge et parse la base de données CIQUAL
 * @returns {Promise<Object>} Map d'aliments avec leurs valeurs nutritionnelles
 */
export const loadCIQUAL = async () => {
  try {
    const response = await fetch('/ciqual.csv');
    const text = await response.text();
    
    return parseCIQUAL(text);
  } catch (error) {
    console.error('Erreur lors du chargement de CIQUAL:', error);
    return {};
  }
};

/**
 * Parse le contenu CSV de CIQUAL
 * @param {string} csvText - Contenu du CSV
 * @returns {Object} Map d'aliments
 */
const parseCIQUAL = (csvText) => {
  const lines = csvText.split('\n');
  const alimentsMap = {};
  
  // Ignorer la première ligne (header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Remplacer les virgules par des points pour les nombres
    const cleanLine = line.replace(/,/g, '.');
    const parts = cleanLine.split(';');
    
    if (parts.length < 8) continue;
    
    const [alimCode, foodLabel, , , , mb, , constLabel] = parts;
    
    // Créer l'entrée pour cet aliment s'il n'existe pas
    if (!alimentsMap[alimCode]) {
      alimentsMap[alimCode] = {
        code: alimCode,
        nom: foodLabel.trim(),
        nutritions: {}
      };
    }
    
    // Ajouter la valeur nutritionnelle
    const value = parseFloat(mb) || 0;
    alimentsMap[alimCode].nutritions[constLabel] = value;
  }
  
  return alimentsMap;
};

/**
 * Recherche un aliment par nom (recherche partielle)
 * @param {Object} ciqualData - Données CIQUAL
 * @param {string} searchTerm - Terme de recherche
 * @returns {Array} Liste d'aliments correspondants
 */
export const searchAliment = (ciqualData, searchTerm) => {
  const normalizedSearch = searchTerm.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Enlever les accents
  
  return Object.values(ciqualData).filter(aliment => {
    const normalizedNom = aliment.nom.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    return normalizedNom.includes(normalizedSearch);
  });
};

/**
 * Calcule les calories d'une recette basée sur les ingrédients
 * @param {Array} ingredients - Liste des ingrédients avec quantités
 * @param {Object} ciqualData - Données CIQUAL
 * @returns {Object} Valeurs nutritionnelles totales
 */
export const calculateRecipeNutrition = (ingredients, ciqualData) => {
  let totalCalories = 0;
  let totalProteines = 0;
  let totalLipides = 0;
  let totalGlucides = 0;
  
  ingredients.forEach(ing => {
    // Rechercher l'aliment dans CIQUAL
    const matches = searchAliment(ciqualData, ing.nom);
    
    if (matches.length > 0) {
      const aliment = matches[0]; // Prendre le premier match
      const quantiteGrammes = convertToGrams(ing.quantite, ing.unite);
      
      // Calculer pour 100g, puis ajuster à la quantité
      const factor = quantiteGrammes / 100;
      
      // Calories
      if (aliment.nutritions.nrj_kcal) {
        totalCalories += aliment.nutritions.nrj_kcal * factor;
      }
      
      // Protéines
      if (aliment.nutritions.proteines_g) {
        totalProteines += aliment.nutritions.proteines_g * factor;
      }
      
      // Lipides
      if (aliment.nutritions.lipides_g) {
        totalLipides += aliment.nutritions.lipides_g * factor;
      }
      
      // Glucides
      if (aliment.nutritions.glucides_g) {
        totalGlucides += aliment.nutritions.glucides_g * factor;
      }
    } else {
      console.warn(`Aliment non trouvé dans CIQUAL: ${ing.nom}`);
    }
  });
  
  return {
    calories: Math.round(totalCalories),
    proteines: parseFloat(totalProteines.toFixed(1)),
    lipides: parseFloat(totalLipides.toFixed(1)),
    glucides: parseFloat(totalGlucides.toFixed(1))
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
  
  // Si c'est déjà en grammes
  if (uniteClean.includes('g') && !uniteClean.includes('kg')) {
    // Extraire le nombre si format "80 g (sec)"
    if (uniteClean.includes('(sec)')) {
      return quantite;
    }
    return quantite;
  }
  
  // Millilitres (approximation: 1ml = 1g pour l'eau et liquides similaires)
  if (uniteClean.includes('ml')) {
    return quantite;
  }
  
  // Cuillères à soupe (environ 15g)
  if (uniteClean.includes('c. à soupe') || uniteClean.includes('soupe')) {
    return quantite * 15;
  }
  
  // Cuillères à café (environ 5g)
  if (uniteClean.includes('c. à café') || uniteClean.includes('café')) {
    return quantite * 5;
  }
  
  // Gousses d'ail (environ 5g par gousse)
  if (uniteClean.includes('gousse')) {
    return quantite * 5;
  }
  
  // Fruits moyens (banane ~120g, pomme ~150g)
  if (uniteClean.includes('moyenne') || uniteClean.includes('moyen')) {
    return quantite * 120; // Moyenne approximative
  }
  
  // Branches d'herbes (environ 2g)
  if (uniteClean.includes('branche')) {
    return quantite * 2;
  }
  
  // Par défaut, retourner la quantité telle quelle
  return quantite;
};

/**
 * Mapping des noms d'ingrédients vers des termes de recherche CIQUAL
 */
export const ingredientMapping = {
  // Légumineuses
  'lentilles vertes': 'lentille bouillie',
  'lentilles corail': 'lentille bouillie',
  'lentille': 'lentille bouillie',
  'pois chiches': 'pois chiche cuit',
  'haricots blancs': 'haricot blanc cuit',
  
  // Céréales
  'riz complet': 'riz complet cuit',
  'riz basmati': 'riz cuit',
  'quinoa': 'quinoa cuit',
  'flocons d\'avoine': 'avoine flocon',
  
  // Légumes
  'tomates': 'tomate crue',
  'concombre': 'concombre cru',
  'courgette': 'courgette crue',
  'carotte': 'carotte crue',
  'oignon': 'oignon cru',
  'ail': 'ail cru',
  
  // Liquides
  'lait d\'amande': 'lait soja',
  'lait de coco': 'lait coco',
  'bouillon de légumes': 'bouillon légume',
  
  // Huiles et graisses
  'huile d\'olive': 'huile olive',
  
  // Herbes et épices
  'persil': 'persil frais',
  'basilic': 'basilic frais',
  'coriandre': 'coriandre fraîche'
};

/**
 * Améliore le nom de l'ingrédient pour la recherche
 * @param {string} nom - Nom de l'ingrédient
 * @returns {string} Nom amélioré
 */
export const improveIngredientName = (nom) => {
  const nomLower = nom.toLowerCase();
  
  // Chercher dans le mapping
  for (const [key, value] of Object.entries(ingredientMapping)) {
    if (nomLower.includes(key)) {
      return value;
    }
  }
  
  return nom;
};
