/**
 * Générateur de liste de courses à partir d'un menu hebdomadaire
 */

/**
 * Catégories d'ingrédients
 */
const CATEGORIES = {
  legumes: {
    icon: '🥬',
    label: 'Légumes',
    keywords: ['tomate', 'concombre', 'courgette', 'carotte', 'poivron', 'oignon', 'ail', 
               'épinard', 'brocoli', 'champignon', 'salade', 'radis', 'aubergine', 'mesclun']
  },
  legumineuses: {
    icon: '🌱',
    label: 'Légumineuses',
    keywords: ['lentille', 'pois chiche', 'haricot', 'fève', 'pois cassé']
  },
  cereales: {
    icon: '🌾',
    label: 'Céréales & Féculents',
    keywords: ['riz', 'quinoa', 'avoine', 'flocon', 'orge', 'boulgour', 'pâte', 'pain']
  },
  fruits: {
    icon: '🍓',
    label: 'Fruits',
    keywords: ['banane', 'fraise', 'myrtille', 'kiwi', 'fruit', 'pomme', 'poire', 'orange']
  },
  laitiers: {
    icon: '🥛',
    label: 'Produits Laitiers & Végétaux',
    keywords: ['lait', 'yaourt', 'fromage', 'feta', 'végétal', 'coco', 'amande', 'soja']
  },
  proteines: {
    icon: '🥩',
    label: 'Protéines',
    keywords: ['viande', 'poulet', 'poisson', 'œuf', 'tofu', 'tempeh']
  },
  matiereGrasse: {
    icon: '🫒',
    label: 'Matières Grasses',
    keywords: ['huile', 'olive', 'beurre', 'margarine']
  },
  noixGraines: {
    icon: '🥜',
    label: 'Noix & Graines',
    keywords: ['noix', 'amande', 'cajou', 'graine', 'lin', 'chia', 'courge', 'tournesol', 'sésame', 'tahini']
  },
  herbesEpices: {
    icon: '🌿',
    label: 'Herbes & Épices',
    keywords: ['persil', 'basilic', 'menthe', 'coriandre', 'thym', 'cumin', 'curry', 
               'curcuma', 'cannelle', 'gingembre', 'cardamome', 'herbes']
  },
  condiments: {
    icon: '🍯',
    label: 'Condiments & Divers',
    keywords: ['miel', 'citron', 'vinaigre', 'bouillon', 'sel', 'poivre', 'raisin sec']
  }
};

/**
 * Détermine la catégorie d'un ingrédient
 */
const categorizeIngredient = (ingredientName) => {
  const nameLower = ingredientName.toLowerCase();
  
  for (const [key, category] of Object.entries(CATEGORIES)) {
    if (category.keywords.some(keyword => nameLower.includes(keyword))) {
      return key;
    }
  }
  
  return 'autres';
};

/**
 * Normalise le nom d'un ingrédient pour le regroupement
 */
const normalizeIngredientName = (name) => {
  // Supprimer les détails entre parenthèses
  let normalized = name.replace(/\([^)]*\)/g, '').trim();
  
  // Supprimer les adjectifs de préparation
  normalized = normalized.replace(/\b(cuit|bouilli|grillé|frais|sec|congelé|appertisé|égoutté)\b/gi, '').trim();
  
  // Supprimer les articles
  normalized = normalized.replace(/\b(le|la|les|de|du|des|d')\s+/gi, '').trim();
  
  return normalized;
};

/**
 * Normalise l'unité
 */
const normalizeUnit = (unit) => {
  const unitLower = unit.toLowerCase().trim();
  
  // Convertir tout en grammes ou millilitres
  if (unitLower.includes('kg')) return 'kg';
  if (unitLower.includes('ml')) return 'ml';
  if (unitLower.includes('l') && !unitLower.includes('ml')) return 'L';
  if (unitLower.includes('g') && !unitLower.includes('kg')) return 'g';
  
  // Unités spéciales
  if (unitLower.includes('soupe')) return 'c. à soupe';
  if (unitLower.includes('café')) return 'c. à café';
  if (unitLower.includes('gousse')) return 'gousse(s)';
  if (unitLower.includes('branche')) return 'branche(s)';
  if (unitLower.includes('moyen')) return 'unité(s)';
  
  return unit;
};

/**
 * Convertit les quantités en grammes pour agrégation
 */
const convertToGrams = (quantite, unite) => {
  const uniteClean = unite.toLowerCase();
  
  if (uniteClean.includes('kg')) return quantite * 1000;
  if (uniteClean.includes('g') && !uniteClean.includes('kg')) return quantite;
  if (uniteClean.includes('ml')) return quantite; // Approximation 1ml = 1g
  if (uniteClean.includes('soupe')) return quantite * 15;
  if (uniteClean.includes('café')) return quantite * 5;
  if (uniteClean.includes('gousse')) return quantite * 5;
  if (uniteClean.includes('moyen')) return quantite * 120;
  if (uniteClean.includes('branche')) return quantite * 2;
  
  return quantite;
};

/**
 * Formate la quantité pour l'affichage
 */
const formatQuantity = (gramsTotal) => {
  if (gramsTotal >= 1000) {
    return `${(gramsTotal / 1000).toFixed(2)} kg`;
  }
  return `${Math.round(gramsTotal)} g`;
};

/**
 * Génère la liste de courses à partir du menu hebdomadaire
 */
export const generateShoppingList = (weeklyMenu) => {
  console.log('🛒 [ShoppingList] Génération de la liste de courses...');
  
  if (!weeklyMenu || !weeklyMenu.semaine) {
    console.warn('⚠️ [ShoppingList] Menu invalide');
    return null;
  }
  
  const ingredientsMap = new Map();
  
  // Parcourir tous les jours
  weeklyMenu.semaine.forEach(day => {
    const { menu } = day;
    
    // Parcourir tous les repas
    ['petitDejeuner', 'dejeuner', 'diner'].forEach(mealType => {
      if (menu[mealType] && menu[mealType].ingredients) {
        menu[mealType].ingredients.forEach(ingredient => {
          const normalizedName = normalizeIngredientName(ingredient.nom);
          const key = normalizedName.toLowerCase();
          
          // Convertir en grammes
          const gramsToAdd = convertToGrams(ingredient.quantite, ingredient.unite);
          
          if (ingredientsMap.has(key)) {
            // Ajouter à la quantité existante
            const existing = ingredientsMap.get(key);
            existing.totalGrams += gramsToAdd;
          } else {
            // Créer nouvelle entrée
            ingredientsMap.set(key, {
              name: normalizedName,
              totalGrams: gramsToAdd,
              category: categorizeIngredient(normalizedName)
            });
          }
        });
      }
    });
  });
  
  // Organiser par catégorie
  const categorized = {};
  
  ingredientsMap.forEach((item) => {
    const category = item.category;
    
    if (!categorized[category]) {
      categorized[category] = [];
    }
    
    categorized[category].push({
      name: item.name,
      quantity: formatQuantity(item.totalGrams),
      rawGrams: item.totalGrams
    });
  });
  
  // Trier les ingrédients par quantité (décroissant) dans chaque catégorie
  Object.keys(categorized).forEach(category => {
    categorized[category].sort((a, b) => b.rawGrams - a.rawGrams);
  });
  
  console.log('✅ [ShoppingList] Liste générée:', categorized);
  
  return {
    categories: categorized,
    metadata: {
      totalItems: ingredientsMap.size,
      generatedAt: new Date().toISOString(),
      weekStart: weeklyMenu.semaine[0]?.date || 'N/A'
    }
  };
};

/**
 * Exporte la liste en format texte
 */
export const exportShoppingListText = (shoppingList) => {
  if (!shoppingList) return '';
  
  let text = '📋 LISTE DE COURSES - NUTRIWEEK\n';
  text += `📅 Semaine du ${shoppingList.metadata.weekStart}\n`;
  text += `📦 ${shoppingList.metadata.totalItems} ingrédients\n`;
  text += '\n' + '='.repeat(50) + '\n\n';
  
  Object.entries(shoppingList.categories).forEach(([categoryKey, items]) => {
    const category = CATEGORIES[categoryKey] || { icon: '📦', label: 'Autres' };
    
    text += `${category.icon} ${category.label.toUpperCase()}\n`;
    text += '-'.repeat(50) + '\n';
    
    items.forEach(item => {
      text += `  ☐ ${item.name} - ${item.quantity}\n`;
    });
    
    text += '\n';
  });
  
  return text;
};

/**
 * Obtient les informations de catégorie
 */
export const getCategoryInfo = (categoryKey) => {
  return CATEGORIES[categoryKey] || { icon: '📦', label: 'Autres' };
};
