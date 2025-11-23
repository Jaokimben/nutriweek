/**
 * Parser pour la base de données CIQUAL
 * Format: ALIM_CODE;FOOD_LABEL;indic_combl;LB;UB;MB;CONST_CODE;CONST_LABEL
 */

import { findCiqualCodeFromMapping } from './nutritionMappings';

/**
 * Charge et parse la base de données CIQUAL
 * @returns {Promise<Object>} Map d'aliments avec leurs valeurs nutritionnelles
 */
export const loadCIQUAL = async () => {
  try {
    console.log('🔍 Tentative de chargement de /ciqual_lite.csv (version optimisée)...');
    const response = await fetch('/ciqual_lite.csv');
    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log(`📄 Fichier chargé: ${(text.length / 1024 / 1024).toFixed(2)} MB`);
    
    const parsed = parseCIQUAL(text);
    console.log(`✅ Parsing terminé: ${Object.keys(parsed).length} aliments`);
    
    return parsed;
  } catch (error) {
    console.error('❌ Erreur lors du chargement de CIQUAL:', error);
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
  // Normaliser et nettoyer le terme de recherche
  const normalizedSearch = searchTerm.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
    .replace(/\b[dl]'\s*/g, "") // Enlever d' et l' (d'olive → olive)
    .replace(/[^\w\s]/g, " ") // Remplacer ponctuation par espaces
    .replace(/\s+/g, " ") // Consolider espaces multiples
    .trim();
  
  return Object.values(ciqualData).filter(aliment => {
    // Normaliser et nettoyer le nom de l'aliment
    const normalizedNom = aliment.nom.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
      .replace(/\uFFFD/g, "") // Enlever caractères de remplacement UTF-8 (�)
      .replace(/\b[dl]'\s*/g, "") // Enlever d' et l' (d'olive → olive)
      .replace(/[^\w\s]/g, " ") // Remplacer ponctuation par espaces
      .replace(/\s+/g, " ") // Consolider espaces multiples
      .trim();
    
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
  console.log('\n🔬 [calculateRecipeNutrition] DÉBUT (CIQUAL)');
  console.log(`📝 [calculateRecipeNutrition] ${ingredients?.length || 0} ingrédients:`, ingredients?.map(i => i.nom));
  console.log(`📚 [calculateRecipeNutrition] ciqualData: ${ciqualData ? Object.keys(ciqualData).length + ' aliments' : 'NULL'}`);
  
  if (!ciqualData || Object.keys(ciqualData).length === 0) {
    console.warn('⚠️ [calculateRecipeNutrition] ciqualData est vide ou null, retour valeurs par défaut');
    return { calories: 0, proteines: 0, lipides: 0, glucides: 0 };
  }
  
  let totalCalories = 0;
  let totalProteines = 0;
  let totalLipides = 0;
  let totalGlucides = 0;
  
  const details = []; // Pour debug
  
  ingredients.forEach(ing => {
    // ÉTAPE 1: Chercher d'abord dans les mappings manuels (264 mappings précis)
    const ciqualCode = findCiqualCodeFromMapping(ing.nom);
    let aliment = null;
    let mappingUsed = 'none';
    
    if (ciqualCode && ciqualData[ciqualCode]) {
      // Mapping trouvé !
      aliment = ciqualData[ciqualCode];
      mappingUsed = 'manual-mapping';
      console.log(`✅ [CIQUAL] Mapping manuel: "${ing.nom}" → code ${ciqualCode} → "${aliment.nom}"`);
    } else {
      // ÉTAPE 2: Fallback sur l'ancienne méthode (amélioration + recherche)
      const nomAmeliore = improveIngredientName(ing.nom);
      const matches = searchAliment(ciqualData, nomAmeliore);
      
      if (matches.length > 0) {
        aliment = matches[0]; // Prendre le premier match
        mappingUsed = 'fuzzy-search';
        console.log(`⚠️ [CIQUAL] Recherche floue: "${ing.nom}" → "${nomAmeliore}" → "${aliment.nom}"`);
      }
    }
    
    if (aliment) {
      const quantiteGrammes = convertToGrams(ing.quantite, ing.unite);
      
      // Calculer pour 100g, puis ajuster à la quantité
      const factor = quantiteGrammes / 100;
      
      const ingredientCalories = aliment.nutritions.nrj_kcal ? aliment.nutritions.nrj_kcal * factor : 0;
      const ingredientProteines = aliment.nutritions.proteines_g ? aliment.nutritions.proteines_g * factor : 0;
      const ingredientLipides = aliment.nutritions.lipides_g ? aliment.nutritions.lipides_g * factor : 0;
      const ingredientGlucides = aliment.nutritions.glucides_g ? aliment.nutritions.glucides_g * factor : 0;
      
      // Accumuler
      totalCalories += ingredientCalories;
      totalProteines += ingredientProteines;
      totalLipides += ingredientLipides;
      totalGlucides += ingredientGlucides;
      
      // Log pour debug
      details.push({
        original: ing.nom,
        code: ciqualCode || 'fuzzy',
        method: mappingUsed,
        found: aliment.nom,
        quantite: `${quantiteGrammes}g`,
        calories: Math.round(ingredientCalories),
        kcalPer100g: aliment.nutritions.nrj_kcal
      });
    } else {
      console.warn(`❌ [CIQUAL] Aliment non trouvé: "${ing.nom}"`);
      details.push({
        original: ing.nom,
        method: 'not-found',
        found: 'NON TROUVÉ',
        quantite: convertToGrams(ing.quantite, ing.unite) + 'g',
        calories: 0
      });
    }
  });
  
  const result = {
    calories: Math.round(totalCalories),
    proteines: parseFloat(totalProteines.toFixed(1)),
    lipides: parseFloat(totalLipides.toFixed(1)),
    glucides: parseFloat(totalGlucides.toFixed(1)),
    details // Pour debug si nécessaire
  };
  
  // Log du détail complet
  console.log('📊 [calculateRecipeNutrition] Détail nutritionnel:', details);
  console.log(`📈 [calculateRecipeNutrition] TOTAL: ${result.calories} kcal | P: ${result.proteines}g | L: ${result.lipides}g | G: ${result.glucides}g`);
  console.log('✅ [calculateRecipeNutrition] Objet retourné:', result);
  
  return result;
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
 * IMPORTANT: Privilégier les aliments CUITS pour les céréales et légumineuses
 */
export const ingredientMapping = {
  // Légumineuses (TOUJOURS CUITES)
  'lentilles vertes cuites': 'lentille bouillie cuite',
  'lentilles vertes': 'lentille bouillie cuite',
  'lentilles corail': 'lentille bouillie cuite',
  'lentille': 'lentille bouillie cuite',
  'pois chiches cuits': 'pois chiche cuit',
  'pois chiches': 'pois chiche cuit',
  'pois chiche': 'pois chiche cuit',
  'haricots blancs cuits': 'haricot blanc cuit',
  'haricots blancs': 'haricot blanc cuit',
  'haricot blanc': 'haricot blanc cuit',
  
  // Céréales (TOUJOURS CUITES sauf flocons)
  'riz complet': 'riz complet cuit',
  'riz basmati': 'riz thai',
  'riz': 'riz cuit',
  'quinoa': 'quinoa bouilli',
  'flocons d\'avoine': 'flocon avoine',
  'flocons avoine': 'flocon avoine',
  'avoine': 'flocon avoine',
  
  // Légumes (crus sauf mention contraire)
  'tomates cerises': 'tomate cerise',
  'tomates concassées': 'tomate cru',
  'tomates mûres': 'tomate cru',
  'tomates': 'tomate cru',
  'tomate': 'tomate cru',
  'concombre': 'concombre pulpe',
  'courgette': 'courgette pulpe',
  'carotte': 'carotte cru',
  'carottes': 'carotte cru',
  'oignon rouge': 'oignon cru',
  'oignon': 'oignon cru',
  'ail': 'ail cru',
  'épinards frais': 'pinard cru',
  'épinards': 'pinard cru',
  'salade verte': 'laitue cru',
  'mesclun': 'laitue cru',
  
  // Légumes cuits
  'brocoli': 'brocoli cuit',
  'champignons de paris': 'champignon paris',
  'champignons': 'champignon paris',
  
  // Liquides et produits laitiers végétaux
  'lait végétal (soja)': 'lait soja',
  'lait d\'amande': 'lait soja',
  'lait de coco': 'coco lait',
  'lait soja': 'lait soja',
  'yaourt végétal (coco)': 'yaourt soja',
  'crème de soja': 'creme soja',
  'bouillon de légumes': 'bouillon',
  
  // Huiles et graisses
  'huile d\'olive': 'huile olive',
  'huile olive': 'huile olive',
  
  // Fruits
  'banane congelée': 'banane cru',
  'banane': 'banane cru',
  'fruits rouges mélangés': 'fraise cru',
  'fruits rouges congelés': 'fraise cru',
  'fruits rouges': 'fraise cru',
  'myrtilles': 'myrtille cru',
  'fraises': 'fraise cru',
  'fruits frais (kiwi, fraises)': 'fraise cru',
  'avocat': 'avocat cru',
  
  // Fruits secs et graines
  'raisins secs': 'raisin sec',
  'amandes effilées': 'amande',
  'amandes': 'amande',
  'noix de cajou': 'cajou',
  'graines de chia': 'chia graine',
  'graines de lin': 'lin graine',
  'graines de courge': 'cucurbitacees graine',
  'graines de tournesol': 'graine',
  
  // Herbes et épices (quantités négligeables, mais pour précision)
  'persil frais': 'persil',
  'persil': 'persil',
  'basilic frais': 'basilic',
  'basilic': 'basilic',
  'coriandre fraîche': 'coriandre',
  'coriandre': 'coriandre',
  'menthe fraîche': 'menthe',
  'menthe': 'menthe',
  
  // Condiments
  'jus de citron': 'citron',
  'vinaigre balsamique': 'vinaigre',
  'feta': 'feta',
  'olives noires': 'olive noir',
  'miel': 'miel',
  
  // Autres ingrédients
  'flocons d\'avoine': 'flocon avoine',
  'graines de chia': 'chia',
  'graines de lin': 'lin graine',
  'graines de courge': 'courge graine',
  'noix de cajou': 'cajou',
  'lentilles corail': 'lentille bouillie',
  'gingembre frais râpé': 'gingembre',
  'pois chiches cuits': 'pois chiche cuit',
  'poudre de curry': 'curry'
};

/**
 * Améliore le nom de l'ingrédient pour la recherche
 * @param {string} nom - Nom de l'ingrédient
 * @returns {string} Nom amélioré
 */
export const improveIngredientName = (nom) => {
  const nomLower = nom.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Enlever les accents
  
  // Chercher une correspondance exacte d'abord
  if (ingredientMapping[nomLower]) {
    return ingredientMapping[nomLower];
  }
  
  // Chercher une correspondance partielle
  for (const [key, value] of Object.entries(ingredientMapping)) {
    const keyNormalized = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (nomLower.includes(keyNormalized) || keyNormalized.includes(nomLower)) {
      return value;
    }
  }
  
  // Si aucun mapping trouvé, essayer de détecter si c'est cuit ou cru
  if (nomLower.includes('cuit') || nomLower.includes('bouilli')) {
    return nom; // Garder tel quel si déjà marqué comme cuit
  }
  
  return nom;
};
