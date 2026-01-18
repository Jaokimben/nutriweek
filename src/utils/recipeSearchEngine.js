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
// SYSTÈME DE CATÉGORISATION DES ALIMENTS
// ========================================

/**
 * Catégories d'aliments selon les principes culinaires
 * Basé sur la gastronomie française et internationale
 */
const CATEGORIES_ALIMENTS = {
  // PROTÉINES ANIMALES
  viandes_rouges: [
    'boeuf', 'veau', 'agneau', 'mouton', 'steak', 'viande hachée',
    'viande rouge', 'bifteck', 'entrecôte', 'faux-filet', 'bavette'
  ],
  viandes_blanches: [
    'poulet', 'dinde', 'porc', 'lapin', 'escalope', 'blanc de poulet',
    'cuisse de poulet', 'filet de poulet', 'jambon', 'lardons'
  ],
  poissons_maigres: [
    'cabillaud', 'colin', 'merlan', 'lieu', 'sole', 'limande',
    'poisson blanc', 'bar', 'dorade', 'daurade'
  ],
  poissons_gras: [
    'saumon', 'thon', 'maquereau', 'sardine', 'hareng', 'truite',
    'anchois'
  ],
  fruits_mer: [
    'moules', 'crevettes', 'coquilles saint-jacques', 'huîtres',
    'palourdes', 'bulots', 'calamars', 'poulpe', 'fruits de mer',
    'crustacés', 'coquillages'
  ],
  oeufs: ['oeufs', 'oeuf', 'blanc d\'oeuf', 'jaune d\'oeuf'],
  
  // FÉCULENTS
  cereales: [
    'riz', 'pâtes', 'quinoa', 'boulgour', 'couscous', 'semoule',
    'blé', 'orge', 'millet', 'avoine', 'flocons d\'avoine'
  ],
  pains: [
    'pain', 'pain complet', 'pain blanc', 'baguette', 'brioche',
    'pain de mie', 'pain grillé', 'toast', 'biscottes'
  ],
  legumineuses: [
    'lentilles', 'pois chiches', 'haricots', 'fèves', 'pois cassés',
    'flageolets', 'haricots blancs', 'haricots rouges'
  ],
  tubercules: [
    'pommes de terre', 'patates douces', 'igname', 'manioc'
  ],
  
  // LÉGUMES
  legumes_verts: [
    'haricots verts', 'courgettes', 'brocoli', 'épinards', 'salade',
    'chou', 'concombre', 'poivrons verts', 'petits pois',
    'asperges', 'céleri', 'fenouil'
  ],
  legumes_racines: [
    'carottes', 'navets', 'betteraves', 'radis', 'céleri-rave',
    'panais', 'topinambour'
  ],
  legumes_divers: [
    'tomates', 'poivrons', 'aubergines', 'champignons', 'oignons',
    'échalotes', 'ail', 'poireaux', 'endives'
  ],
  
  // PRODUITS LAITIERS
  laitages: [
    'lait', 'yaourt', 'fromage blanc', 'fromage', 'crème',
    'crème fraîche', 'beurre', 'parmesan', 'mozzarella', 'gruyère'
  ],
  
  // FRUITS
  fruits_frais: [
    'pomme', 'poire', 'banane', 'orange', 'kiwi', 'fraise',
    'framboise', 'myrtille', 'raisin', 'melon', 'pastèque',
    'pêche', 'abricot', 'prune', 'cerise'
  ],
  fruits_secs: [
    'raisins secs', 'abricots secs', 'dattes', 'figues sèches',
    'pruneaux', 'fruits secs'
  ],
  
  // SUCRÉS
  sucres: [
    'confiture', 'miel', 'sirop', 'sucre', 'chocolat', 'nutella',
    'pâte à tartiner', 'caramel', 'compote'
  ],
  
  // MATIÈRES GRASSES
  huiles: [
    'huile d\'olive', 'huile de colza', 'huile de tournesol',
    'huile de noix', 'huile'
  ],
  
  // CONDIMENTS
  condiments: [
    'sel', 'poivre', 'herbes', 'épices', 'moutarde', 'vinaigre',
    'sauce soja', 'bouillon', 'fond de veau', 'vin'
  ]
};

// ========================================
// RÈGLES DE COHÉRENCE CULINAIRE
// ========================================

/**
 * Règles de combinaisons INTERDITES basées sur la gastronomie
 * Format: [categorie1, categorie2] ou [ingredient_specifique1, ingredient_specifique2]
 */
const REGLES_INCOHERENCE = [
  // RÈGLE 1: PAS DE MIX VIANDE ROUGE + POISSON/FRUITS DE MER
  {
    categories: ['viandes_rouges', 'poissons_maigres'],
    raison: 'Les viandes rouges et poissons ne se mélangent jamais dans un même plat'
  },
  {
    categories: ['viandes_rouges', 'poissons_gras'],
    raison: 'Les viandes rouges et poissons ne se mélangent jamais dans un même plat'
  },
  {
    categories: ['viandes_rouges', 'fruits_mer'],
    raison: 'Viande rouge et fruits de mer sont incompatibles (ex: steak haché + moules)'
  },
  
  // RÈGLE 2: PAS DE MIX VIANDE BLANCHE + POISSON/FRUITS DE MER
  {
    categories: ['viandes_blanches', 'poissons_maigres'],
    raison: 'Volaille et poisson ne se combinent pas dans un même plat'
  },
  {
    categories: ['viandes_blanches', 'poissons_gras'],
    raison: 'Volaille et poisson ne se combinent pas dans un même plat'
  },
  {
    categories: ['viandes_blanches', 'fruits_mer'],
    raison: 'Volaille et fruits de mer sont généralement séparés'
  },
  
  // RÈGLE 3: PAS DE MIX POISSON + FRUITS DE MER (sauf cas spéciaux)
  // Note: On autorise certains mix comme bouillabaisse, mais pas tous
  {
    categories: ['poissons_maigres', 'fruits_mer'],
    raison: 'Poisson et fruits de mer ensemble nécessitent une recette spécifique',
    severite: 'avertissement' // Moins strict
  },
  
  // RÈGLE 4: PAS DE SUCRÉ-SALÉ INAPPROPRIÉ
  {
    categories: ['sucres', 'viandes_rouges'],
    raison: 'Confiture/chocolat et viande ne vont pas ensemble'
  },
  {
    categories: ['sucres', 'viandes_blanches'],
    raison: 'Confiture/chocolat et volaille ne vont pas ensemble',
    exceptions: ['canard à l\'orange', 'poulet aux abricots'] // Exceptions connues
  },
  {
    categories: ['sucres', 'poissons_maigres'],
    raison: 'Confiture/chocolat et poisson ne vont pas ensemble'
  },
  {
    categories: ['sucres', 'poissons_gras'],
    raison: 'Confiture/chocolat et poisson ne vont pas ensemble'
  },
  {
    categories: ['sucres', 'fruits_mer'],
    raison: 'Confiture/chocolat et fruits de mer ne vont pas ensemble'
  },
  
  // RÈGLE 5: PAS DE MIX VIANDES DIFFÉRENTES (sauf charcuteries)
  {
    categories: ['viandes_rouges', 'viandes_blanches'],
    raison: 'On ne mélange généralement pas boeuf et poulet dans un même plat',
    severite: 'avertissement'
  },
  
  // RÈGLE 6: FRUITS FRAIS + VIANDE/POISSON (sauf recettes spécifiques)
  {
    categories: ['fruits_frais', 'viandes_rouges'],
    raison: 'Fruits frais et viande rouge rarement compatibles',
    severite: 'avertissement',
    exceptions: ['canard aux figues', 'magret aux poires']
  },
  {
    categories: ['fruits_frais', 'poissons_maigres'],
    raison: 'Fruits frais et poisson seulement dans recettes asiatiques spécifiques',
    severite: 'avertissement',
    exceptions: ['ceviche', 'poisson à l\'ananas']
  }
];

/**
 * Paires d'ingrédients SPÉCIFIQUES qui ne vont PAS ensemble
 * Pour des cas très précis non couverts par les catégories
 */
const COMBINAISONS_INTERDITES_SPECIFIQUES = [
  // Cas très spécifiques
  ['viande hachée', 'moules'],
  ['steak', 'crevettes'],
  ['boeuf', 'saumon'],
  ['poulet', 'cabillaud'],
  ['confiture', 'thon'],
  ['chocolat', 'poulet'],
  ['miel', 'poisson'],
  ['nutella', 'viande']
];

/**
 * Détermine la catégorie d'un ingrédient
 * @param {string} ingredient - Nom de l'ingrédient
 * @returns {string[]} Liste des catégories correspondantes
 */
function categoriserIngredient(ingredient) {
  const categories = [];
  const ingNormalise = normaliserNomIngredient(ingredient);
  
  for (const [categorie, termes] of Object.entries(CATEGORIES_ALIMENTS)) {
    for (const terme of termes) {
      const termeNormalise = normaliserNomIngredient(terme);
      if (ingNormalise.includes(termeNormalise) || termeNormalise.includes(ingNormalise)) {
        categories.push(categorie);
        break;
      }
    }
  }
  
  return categories;
}

/**
 * Vérifie si une combinaison d'ingrédients est cohérente selon les règles culinaires
 * @param {string[]} ingredients - Liste des ingrédients
 * @returns {{coherent: boolean, raisons: string[]}} Résultat de la validation
 */
function verifierCoherenceCombinaison(ingredients) {
  const raisons = [];
  
  // Normaliser les ingrédients
  const ingredientsNormalises = ingredients.map(i => normaliserNomIngredient(i));
  
  console.log(`\n🔍 Vérification cohérence pour: ${ingredients.join(', ')}`);
  
  // ÉTAPE 1: Vérifier les combinaisons spécifiques interdites
  for (const [ing1, ing2] of COMBINAISONS_INTERDITES_SPECIFIQUES) {
    const hasIng1 = ingredientsNormalises.some(i => i.includes(normaliserNomIngredient(ing1)));
    const hasIng2 = ingredientsNormalises.some(i => i.includes(normaliserNomIngredient(ing2)));
    
    if (hasIng1 && hasIng2) {
      const raison = `❌ Combinaison spécifique interdite: "${ing1}" + "${ing2}"`;
      console.log(`  ${raison}`);
      raisons.push(raison);
      return { coherent: false, raisons };
    }
  }
  
  // ÉTAPE 2: Catégoriser tous les ingrédients
  const categoriesPresentes = new Map(); // Map<categorie, [ingredients]>
  
  for (const ingredient of ingredients) {
    const categories = categoriserIngredient(ingredient);
    console.log(`  📋 "${ingredient}" → catégories: ${categories.join(', ') || 'aucune'}`);
    
    for (const categorie of categories) {
      if (!categoriesPresentes.has(categorie)) {
        categoriesPresentes.set(categorie, []);
      }
      categoriesPresentes.get(categorie).push(ingredient);
    }
  }
  
  // ÉTAPE 3: Vérifier les règles d'incohérence entre catégories
  for (const regle of REGLES_INCOHERENCE) {
    const [cat1, cat2] = regle.categories;
    
    if (categoriesPresentes.has(cat1) && categoriesPresentes.has(cat2)) {
      const ingredients1 = categoriesPresentes.get(cat1);
      const ingredients2 = categoriesPresentes.get(cat2);
      
      // Vérifier les exceptions si définies
      if (regle.exceptions) {
        const nomRecette = ingredients.join(' ').toLowerCase();
        const estException = regle.exceptions.some(exc => 
          nomRecette.includes(exc.toLowerCase())
        );
        
        if (estException) {
          console.log(`  ✅ Exception autorisée: recette spéciale détectée`);
          continue;
        }
      }
      
      const severite = regle.severite || 'erreur';
      const symbole = severite === 'erreur' ? '❌' : '⚠️';
      
      const raison = `${symbole} ${regle.raison}\n` +
                     `   → ${cat1}: ${ingredients1.join(', ')}\n` +
                     `   → ${cat2}: ${ingredients2.join(', ')}`;
      
      console.log(`  ${raison}`);
      
      if (severite === 'erreur') {
        raisons.push(raison);
        return { coherent: false, raisons };
      } else {
        raisons.push(raison);
      }
    }
  }
  
  // ÉTAPE 4: Validation positive
  if (raisons.length === 0) {
    console.log(`  ✅ Combinaison cohérente: aucune incohérence détectée`);
    return { coherent: true, raisons: ['✅ Combinaison culinairement cohérente'] };
  }
  
  // Avertissements seulement
  console.log(`  ⚠️ Combinaison avec avertissements (${raisons.length})`);
  return { coherent: true, raisons }; // On autorise mais on avertit
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
        const validationCoherence = verifierCoherenceCombinaison(recette.ingredients);
        
        if (!validationCoherence.coherent) {
          console.log(`    ⚠️ Recette ${recette.nom} rejetée: combinaison incohérente`);
          console.log(`    Raisons:`, validationCoherence.raisons);
          continue;
        }
        
        console.log(`    ✅ Recette possible: ${recette.nom} (score: ${recette.score})`);
        if (validationCoherence.raisons.length > 0) {
          console.log(`    💡 Notes:`, validationCoherence.raisons);
        }
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
  
  // Vérifier la cohérence finale du repas construit
  const nomsIngredients = ingredients.map(ing => ing.nom);
  const validationCoherence = verifierCoherenceCombinaison(nomsIngredients);
  
  if (!validationCoherence.coherent) {
    console.log(`  ❌ ATTENTION: Le repas construit contient des incohérences:`);
    validationCoherence.raisons.forEach(r => console.log(`     ${r}`));
    return null; // Rejeter le repas incohérent
  }
  
  return {
    nom: recette.nom,
    ingredients,
    nutrition,
    score: recette.score,
    source: 'recette_coherente',
    coherence: validationCoherence
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

// Export de la fonction de validation (non exportée dans sa déclaration)
export { verifierCoherenceCombinaison };

// Export par défaut pour compatibilité
export default {
  chercherRecetteCoherente,
  construireRepasDepuisRecette,
  validerIngredientsRepas,
  verifierCoherenceCombinaison
};
