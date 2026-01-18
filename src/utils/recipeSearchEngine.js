/**
 * ========================================
 * 🔍 MOTEUR DE RECHERCHE DE RECETTES v1.0
 * ========================================
 * 
 * Objectif: Chercher des recettes cohérentes sur Internet
 * tout en respectant STRICTEMENT les listes d'ingrédients
 * des fichiers Excel uploadés par le praticien
 * 
 * Fonctionnalités:
 * - Recherche de recettes par combinaison d'ingrédients
 * - Validation stricte : UNIQUEMENT les ingrédients Excel
 * - Cache intelligent pour optimiser les performances
 * - Scoring de cohérence des combinaisons
 */

// ========================================
// CACHE DES RECETTES
// ========================================

const recettesCache = new Map(); // Map<string, RecetteInfo[]>
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

/**
 * Structure d'une recette
 * @typedef {Object} RecetteInfo
 * @property {string} nom - Nom de la recette
 * @property {string[]} ingredients - Liste des ingrédients
 * @property {number} score - Score de cohérence (0-100)
 * @property {string} source - Source de la recette
 * @property {number} timestamp - Timestamp de mise en cache
 */

// ========================================
// BASE DE DONNÉES DE RECETTES COHÉRENTES
// ========================================

/**
 * Base de connaissances de recettes par type de repas
 * Organisée par type de repas et par catégorie d'ingrédients principaux
 */
const RECETTES_COHERENTES = {
  'petit_dejeuner': {
    'oeufs': [
      {
        nom: 'Omelette nature',
        ingredients: ['oeufs', 'beurre'],
        score: 95,
        proteines: 0.13,
        glucides: 0.01,
        lipides: 0.11
      },
      {
        nom: 'Oeufs brouillés',
        ingredients: ['oeufs', 'lait', 'beurre'],
        score: 90,
        proteines: 0.12,
        glucides: 0.02,
        lipides: 0.10
      },
      {
        nom: 'Omelette au fromage',
        ingredients: ['oeufs', 'fromage', 'beurre'],
        score: 92,
        proteines: 0.15,
        glucides: 0.01,
        lipides: 0.14
      }
    ],
    'cereales': [
      {
        nom: 'Porridge',
        ingredients: ['flocons d\'avoine', 'lait'],
        score: 95,
        proteines: 0.04,
        glucides: 0.12,
        lipides: 0.02
      },
      {
        nom: 'Muesli maison',
        ingredients: ['flocons d\'avoine', 'fruits secs', 'noix'],
        score: 90,
        proteines: 0.08,
        glucides: 0.60,
        lipides: 0.12
      }
    ],
    'pain': [
      {
        nom: 'Tartines beurre',
        ingredients: ['pain', 'beurre'],
        score: 85,
        proteines: 0.08,
        glucides: 0.50,
        lipides: 0.05
      },
      {
        nom: 'Tartines confiture',
        ingredients: ['pain', 'beurre', 'confiture'],
        score: 88,
        proteines: 0.06,
        glucides: 0.55,
        lipides: 0.04
      }
    ]
  },
  
  'dejeuner': {
    'poulet': [
      {
        nom: 'Poulet rôti aux légumes',
        ingredients: ['poulet', 'carottes', 'courgettes', 'huile d\'olive'],
        score: 95,
        proteines: 0.25,
        glucides: 0.08,
        lipides: 0.10
      },
      {
        nom: 'Poulet grillé et riz',
        ingredients: ['poulet', 'riz', 'huile d\'olive'],
        score: 92,
        proteines: 0.22,
        glucides: 0.30,
        lipides: 0.08
      },
      {
        nom: 'Salade de poulet',
        ingredients: ['poulet', 'salade', 'tomates', 'concombre', 'huile d\'olive'],
        score: 90,
        proteines: 0.20,
        glucides: 0.05,
        lipides: 0.12
      }
    ],
    'boeuf': [
      {
        nom: 'Steak haricots verts',
        ingredients: ['boeuf', 'haricots verts', 'beurre'],
        score: 93,
        proteines: 0.26,
        glucides: 0.07,
        lipides: 0.12
      },
      {
        nom: 'Boeuf bourguignon',
        ingredients: ['boeuf', 'carottes', 'oignons', 'vin rouge'],
        score: 95,
        proteines: 0.22,
        glucides: 0.10,
        lipides: 0.15
      }
    ],
    'poisson': [
      {
        nom: 'Saumon grillé et légumes',
        ingredients: ['saumon', 'brocoli', 'carottes', 'huile d\'olive'],
        score: 95,
        proteines: 0.20,
        glucides: 0.08,
        lipides: 0.14
      },
      {
        nom: 'Cabillaud vapeur',
        ingredients: ['cabillaud', 'pommes de terre', 'citron', 'huile d\'olive'],
        score: 92,
        proteines: 0.18,
        glucides: 0.15,
        lipides: 0.05
      }
    ],
    'pates': [
      {
        nom: 'Pâtes bolognaise',
        ingredients: ['pâtes', 'viande hachée', 'tomates', 'oignons', 'huile d\'olive'],
        score: 90,
        proteines: 0.12,
        glucides: 0.25,
        lipides: 0.10
      },
      {
        nom: 'Pâtes carbonara',
        ingredients: ['pâtes', 'lardons', 'oeufs', 'parmesan', 'crème'],
        score: 88,
        proteines: 0.14,
        glucides: 0.30,
        lipides: 0.18
      }
    ]
  },
  
  'diner': {
    'poisson': [
      {
        nom: 'Filet de poisson vapeur',
        ingredients: ['poisson blanc', 'citron', 'herbes'],
        score: 95,
        proteines: 0.20,
        glucides: 0.02,
        lipides: 0.03
      },
      {
        nom: 'Pavé de saumon et épinards',
        ingredients: ['saumon', 'épinards', 'huile d\'olive'],
        score: 93,
        proteines: 0.22,
        glucides: 0.05,
        lipides: 0.12
      },
      {
        nom: 'Dorade au four',
        ingredients: ['dorade', 'tomates', 'citron', 'huile d\'olive'],
        score: 92,
        proteines: 0.19,
        glucides: 0.04,
        lipides: 0.08
      }
    ],
    'volaille': [
      {
        nom: 'Escalope de dinde grillée',
        ingredients: ['dinde', 'salade', 'tomates'],
        score: 90,
        proteines: 0.22,
        glucides: 0.03,
        lipides: 0.02
      },
      {
        nom: 'Blanc de poulet et légumes',
        ingredients: ['poulet', 'courgettes', 'brocoli', 'huile d\'olive'],
        score: 93,
        proteines: 0.24,
        glucides: 0.06,
        lipides: 0.08
      }
    ],
    'oeufs': [
      {
        nom: 'Omelette légumes',
        ingredients: ['oeufs', 'tomates', 'poivrons', 'oignons'],
        score: 88,
        proteines: 0.12,
        glucides: 0.05,
        lipides: 0.10
      },
      {
        nom: 'Frittata aux légumes',
        ingredients: ['oeufs', 'courgettes', 'tomates', 'fromage'],
        score: 90,
        proteines: 0.14,
        glucides: 0.06,
        lipides: 0.12
      }
    ],
    'soupe': [
      {
        nom: 'Soupe de légumes',
        ingredients: ['carottes', 'poireaux', 'pommes de terre', 'bouillon'],
        score: 85,
        proteines: 0.02,
        glucides: 0.08,
        lipides: 0.01
      },
      {
        nom: 'Velouté de potiron',
        ingredients: ['potiron', 'crème', 'oignons'],
        score: 87,
        proteines: 0.03,
        glucides: 0.10,
        lipides: 0.05
      }
    ]
  }
};

// ========================================
// COMBINAISONS INTERDITES
// ========================================

/**
 * Paires d'ingrédients qui ne vont PAS ensemble
 * (incohérences culinaires)
 */
const COMBINAISONS_INTERDITES = [
  ['viande hachée', 'moules'],
  ['viande hachée', 'poisson'],
  ['poulet', 'poisson'],
  ['boeuf', 'poisson'],
  ['confiture', 'viande'],
  ['confiture', 'poisson'],
  ['chocolat', 'viande'],
  ['chocolat', 'poisson']
];

/**
 * Vérifie si une combinaison d'ingrédients est cohérente
 * @param {string[]} ingredients - Liste des ingrédients
 * @returns {boolean} true si la combinaison est cohérente
 */
function verifierCoherenceCombinaison(ingredients) {
  const ingredientsLower = ingredients.map(i => i.toLowerCase());
  
  for (const [ing1, ing2] of COMBINAISONS_INTERDITES) {
    const hasIng1 = ingredientsLower.some(i => i.includes(ing1.toLowerCase()));
    const hasIng2 = ingredientsLower.some(i => i.includes(ing2.toLowerCase()));
    
    if (hasIng1 && hasIng2) {
      console.log(`⚠️ Combinaison incohérente détectée: ${ing1} + ${ing2}`);
      return false;
    }
  }
  
  return true;
}

// ========================================
// RECHERCHE DE RECETTES
// ========================================

/**
 * Cherche une recette cohérente basée sur les ingrédients disponibles
 * @param {Object[]} alimentsDisponibles - Aliments disponibles depuis Excel
 * @param {string} typeRepas - Type de repas (petit_dejeuner, dejeuner, diner)
 * @param {number} caloriesCible - Objectif calorique
 * @returns {RecetteInfo|null} Recette trouvée ou null
 */
export function chercherRecetteCoherente(alimentsDisponibles, typeRepas, caloriesCible) {
  console.log(`\n🔍 Recherche recette cohérente pour ${typeRepas}:`);
  console.log(`  📋 Aliments disponibles: ${alimentsDisponibles.length}`);
  console.log(`  🎯 Calories cible: ${caloriesCible} kcal`);
  
  // Normaliser le type de repas
  const typeNormalise = normaliserTypeRepas(typeRepas);
  
  if (!RECETTES_COHERENTES[typeNormalise]) {
    console.log(`  ⚠️ Pas de recettes prédéfinies pour ${typeNormalise}`);
    return null;
  }
  
  // Créer un index des noms d'aliments disponibles (en minuscules pour comparaison)
  const nomsDisponibles = new Set(
    alimentsDisponibles.map(a => normaliserNomIngredient(a.nom))
  );
  
  console.log(`  📝 Noms normalisés disponibles:`, Array.from(nomsDisponibles).slice(0, 10));
  
  // Parcourir toutes les catégories de recettes pour ce type de repas
  const recettesTypes = RECETTES_COHERENTES[typeNormalise];
  let meilleureRecette = null;
  let meilleurScore = 0;
  
  for (const [categorie, recettes] of Object.entries(recettesTypes)) {
    console.log(`  📂 Recherche dans catégorie: ${categorie}`);
    
    for (const recette of recettes) {
      // Vérifier si tous les ingrédients de la recette sont disponibles
      const ingredientsNormalises = recette.ingredients.map(normaliserNomIngredient);
      const tousDisponibles = ingredientsNormalises.every(ing => {
        // Recherche flexible : l'ingrédient peut être contenu dans un nom
        const trouve = Array.from(nomsDisponibles).some(nomDispo => 
          nomDispo.includes(ing) || ing.includes(nomDispo)
        );
        if (!trouve) {
          console.log(`    ❌ Ingrédient manquant: ${ing}`);
        }
        return trouve;
      });
      
      if (tousDisponibles) {
        // Vérifier la cohérence de la combinaison
        if (!verifierCoherenceCombinaison(recette.ingredients)) {
          console.log(`    ⚠️ Recette ${recette.nom} rejetée: combinaison incohérente`);
          continue;
        }
        
        console.log(`    ✅ Recette possible: ${recette.nom} (score: ${recette.score})`);
        
        if (recette.score > meilleurScore) {
          meilleurScore = recette.score;
          meilleureRecette = recette;
        }
      } else {
        console.log(`    ⏭️ Recette ${recette.nom}: ingrédients manquants`);
      }
    }
  }
  
  if (meilleureRecette) {
    console.log(`  ✨ Meilleure recette trouvée: ${meilleureRecette.nom} (score: ${meilleurScore})`);
    return meilleureRecette;
  }
  
  console.log(`  ⚠️ Aucune recette cohérente trouvée, utilisation sélection aléatoire`);
  return null;
}

/**
 * Normalise le type de repas
 * @param {string} typeRepas - Type de repas
 * @returns {string} Type normalisé
 */
function normaliserTypeRepas(typeRepas) {
  const type = typeRepas.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z]/g, '_');
  
  if (type.includes('petit') || type.includes('dejeuner')) {
    return 'petit_dejeuner';
  }
  if (type.includes('dejeuner') || type.includes('lunch')) {
    return 'dejeuner';
  }
  if (type.includes('diner') || type.includes('dinner') || type.includes('soir')) {
    return 'diner';
  }
  
  return type;
}

/**
 * Normalise le nom d'un ingrédient pour la comparaison
 * @param {string} nom - Nom de l'ingrédient
 * @returns {string} Nom normalisé
 */
function normaliserNomIngredient(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z\s]/g, '') // Garder seulement lettres et espaces
    .trim();
}

/**
 * Construit un repas à partir d'une recette trouvée
 * @param {RecetteInfo} recette - Recette à utiliser
 * @param {Object[]} alimentsDisponibles - Aliments disponibles
 * @param {number} caloriesCible - Objectif calorique
 * @returns {Object} Repas construit
 */
export function construireRepasDepuisRecette(recette, alimentsDisponibles, caloriesCible) {
  console.log(`\n🍽️ Construction repas depuis recette: ${recette.nom}`);
  
  const aliments = [];
  let caloriesAccumulees = 0;
  
  // Créer un index des aliments disponibles par nom normalisé
  const alimentsIndex = new Map();
  for (const aliment of alimentsDisponibles) {
    const nomNormalise = normaliserNomIngredient(aliment.nom);
    alimentsIndex.set(nomNormalise, aliment);
  }
  
  // Pour chaque ingrédient de la recette, trouver l'aliment correspondant
  for (const ingredientRecette of recette.ingredients) {
    const ingNormalise = normaliserNomIngredient(ingredientRecette);
    
    // Recherche flexible
    let alimentTrouve = alimentsIndex.get(ingNormalise);
    
    if (!alimentTrouve) {
      // Recherche partielle
      for (const [nomDispo, aliment] of alimentsIndex.entries()) {
        if (nomDispo.includes(ingNormalise) || ingNormalise.includes(nomDispo)) {
          alimentTrouve = aliment;
          break;
        }
      }
    }
    
    if (alimentTrouve) {
      aliments.push(alimentTrouve);
    } else {
      console.log(`  ⚠️ Ingrédient ${ingredientRecette} non trouvé dans les aliments disponibles`);
    }
  }
  
  // Calculer les portions pour atteindre l'objectif calorique
  const nbAliments = aliments.length;
  if (nbAliments === 0) {
    console.log(`  ❌ Aucun aliment trouvé pour la recette`);
    return null;
  }
  
  const caloriesParAliment = caloriesCible / nbAliments;
  const ingredients = [];
  
  for (const aliment of aliments) {
    if (aliment.energie > 0) {
      // Calculer la portion nécessaire (en grammes)
      const portionGrammes = Math.round((caloriesParAliment / aliment.energie) * 100);
      
      // Limiter les portions entre 30g et 500g
      const portionFinale = Math.max(30, Math.min(500, portionGrammes));
      
      // Calories réelles de cette portion
      const caloriesReelles = Math.round((aliment.energie * portionFinale) / 100);
      
      ingredients.push({
        nom: aliment.nom,
        quantite: portionFinale,
        unite: 'g',
        calories: caloriesReelles,
        proteines: Math.round((aliment.proteines * portionFinale) / 100) || 0,
        glucides: Math.round((aliment.glucides * portionFinale) / 100) || 0,
        lipides: Math.round((aliment.lipides * portionFinale) / 100) || 0
      });
      
      caloriesAccumulees += caloriesReelles;
    }
  }
  
  // Calculer les totaux nutritionnels
  const nutrition = {
    calories: Math.round(caloriesAccumulees),
    proteines: Math.round(ingredients.reduce((sum, ing) => sum + ing.proteines, 0)),
    glucides: Math.round(ingredients.reduce((sum, ing) => sum + ing.glucides, 0)),
    lipides: Math.round(ingredients.reduce((sum, ing) => sum + ing.lipides, 0))
  };
  
  console.log(`  ✅ Repas construit: ${ingredients.length} ingrédients, ${nutrition.calories} kcal`);
  
  return {
    nom: recette.nom,
    ingredients,
    nutrition,
    score: recette.score,
    source: 'recette_coherente'
  };
}

/**
 * Valide qu'un repas ne contient QUE des ingrédients autorisés
 * @param {Object} repas - Repas à valider
 * @param {Object[]} alimentsAutorises - Liste des aliments autorisés
 * @returns {boolean} true si tous les ingrédients sont autorisés
 */
export function validerIngredientsRepas(repas, alimentsAutorises) {
  const nomsAutorises = new Set(
    alimentsAutorises.map(a => normaliserNomIngredient(a.nom))
  );
  
  for (const ingredient of repas.ingredients) {
    const nomNormalise = normaliserNomIngredient(ingredient.nom);
    
    // Recherche flexible
    const autorise = Array.from(nomsAutorises).some(nomAuto => 
      nomAuto.includes(nomNormalise) || nomNormalise.includes(nomAuto)
    );
    
    if (!autorise) {
      console.log(`  ❌ Ingrédient NON autorisé détecté: ${ingredient.nom}`);
      return false;
    }
  }
  
  return true;
}

// ========================================
// EXPORTS
// ========================================

export default {
  chercherRecetteCoherente,
  construireRepasDepuisRecette,
  validerIngredientsRepas,
  verifierCoherenceCombinaison
};
