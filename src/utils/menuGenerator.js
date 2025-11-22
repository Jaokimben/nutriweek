import { calculateCalories, isAlimentAllowed, calculateGI } from './nutritionCalculator';
import { calculateRecipeNutrition, improveIngredientName } from './ciqualParser';
import { calculateRecipeNutritionSimple } from './alimentsSimpleParser';
import { findNutritionData } from './externalNutritionAPI';

/**
 * Base de données de recettes par type d'aliment
 * Sera enrichie avec les aliments du CSV
 */
const recettesDatabase = {
  legumineuses: [
    { 
      nom: 'Salade de lentilles aux légumes', 
      type: 'dejeuner',
      ingredients: [
        { nom: 'Lentilles vertes cuites', quantite: 150, unite: 'g' },
        { nom: 'Tomates', quantite: 100, unite: 'g' },
        { nom: 'Concombre', quantite: 80, unite: 'g' },
        { nom: 'Oignon rouge', quantite: 50, unite: 'g' },
        { nom: 'Huile d\'olive', quantite: 15, unite: 'ml' },
        { nom: 'Jus de citron', quantite: 1, unite: 'c. à soupe' },
        { nom: 'Persil frais', quantite: 10, unite: 'g' }
      ],
      preparation: 'Mélanger les lentilles cuites avec les légumes coupés en dés. Assaisonner avec huile d\'olive, citron, sel et poivre. Parsemer de persil frais.'
    },
    {
      nom: 'Curry de pois chiches',
      type: 'dejeuner',
      ingredients: [
        { nom: 'Pois chiches cuits', quantite: 200, unite: 'g' },
        { nom: 'Lait de coco', quantite: 150, unite: 'ml' },
        { nom: 'Poudre de curry', quantite: 2, unite: 'c. à café' },
        { nom: 'Tomates concassées', quantite: 150, unite: 'g' },
        { nom: 'Oignon', quantite: 80, unite: 'g' },
        { nom: 'Ail', quantite: 2, unite: 'gousses' },
        { nom: 'Gingembre frais', quantite: 10, unite: 'g' }
      ],
      preparation: 'Faire revenir l\'oignon, l\'ail et le gingembre. Ajouter le curry, puis les pois chiches, tomates et lait de coco. Laisser mijoter 20 min.'
    },
    {
      nom: 'Soupe de lentilles corail',
      type: 'diner',
      ingredients: [
        { nom: 'Lentilles corail', quantite: 100, unite: 'g' },
        { nom: 'Carottes', quantite: 150, unite: 'g' },
        { nom: 'Oignon', quantite: 80, unite: 'g' },
        { nom: 'Cumin', quantite: 1, unite: 'c. à café' },
        { nom: 'Bouillon de légumes', quantite: 500, unite: 'ml' },
        { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' }
      ],
      preparation: 'Faire revenir oignon et carotte dans l\'huile. Ajouter cumin, lentilles et bouillon. Cuire 15 min et mixer.'
    },
    {
      nom: 'Houmous de haricots blancs',
      type: 'snack',
      ingredients: [
        { nom: 'Haricots blancs cuits', quantite: 200, unite: 'g' },
        { nom: 'Tahini (purée de sésame)', quantite: 30, unite: 'g' },
        { nom: 'Jus de citron', quantite: 2, unite: 'c. à soupe' },
        { nom: 'Ail', quantite: 1, unite: 'gousse' },
        { nom: 'Huile d\'olive', quantite: 20, unite: 'ml' },
        { nom: 'Cumin', quantite: 0.5, unite: 'c. à café' }
      ],
      preparation: 'Mixer tous les ingrédients avec un peu d\'eau jusqu\'à obtenir une texture crémeuse. Ajuster l\'assaisonnement.'
    },
    {
      nom: 'Dhal de lentilles',
      type: 'dejeuner',
      ingredients: [
        { nom: 'Lentilles corail', quantite: 150, unite: 'g' },
        { nom: 'Curcuma', quantite: 1, unite: 'c. à café' },
        { nom: 'Gingembre frais râpé', quantite: 15, unite: 'g' },
        { nom: 'Ail', quantite: 2, unite: 'gousses' },
        { nom: 'Tomates', quantite: 150, unite: 'g' },
        { nom: 'Oignon', quantite: 80, unite: 'g' },
        { nom: 'Coriandre fraîche', quantite: 10, unite: 'g' }
      ],
      preparation: 'Faire revenir oignon, ail et gingembre. Ajouter curcuma et lentilles. Ajouter tomates et eau. Cuire 25 min jusqu\'à obtenir une texture fondante. Garnir de coriandre.'
    }
  ],
  cereales: [
    {
      nom: 'Riz complet aux légumes',
      type: 'dejeuner',
      ingredients: [
        { nom: 'Riz complet', quantite: 80, unite: 'g (sec)' },
        { nom: 'Courgette', quantite: 150, unite: 'g' },
        { nom: 'Poivron rouge', quantite: 100, unite: 'g' },
        { nom: 'Carotte', quantite: 80, unite: 'g' },
        { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' },
        { nom: 'Ail', quantite: 1, unite: 'gousse' },
        { nom: 'Herbes de Provence', quantite: 1, unite: 'c. à café' }
      ],
      preparation: 'Cuire le riz selon les instructions. Faire sauter les légumes coupés en dés avec l\'ail dans l\'huile d\'olive. Mélanger avec le riz et assaisonner.'
    },
    {
      nom: 'Quinoa bowl méditerranéen',
      type: 'dejeuner',
      ingredients: [
        { nom: 'Quinoa', quantite: 80, unite: 'g (sec)' },
        { nom: 'Tomates cerises', quantite: 120, unite: 'g' },
        { nom: 'Concombre', quantite: 100, unite: 'g' },
        { nom: 'Feta', quantite: 50, unite: 'g' },
        { nom: 'Olives noires', quantite: 40, unite: 'g' },
        { nom: 'Huile d\'olive', quantite: 15, unite: 'ml' },
        { nom: 'Menthe fraîche', quantite: 5, unite: 'g' }
      ],
      preparation: 'Cuire le quinoa et laisser refroidir. Servir avec les légumes frais coupés, la feta émiettée et les olives. Arroser d\'huile d\'olive et parsemer de menthe.'
    },
    {
      nom: 'Porridge d\'avoine aux fruits',
      type: 'petitDejeuner',
      ingredients: [
        { nom: 'Flocons d\'avoine', quantite: 60, unite: 'g' },
        { nom: 'Lait d\'amande', quantite: 250, unite: 'ml' },
        { nom: 'Banane', quantite: 1, unite: 'moyenne' },
        { nom: 'Myrtilles', quantite: 50, unite: 'g' },
        { nom: 'Cannelle', quantite: 0.5, unite: 'c. à café' },
        { nom: 'Miel', quantite: 1, unite: 'c. à café' }
      ],
      preparation: 'Cuire les flocons dans le lait 5 min. Ajouter la banane en rondelles, les myrtilles, la cannelle et le miel.'
    },
    {
      nom: 'Salade de quinoa et légumes grillés',
      type: 'dejeuner',
      ingredients: [
        { nom: 'Quinoa', quantite: 80, unite: 'g (sec)' },
        { nom: 'Aubergine', quantite: 120, unite: 'g' },
        { nom: 'Courgette', quantite: 120, unite: 'g' },
        { nom: 'Poivron', quantite: 100, unite: 'g' },
        { nom: 'Jus de citron', quantite: 2, unite: 'c. à soupe' },
        { nom: 'Huile d\'olive', quantite: 15, unite: 'ml' },
        { nom: 'Basilic frais', quantite: 10, unite: 'g' }
      ],
      preparation: 'Griller les légumes coupés au four ou à la poêle. Mélanger avec le quinoa cuit, assaisonner avec citron, huile d\'olive et basilic.'
    },
    {
      nom: 'Riz basmati pilaf',
      type: 'dejeuner',
      ingredients: [
        { nom: 'Riz basmati', quantite: 80, unite: 'g (sec)' },
        { nom: 'Oignon', quantite: 60, unite: 'g' },
        { nom: 'Curcuma', quantite: 0.5, unite: 'c. à café' },
        { nom: 'Cardamome', quantite: 2, unite: 'gousses' },
        { nom: 'Raisins secs', quantite: 30, unite: 'g' },
        { nom: 'Amandes effilées', quantite: 20, unite: 'g' },
        { nom: 'Bouillon de légumes', quantite: 200, unite: 'ml' }
      ],
      preparation: 'Faire dorer l\'oignon et les épices, ajouter le riz et le bouillon. Cuire 15 min. Ajouter raisins secs et amandes grillées avant de servir.'
    }
  ],
  petitDejeuner: [
    {
      nom: 'Porridge protéiné',
      type: 'petitDejeuner',
      ingredients: [
        { nom: 'Flocons d\'avoine', quantite: 60, unite: 'g' },
        { nom: 'Lait végétal (soja)', quantite: 250, unite: 'ml' },
        { nom: 'Graines de chia', quantite: 15, unite: 'g' },
        { nom: 'Fruits rouges mélangés', quantite: 80, unite: 'g' },
        { nom: 'Protéine végétale en poudre', quantite: 20, unite: 'g' },
        { nom: 'Cannelle', quantite: 0.5, unite: 'c. à café' }
      ],
      preparation: 'Cuire les flocons avec le lait 5 min. Ajouter la protéine en poudre, les graines de chia, les fruits rouges et la cannelle. Bien mélanger.'
    },
    {
      nom: 'Bowl d\'avoine overnight',
      type: 'petitDejeuner',
      ingredients: [
        { nom: 'Flocons d\'avoine', quantite: 50, unite: 'g' },
        { nom: 'Yaourt végétal (coco)', quantite: 150, unite: 'g' },
        { nom: 'Lait d\'amande', quantite: 100, unite: 'ml' },
        { nom: 'Fruits frais (kiwi, fraises)', quantite: 100, unite: 'g' },
        { nom: 'Noix de cajou', quantite: 20, unite: 'g' },
        { nom: 'Graines de lin', quantite: 10, unite: 'g' },
        { nom: 'Miel', quantite: 1, unite: 'c. à café' }
      ],
      preparation: 'Mélanger avoine, yaourt, lait et graines la veille au soir. Laisser au frigo toute la nuit. Le matin, ajouter fruits frais, noix et miel.'
    },
    {
      nom: 'Smoothie bowl énergisant',
      type: 'petitDejeuner',
      ingredients: [
        { nom: 'Banane congelée', quantite: 2, unite: 'moyennes' },
        { nom: 'Fruits rouges congelés', quantite: 100, unite: 'g' },
        { nom: 'Lait d\'amande', quantite: 150, unite: 'ml' },
        { nom: 'Granola maison', quantite: 40, unite: 'g' },
        { nom: 'Graines de courge', quantite: 10, unite: 'g' },
        { nom: 'Beurre d\'amande', quantite: 15, unite: 'g' },
        { nom: 'Baies de goji', quantite: 10, unite: 'g' }
      ],
      preparation: 'Mixer les bananes et fruits rouges avec le lait jusqu\'à obtenir une texture épaisse. Verser dans un bol et garnir de granola, graines et baies.'
    }
  ],
  diner: [
    {
      nom: 'Soupe de légumes verts',
      type: 'diner',
      ingredients: [
        { nom: 'Brocoli', quantite: 150, unite: 'g' },
        { nom: 'Épinards frais', quantite: 100, unite: 'g' },
        { nom: 'Courgette', quantite: 120, unite: 'g' },
        { nom: 'Oignon', quantite: 60, unite: 'g' },
        { nom: 'Bouillon de légumes', quantite: 500, unite: 'ml' },
        { nom: 'Ail', quantite: 1, unite: 'gousse' },
        { nom: 'Huile d\'olive', quantite: 5, unite: 'ml' }
      ],
      preparation: 'Faire revenir l\'oignon et l\'ail. Ajouter tous les légumes et le bouillon. Cuire 15 min et mixer jusqu\'à obtenir une texture veloutée.'
    },
    {
      nom: 'Salade composée légère',
      type: 'diner',
      ingredients: [
        { nom: 'Mesclun (salade)', quantite: 100, unite: 'g' },
        { nom: 'Tomates cerises', quantite: 80, unite: 'g' },
        { nom: 'Concombre', quantite: 100, unite: 'g' },
        { nom: 'Radis', quantite: 50, unite: 'g' },
        { nom: 'Graines de tournesol', quantite: 10, unite: 'g' },
        { nom: 'Vinaigre balsamique', quantite: 1, unite: 'c. à soupe' },
        { nom: 'Huile d\'olive', quantite: 5, unite: 'ml' }
      ],
      preparation: 'Laver et couper tous les légumes. Disposer dans un saladier. Assaisonner avec vinaigre, huile, sel et poivre. Parsemer de graines.'
    },
    {
      nom: 'Velouté de champignons',
      type: 'diner',
      ingredients: [
        { nom: 'Champignons de Paris', quantite: 250, unite: 'g' },
        { nom: 'Oignon', quantite: 60, unite: 'g' },
        { nom: 'Ail', quantite: 2, unite: 'gousses' },
        { nom: 'Bouillon de légumes', quantite: 400, unite: 'ml' },
        { nom: 'Thym frais', quantite: 2, unite: 'branches' },
        { nom: 'Crème de soja', quantite: 50, unite: 'ml' },
        { nom: 'Persil', quantite: 5, unite: 'g' }
      ],
      preparation: 'Faire revenir oignon et champignons émincés avec l\'ail. Ajouter le bouillon et le thym. Cuire 15 min, retirer le thym, ajouter la crème et mixer.'
    },
    {
      nom: 'Gaspacho de tomates',
      type: 'diner',
      ingredients: [
        { nom: 'Tomates mûres', quantite: 500, unite: 'g' },
        { nom: 'Concombre', quantite: 150, unite: 'g' },
        { nom: 'Poivron rouge', quantite: 100, unite: 'g' },
        { nom: 'Ail', quantite: 1, unite: 'gousse' },
        { nom: 'Huile d\'olive', quantite: 20, unite: 'ml' },
        { nom: 'Vinaigre de vin', quantite: 1, unite: 'c. à soupe' },
        { nom: 'Basilic frais', quantite: 5, unite: 'g' }
      ],
      preparation: 'Mixer tous les légumes crus avec huile d\'olive, vinaigre, sel et poivre. Réserver au frais 2h minimum. Servir bien frais avec basilic.'
    },
    {
      nom: 'Salade d\'épinards et avocat',
      type: 'diner',
      ingredients: [
        { nom: 'Épinards frais', quantite: 120, unite: 'g' },
        { nom: 'Avocat', quantite: 1, unite: 'moyen' },
        { nom: 'Graines de courge', quantite: 15, unite: 'g' },
        { nom: 'Jus de citron', quantite: 2, unite: 'c. à soupe' },
        { nom: 'Tomates cerises', quantite: 80, unite: 'g' },
        { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' }
      ],
      preparation: 'Laver les épinards. Trancher l\'avocat et les tomates. Mélanger dans un bol avec graines de courge, citron et huile d\'olive.'
    }
  ]
};

/**
 * Calcul hybride : essaye CIQUAL d'abord, puis alimentsSimple, puis valeurs moyennes
 * @param {Array} ingredients - Liste d'ingrédients
 * @param {Array} alimentsSimple - Base simplifiée
 * @param {Object} ciqualData - Base CIQUAL
 * @returns {Promise<Object>} Valeurs nutritionnelles
 */
const calculateNutritionHybrid = async (ingredients, alimentsSimple, ciqualData) => {
  console.log('🔍 [calculateNutritionHybrid] DÉBUT');
  console.log('📦 [calculateNutritionHybrid] ciqualData disponible:', !!ciqualData, '| taille:', Object.keys(ciqualData || {}).length);
  console.log('📦 [calculateNutritionHybrid] alimentsSimple disponible:', !!alimentsSimple, '| taille:', alimentsSimple?.length || 0);
  console.log('🥗 [calculateNutritionHybrid] Ingrédients:', ingredients.map(i => i.nom).join(', '));
  
  // PRIORITÉ 1: Essayer avec CIQUAL (plus complet)
  if (ciqualData && Object.keys(ciqualData).length > 0) {
    console.log('✅ [calculateNutritionHybrid] Essai avec CIQUAL (prioritaire)...');
    const result = calculateRecipeNutrition(ingredients, ciqualData);
    console.log('📊 [calculateNutritionHybrid] Résultat CIQUAL:', result);
    
    // Si le résultat est valide (calories > 0), le retourner
    if (result.calories > 0) {
      console.log('✅ [calculateNutritionHybrid] ✨ Résultat valide depuis CIQUAL:', result);
      return result;
    }
    
    console.warn('⚠️ [calculateNutritionHybrid] CIQUAL n\'a pas donné de résultats, essai avec base simplifiée...');
  }
  
  // PRIORITÉ 2: Fallback sur la base simplifiée
  if (alimentsSimple && alimentsSimple.length > 0) {
    console.log('✅ [calculateNutritionHybrid] Essai avec base simplifiée (fallback)...');
    const result = calculateRecipeNutritionSimple(ingredients, alimentsSimple);
    console.log('📊 [calculateNutritionHybrid] Résultat base simplifiée:', result);
    
    if (result.calories > 0) {
      console.log('✅ [calculateNutritionHybrid] Résultat valide depuis base simplifiée:', result);
      return result;
    }
  }
  
  // PRIORITÉ 3: Utiliser valeurs moyennes (dernier recours)
  console.log('💡 [calculateNutritionHybrid] Calcul avec valeurs moyennes...');
  return await calculateWithAverages(ingredients);
};

/**
 * Calcule avec les valeurs nutritionnelles moyennes
 * @param {Array} ingredients - Liste des ingrédients
 * @returns {Promise<Object>} Valeurs nutritionnelles
 */
const calculateWithAverages = async (ingredients) => {
  let totalCalories = 0;
  let totalProteines = 0;
  let totalLipides = 0;
  let totalGlucides = 0;
  
  for (const ing of ingredients) {
    console.log(`🔍 [Averages] Recherche: "${ing.nom}"`);
    
    // Convertir quantité en grammes
    const quantiteG = convertToGramsSimple(ing.quantite, ing.unite);
    
    // Chercher valeurs moyennes
    const nutritionData = await findNutritionData(ing.nom);
    
    if (nutritionData) {
      const factor = quantiteG / 100; // Pour 100g
      
      totalCalories += nutritionData.energie_kcal * factor;
      totalProteines += nutritionData.proteines_g * factor;
      totalLipides += nutritionData.lipides_g * factor;
      totalGlucides += nutritionData.glucides_g * factor;
      
      console.log(`✅ [Averages] ${ing.nom}: ${quantiteG}g = ${Math.round(nutritionData.energie_kcal * factor)} kcal`);
    } else {
      console.warn(`⚠️ [Averages] Pas de données pour "${ing.nom}"`);
    }
  }
  
  const result = {
    calories: Math.round(totalCalories),
    proteines: parseFloat(totalProteines.toFixed(1)),
    lipides: parseFloat(totalLipides.toFixed(1)),
    glucides: parseFloat(totalGlucides.toFixed(1))
  };
  
  console.log('📊 [Averages] TOTAL:', result);
  return result;
};

/**
 * Conversion simple unité → grammes
 */
const convertToGramsSimple = (quantite, unite) => {
  const uniteClean = unite.toLowerCase();
  
  if (uniteClean.includes('g') && !uniteClean.includes('kg')) return quantite;
  if (uniteClean.includes('ml')) return quantite;
  if (uniteClean.includes('soupe')) return quantite * 15;
  if (uniteClean.includes('café')) return quantite * 5;
  if (uniteClean.includes('gousse')) return quantite * 5;
  if (uniteClean.includes('moyen')) return quantite * 120;
  if (uniteClean.includes('branche')) return quantite * 2;
  
  return quantite;
};

/**
 * Génère un menu pour une journée
 * @param {Object} profile - Profil utilisateur
 * @param {Object} ciqualData - Données CIQUAL pour calcul nutritionnel (legacy)
 * @param {Array} alimentsSimple - Base de données simplifiée (prioritaire)
 * @param {Object} nutritionNeeds - Besoins nutritionnels
 * @returns {Object} - Menu de la journée
 */
const generateDayMenu = async (profile, ciqualData, alimentsSimple, nutritionNeeds) => {
  const { objectif, nombreRepas, capaciteDigestive } = profile;
  const { mealDistribution } = nutritionNeeds;
  
  const menu = {};
  
  // Petit déjeuner (si 3 repas)
  if (nombreRepas === '3') {
    const petitDejRecettes = recettesDatabase.petitDejeuner;
    const recette = petitDejRecettes[Math.floor(Math.random() * petitDejRecettes.length)];
    
    // Calculer avec système hybride (simple + CIQUAL fallback + valeurs moyennes)
    console.log(`🍳 [generateDayMenu] Calcul nutrition: ${recette.nom}`);
    const nutrition = await calculateNutritionHybrid(recette.ingredients, alimentsSimple, ciqualData);
    console.log(`📊 [generateDayMenu] Nutrition calculée pour ${recette.nom}:`, nutrition);
    
    const petitDej = {
      ...recette,
      calories: Math.round(nutrition.calories),
      caloriesCible: mealDistribution.petitDejeuner,
      proteines: parseFloat(nutrition.proteines.toFixed(1)),
      lipides: parseFloat(nutrition.lipides.toFixed(1)),
      glucides: parseFloat(nutrition.glucides.toFixed(1)),
      moment: 'Petit-déjeuner (8h-10h)'
    };
    console.log(`✅ [generateDayMenu] Objet petitDejeuner créé:`, petitDej);
    console.log(`🔍 [generateDayMenu] calories=${petitDej.calories}, proteines=${petitDej.proteines}, lipides=${petitDej.lipides}, glucides=${petitDej.glucides}`);
    menu.petitDejeuner = petitDej;
  }
  
  // Déjeuner - repas principal
  const dejeunerTypes = [...recettesDatabase.legumineuses, ...recettesDatabase.cereales]
    .filter(r => r.type === 'dejeuner');
  const recetteDejeuner = dejeunerTypes[Math.floor(Math.random() * dejeunerTypes.length)];
  
  console.log(`🍱 [generateDayMenu] Calcul nutrition: ${recetteDejeuner.nom}`);
  const nutritionDejeuner = await calculateNutritionHybrid(recetteDejeuner.ingredients, alimentsSimple, ciqualData);
  console.log(`📊 [generateDayMenu] Nutrition calculée pour ${recetteDejeuner.nom}:`, nutritionDejeuner);
  
  const dejeuner = {
    ...recetteDejeuner,
    calories: Math.round(nutritionDejeuner.calories),
    caloriesCible: mealDistribution.dejeuner,
    proteines: parseFloat(nutritionDejeuner.proteines.toFixed(1)),
    lipides: parseFloat(nutritionDejeuner.lipides.toFixed(1)),
    glucides: parseFloat(nutritionDejeuner.glucides.toFixed(1)),
    moment: 'Déjeuner (12h-14h)',
    note: 'Repas principal de la journée - Prenez votre temps pour mastiquer (minimum 20 secondes par bouchée)'
  };
  console.log(`✅ [generateDayMenu] Objet dejeuner créé:`, dejeuner);
  console.log(`🔍 [generateDayMenu] calories=${dejeuner.calories}, proteines=${dejeuner.proteines}, lipides=${dejeuner.lipides}, glucides=${dejeuner.glucides}`);
  menu.dejeuner = dejeuner;
  
  // Dîner - hypocalorique
  let dinerRecettes = recettesDatabase.diner;
  
  // Si reflux/rôt/nausée, privilégier les soupes et plats cuits
  if (capaciteDigestive.includes('Reflux gastrique') || 
      capaciteDigestive.includes('Rôt') || 
      capaciteDigestive.includes('Nausée')) {
    dinerRecettes = dinerRecettes.filter(r => 
      r.nom.includes('Soupe') || r.nom.includes('Velouté')
    );
  }
  
  const recetteDiner = dinerRecettes[Math.floor(Math.random() * dinerRecettes.length)];
  
  console.log(`🌙 [generateDayMenu] Calcul nutrition: ${recetteDiner.nom}`);
  const nutritionDiner = await calculateNutritionHybrid(recetteDiner.ingredients, alimentsSimple, ciqualData);
  console.log(`📊 [generateDayMenu] Nutrition calculée pour ${recetteDiner.nom}:`, nutritionDiner);
  
  const diner = {
    ...recetteDiner,
    calories: Math.round(nutritionDiner.calories),
    caloriesCible: mealDistribution.diner,
    proteines: parseFloat(nutritionDiner.proteines.toFixed(1)),
    lipides: parseFloat(nutritionDiner.lipides.toFixed(1)),
    glucides: parseFloat(nutritionDiner.glucides.toFixed(1)),
    moment: 'Dîner (18h-20h)',
    note: 'Repas léger - Pas de protéines animales, pas d\'amidon, pas de graisses'
  };
  console.log(`✅ [generateDayMenu] Objet diner créé:`, diner);
  console.log(`🔍 [generateDayMenu] calories=${diner.calories}, proteines=${diner.proteines}, lipides=${diner.lipides}, glucides=${diner.glucides}`);
  menu.diner = diner;
  
  return menu;
};

/**
 * Génère un menu hebdomadaire complet
 * @param {Object} profile - Profil utilisateur
 * @param {Array} alimentsSimple - Base de données simplifiée (prioritaire)
 * @param {Object} ciqualData - Données CIQUAL (legacy, optionnel)
 * @returns {Object} - Menu hebdomadaire avec conseils
 */
export const generateWeeklyMenu = async (profile, alimentsSimple = null, ciqualData = null) => {
  console.log('🌍 [generateWeeklyMenu] DÉBUT - Génération menu hebdomadaire');
  console.log('👤 [generateWeeklyMenu] Profile:', profile);
  console.log('📦 [generateWeeklyMenu] alimentsSimple:', alimentsSimple?.length || 0, 'aliments');
  console.log('📦 [generateWeeklyMenu] ciqualData:', Object.keys(ciqualData || {}).length, 'aliments');
  
  const nutritionNeeds = calculateCalories(profile);
  const weekMenu = [];
  
  const joursIntermittent = [1, 3, 5, 6]; // Lundi, Mercredi, Vendredi, Samedi pour jeûne intermittent
  
  for (let day = 1; day <= 7; day++) {
    const dayMenu = await generateDayMenu(profile, ciqualData, alimentsSimple, nutritionNeeds);
    
    // Appliquer le jeûne intermittent si objectif perte de poids
    const isJeuneIntermittent = profile.objectif === 'perte' && joursIntermittent.includes(day);
    
    if (isJeuneIntermittent) {
      delete dayMenu.diner;
      dayMenu.jeune = {
        type: 'Jeûne intermittent',
        message: 'Pas de dîner ce soir - Éviction du repas du soir',
        conseil: 'Buvez beaucoup d\'eau et des tisanes'
      };
    }
    
    const dayObject = {
      jour: getDayName(day),
      date: getDateForDay(day),
      menu: dayMenu,
      jeune: isJeuneIntermittent
    };
    console.log(`📅 [generateWeeklyMenu] Jour ${day} (${dayObject.jour}):`, dayObject);
    weekMenu.push(dayObject);
  }
  
  const finalMenu = {
    semaine: weekMenu,
    nutritionNeeds,
    conseils: generateTips(profile)
  };
  console.log('✅ [generateWeeklyMenu] MENU FINAL COMPLET:', finalMenu);
  return finalMenu;
};

/**
 * Obtenir le nom du jour
 */
const getDayName = (dayNumber) => {
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (dayNumber - 1));
  return jours[targetDate.getDay()];
};

/**
 * Obtenir la date pour un jour
 */
const getDateForDay = (dayNumber) => {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (dayNumber - 1));
  return targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
};

/**
 * Génère les conseils personnalisés
 */
const generateTips = (profile) => {
  const { objectif, capaciteDigestive, intolerances } = profile;
  const tips = [
    '💤 Respectez un sommeil de 8h minimum',
    '🚶 Faites 10 000 pas par jour',
    '⏱️ Tous les repas doivent être pris dans une plage de 8h',
    '🥄 Mastiquez chaque bouchée pendant minimum 20 secondes',
  ];
  
  if (objectif === 'perte') {
    tips.push('🚫 Évitez le pain, préférez les craquantes de sarrasin');
    tips.push('📊 Limitez les glucides à 100g par jour');
    tips.push('🥗 50% des légumes doivent être crus, 50% cuits');
    tips.push('🍫 Un carré de chocolat à 85% autorisé 3 fois par semaine');
    tips.push('⏰ Le repas du soir doit être le plus léger');
    tips.push('💧 Buvez 1,5 à 2L d\'eau par jour');
  }
  
  if (capaciteDigestive.includes('Reflux gastrique') || 
      capaciteDigestive.includes('Rôt') || 
      capaciteDigestive.includes('Nausée')) {
    tips.push('🫚 Buvez eau tiède + ¼ citron + gingembre avant chaque repas');
    tips.push('🍽️ Privilégiez les aliments cuits');
    tips.push('⏰ Dînez le plus tôt possible');
  }
  
  if (capaciteDigestive.includes('Ballonnement')) {
    tips.push('🌾 Alimentation pauvre en FODMAP recommandée');
    tips.push('🥛 Évitez les produits laitiers');
    
    if (capaciteDigestive.includes('Transit lent')) {
      tips.push('🌰 2 cuillères à café de graines de lin broyées le matin');
      tips.push('🍇 Ajoutez des pruneaux le matin ou le soir');
      tips.push('💧 Buvez 1,5 à 3L d\'eau par jour');
    }
  }
  
  if (intolerances.length > 0) {
    tips.push(`⚠️ Éviction complète de : ${intolerances.join(', ')}`);
  }
  
  return tips;
};

/**
 * Parse le fichier CSV des aliments
 */
export const parseAlimentsCSV = (csvText) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  const aliments = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = lines[i].split(',');
    const aliment = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      // Convertir les valeurs numériques
      if (index > 0 && value && value !== '-' && value !== 'NaN') {
        aliment[header] = parseFloat(value) || value;
      } else {
        aliment[header] = value;
      }
    });
    
    if (aliment.alim_nom_fr && aliment.alim_nom_fr !== 'NaN') {
      aliments.push(aliment);
    }
  }
  
  return aliments;
};
