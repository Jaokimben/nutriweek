/**
 * 🔍 MOTEUR DE RECHERCHE DE RECETTES COHÉRENTES
 * 
 * Objectif : Chercher des recettes réelles et cohérentes sur internet,
 * puis les filtrer selon les ingrédients disponibles dans les fichiers Excel uploadés.
 * 
 * Principe :
 * - Petit-Déjeuner : recherche recettes petit-déj + filtre avec alimentsPetitDej.xlsx
 * - Déjeuner : recherche recettes déjeuner + filtre avec alimentsDejeuner.xlsx  
 * - Dîner : recherche recettes dîner + filtre avec alimentsDiner.xlsx
 */

// API Spoonacular (gratuite avec 150 requêtes/jour)
const SPOONACULAR_API_KEY = process.env.VITE_SPOONACULAR_API_KEY || '';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

// Base de données locale de recettes françaises courantes (fallback si pas d'API)
const RECETTES_FRANCAISES = {
  petitDejeuner: [
    {
      nom: 'Omelette aux légumes',
      ingredients: ['œufs', 'tomate', 'poivron', 'oignon', 'sel', 'poivre', 'huile d\'olive'],
      caloriesPar100g: 154,
      protPar100g: 10.2,
      glucPar100g: 3.5,
      lipPar100g: 11.1,
      type: 'salé'
    },
    {
      nom: 'Yaourt grec aux fruits',
      ingredients: ['yaourt grec', 'miel', 'framboises', 'myrtilles', 'amandes'],
      caloriesPar100g: 133,
      protPar100g: 10.0,
      glucPar100g: 12.0,
      lipPar100g: 5.0,
      type: 'sucré'
    },
    {
      nom: 'Tartines avocat saumon',
      ingredients: ['pain complet', 'avocat', 'saumon fumé', 'citron', 'poivre'],
      caloriesPar100g: 198,
      protPar100g: 12.5,
      glucPar100g: 15.0,
      lipPar100g: 10.0,
      type: 'salé'
    },
    {
      nom: 'Porridge aux fruits',
      ingredients: ['flocons d\'avoine', 'lait', 'banane', 'miel', 'cannelle'],
      caloriesPar100g: 88,
      protPar100g: 3.4,
      glucPar100g: 15.4,
      lipPar100g: 1.7,
      type: 'sucré'
    }
  ],
  dejeuner: [
    {
      nom: 'Poulet rôti aux légumes',
      ingredients: ['poulet', 'carotte', 'courgette', 'tomate', 'oignon', 'herbes de provence', 'huile d\'olive'],
      caloriesPar100g: 165,
      protPar100g: 20.0,
      glucPar100g: 8.0,
      lipPar100g: 6.0,
      type: 'viande'
    },
    {
      nom: 'Saumon grillé au riz',
      ingredients: ['saumon', 'riz basmati', 'citron', 'brocoli', 'huile d\'olive', 'sel', 'poivre'],
      caloriesPar100g: 178,
      protPar100g: 18.5,
      glucPar100g: 12.0,
      lipPar100g: 7.0,
      type: 'poisson'
    },
    {
      nom: 'Pâtes bolognaise',
      ingredients: ['pâtes', 'viande hachée', 'tomate', 'oignon', 'ail', 'huile d\'olive', 'basilic'],
      caloriesPar100g: 142,
      protPar100g: 8.5,
      glucPar100g: 18.0,
      lipPar100g: 4.0,
      type: 'viande'
    },
    {
      nom: 'Salade César au poulet',
      ingredients: ['poulet', 'laitue romaine', 'parmesan', 'croûtons', 'sauce césar', 'citron'],
      caloriesPar100g: 124,
      protPar100g: 12.0,
      glucPar100g: 6.0,
      lipPar100g: 6.0,
      type: 'salade'
    }
  ],
  diner: [
    {
      nom: 'Soupe de légumes maison',
      ingredients: ['carotte', 'poireau', 'pomme de terre', 'courgette', 'oignon', 'bouillon de légumes'],
      caloriesPar100g: 45,
      protPar100g: 1.5,
      glucPar100g: 8.0,
      lipPar100g: 0.5,
      type: 'léger'
    },
    {
      nom: 'Omelette aux champignons',
      ingredients: ['œufs', 'champignons', 'persil', 'oignon', 'huile d\'olive', 'sel', 'poivre'],
      caloriesPar100g: 143,
      protPar100g: 9.5,
      glucPar100g: 3.0,
      lipPar100g: 10.5,
      type: 'léger'
    },
    {
      nom: 'Poisson blanc aux épinards',
      ingredients: ['cabillaud', 'épinards', 'citron', 'ail', 'huile d\'olive', 'sel', 'poivre'],
      caloriesPar100g: 98,
      protPar100g: 18.0,
      glucPar100g: 2.0,
      lipPar100g: 2.5,
      type: 'poisson'
    },
    {
      nom: 'Salade composée',
      ingredients: ['laitue', 'tomate', 'concombre', 'œuf dur', 'thon', 'huile d\'olive', 'vinaigre'],
      caloriesPar100g: 87,
      protPar100g: 8.0,
      glucPar100g: 4.0,
      lipPar100g: 4.5,
      type: 'salade'
    }
  ]
};

/**
 * Normalise le nom d'un ingrédient pour faciliter la comparaison
 */
function normaliserIngredient(nom) {
  return nom
    .toLowerCase()
    .trim()
    .replace(/['']/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '');
}

/**
 * Vérifie si un ingrédient de recette correspond à un aliment Excel
 */
function correspondIngredient(ingredientRecette, alimentExcel) {
  const ingNorm = normaliserIngredient(ingredientRecette);
  const alimNorm = normaliserIngredient(alimentExcel);
  
  // Correspondance exacte
  if (ingNorm === alimNorm) return true;
  
  // Correspondance partielle (ex: "tomate" dans "tomate cerise")
  if (ingNorm.includes(alimNorm) || alimNorm.includes(ingNorm)) return true;
  
  // Synonymes courants
  const synonymes = {
    'poulet': ['volaille', 'blanc de poulet', 'filet de poulet'],
    'saumon': ['pavé de saumon', 'filet de saumon'],
    'œuf': ['œufs', 'oeuf', 'oeufs'],
    'tomate': ['tomates', 'tomate cerise'],
    'laitue': ['salade', 'laitue romaine'],
    'huile d\'olive': ['huile'],
    'viande hachée': ['bœuf haché', 'viande de bœuf'],
    'pâtes': ['pâte', 'spaghetti', 'tagliatelle']
  };
  
  for (const [base, vars] of Object.entries(synonymes)) {
    if (ingNorm.includes(base) && vars.some(v => alimNorm.includes(v))) return true;
    if (alimNorm.includes(base) && vars.some(v => ingNorm.includes(v))) return true;
  }
  
  return false;
}

/**
 * Vérifie si TOUS les ingrédients d'une recette sont disponibles dans la liste Excel
 */
function recetteRealisable(recette, alimentsExcel) {
  console.log(`  🔍 Vérification recette "${recette.nom}" avec ${recette.ingredients.length} ingrédients`);
  
  const ingredientsManquants = [];
  const ingredientsTrouves = [];
  
  for (const ingredient of recette.ingredients) {
    const trouve = alimentsExcel.some(aliment => 
      correspondIngredient(ingredient, aliment.nom)
    );
    
    if (trouve) {
      ingredientsTrouves.push(ingredient);
    } else {
      ingredientsManquants.push(ingredient);
    }
  }
  
  const realisable = ingredientsManquants.length === 0;
  
  console.log(`    ✓ Trouvés: ${ingredientsTrouves.join(', ')}`);
  if (ingredientsManquants.length > 0) {
    console.log(`    ✗ Manquants: ${ingredientsManquants.join(', ')}`);
  }
  console.log(`    => ${realisable ? '✅ Réalisable' : '❌ Non réalisable'}`);
  
  return realisable;
}

/**
 * Cherche des recettes cohérentes pour un type de repas
 * @param {string} typeRepas - 'Petit-déjeuner', 'Déjeuner' ou 'Dîner'
 * @param {Array} alimentsExcel - Liste des aliments disponibles depuis le fichier Excel
 * @param {number} caloriesCible - Objectif calorique du repas
 * @returns {Array} Liste des recettes réalisables
 */
export async function chercherRecettes(typeRepas, alimentsExcel, caloriesCible) {
  console.log(`\n🔍 RECHERCHE DE RECETTES COHÉRENTES`);
  console.log(`📋 Type de repas: ${typeRepas}`);
  console.log(`🎯 Objectif calorique: ${caloriesCible} kcal`);
  console.log(`📦 Aliments disponibles: ${alimentsExcel.length}`);
  
  // Mapping type de repas vers clé base de données
  const typeMap = {
    'Petit-déjeuner': 'petitDejeuner',
    'petit_dejeuner': 'petitDejeuner',
    'Déjeuner': 'dejeuner',
    'dejeuner': 'dejeuner',
    'Dîner': 'diner',
    'diner': 'diner'
  };
  
  const typeKey = typeMap[typeRepas] || 'dejeuner';
  const recettesBase = RECETTES_FRANCAISES[typeKey] || [];
  
  console.log(`📚 ${recettesBase.length} recettes disponibles dans la base ${typeKey}`);
  
  // Filtrer les recettes réalisables avec les aliments Excel disponibles
  const recettesRealisables = recettesBase.filter(recette => 
    recetteRealisable(recette, alimentsExcel)
  );
  
  console.log(`✅ ${recettesRealisables.length} recettes réalisables trouvées`);
  
  if (recettesRealisables.length === 0) {
    console.warn(`⚠️ AUCUNE recette réalisable trouvée pour ${typeRepas}`);
    console.warn(`   Il faudra générer un repas avec les aliments disponibles`);
  } else {
    console.log(`📝 Recettes réalisables:`);
    recettesRealisables.forEach(r => console.log(`   - ${r.nom}`));
  }
  
  return recettesRealisables;
}

/**
 * Sélectionne une recette parmi celles réalisables et calcule les portions
 * @param {Array} recettesRealisables - Recettes filtrées
 * @param {Array} alimentsExcel - Aliments Excel avec données nutritionnelles
 * @param {number} caloriesCible - Objectif calorique
 * @returns {Object} Repas structuré avec ingrédients et portions
 */
export function selectionnerRecette(recettesRealisables, alimentsExcel, caloriesCible) {
  if (recettesRealisables.length === 0) {
    return null; // Fallback vers génération aléatoire
  }
  
  // Choisir une recette aléatoirement parmi celles réalisables
  const recette = recettesRealisables[Math.floor(Math.random() * recettesRealisables.length)];
  
  console.log(`\n🍽️ RECETTE SÉLECTIONNÉE: ${recette.nom}`);
  console.log(`🎯 Objectif: ${caloriesCible} kcal`);
  
  // Mapper les ingrédients de la recette aux aliments Excel
  const ingredientsAvecDonnees = [];
  
  for (const ingredient of recette.ingredients) {
    // Trouver l'aliment Excel correspondant
    const alimentCorrespondant = alimentsExcel.find(aliment =>
      correspondIngredient(ingredient, aliment.nom)
    );
    
    if (alimentCorrespondant) {
      ingredientsAvecDonnees.push({
        nomRecette: ingredient,
        alimentExcel: alimentCorrespondant
      });
    }
  }
  
  console.log(`📦 ${ingredientsAvecDonnees.length} ingrédients mappés sur les aliments Excel`);
  
  // Calculer les portions pour atteindre l'objectif calorique
  // Stratégie : répartir équitablement les calories entre les ingrédients
  const caloriesParIngredient = caloriesCible / ingredientsAvecDonnees.length;
  
  const aliments = [];
  let caloriesTotal = 0;
  let proteinesTotal = 0;
  let glucidesTotal = 0;
  let lipidesTotal = 0;
  
  for (const { nomRecette, alimentExcel } of ingredientsAvecDonnees) {
    if (alimentExcel.energie > 0) {
      // Calculer la portion nécessaire (en grammes)
      let portionGrammes = Math.round((caloriesParIngredient / alimentExcel.energie) * 100);
      
      // Limiter les portions entre 20g et 400g
      portionGrammes = Math.max(20, Math.min(400, portionGrammes));
      
      // Calories réelles de cette portion
      const caloriesReelles = Math.round((alimentExcel.energie * portionGrammes) / 100);
      
      aliments.push({
        nom: alimentExcel.nom,
        nomRecette: nomRecette,
        quantite: portionGrammes,
        unite: 'g',
        calories: caloriesReelles,
        proteines: Math.round((alimentExcel.proteines * portionGrammes) / 100 * 10) / 10,
        glucides: Math.round((alimentExcel.glucides * portionGrammes) / 100 * 10) / 10,
        lipides: Math.round((alimentExcel.lipides * portionGrammes) / 100 * 10) / 10
      });
      
      caloriesTotal += caloriesReelles;
      proteinesTotal += Math.round((alimentExcel.proteines * portionGrammes) / 100 * 10) / 10;
      glucidesTotal += Math.round((alimentExcel.glucides * portionGrammes) / 100 * 10) / 10;
      lipidesTotal += Math.round((alimentExcel.lipides * portionGrammes) / 100 * 10) / 10;
    }
  }
  
  console.log(`✅ Repas généré: ${caloriesTotal} kcal (objectif: ${caloriesCible})`);
  console.log(`   Écart: ${Math.round((Math.abs(caloriesTotal - caloriesCible) / caloriesCible) * 100)}%`);
  
  return {
    nom: recette.nom,
    aliments,
    nutrition: {
      calories: Math.round(caloriesTotal),
      proteines: Math.round(proteinesTotal * 10) / 10,
      glucides: Math.round(glucidesTotal * 10) / 10,
      lipides: Math.round(lipidesTotal * 10) / 10
    }
  };
}

/**
 * Génère un repas cohérent en cherchant d'abord des recettes réelles
 * puis en fallback vers génération aléatoire si aucune recette n'est réalisable
 */
export async function genererRepasCoherent(typeRepas, caloriesCible, alimentsExcel, alimentsUtilises, regles) {
  console.log(`\n🍳 GÉNÉRATION REPAS COHÉRENT: ${typeRepas}`);
  
  // Étape 1: Chercher des recettes réalisables
  const recettesRealisables = await chercherRecettes(typeRepas, alimentsExcel, caloriesCible);
  
  // Étape 2: Si des recettes sont réalisables, en sélectionner une
  if (recettesRealisables.length > 0) {
    const repasRecette = selectionnerRecette(recettesRealisables, alimentsExcel, caloriesCible);
    
    if (repasRecette) {
      console.log(`✅ Repas généré depuis une RECETTE COHÉRENTE`);
      return repasRecette;
    }
  }
  
  // Étape 3: Fallback vers génération aléatoire
  console.warn(`⚠️ Aucune recette cohérente trouvée, génération aléatoire`);
  
  // Importation dynamique pour éviter les dépendances circulaires
  const { selectionnerAliments } = await import('./menuGeneratorFromExcel.js');
  return selectionnerAliments(alimentsExcel, caloriesCible, alimentsUtilises, regles);
}
