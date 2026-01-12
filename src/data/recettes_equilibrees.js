/**
 * BASE DE DONNÉES DE RECETTES ÉQUILIBRÉES
 * 
 * Recettes COMPLÈTES avec protéines, féculents et légumes
 * Pour atteindre les objectifs caloriques (1500-2500 kcal/jour)
 */

import { calculerNutritionRecette } from '../utils/nutritionStricte.js';

// ===========================
// PETIT-DÉJEUNER (400-600 kcal)
// ===========================

export const recettesPetitDejeuner = [
  {
    id: 'pd_oeufs_pain_avocat',
    nom: 'Œufs brouillés, pain complet et avocat',
    type: 'petit_dejeuner',
    ingredients: [
      { nom: 'Œuf, entier, cuit', quantite: 120, unite: 'g' }, // 2 œufs = 186 kcal
      { nom: 'Pain complet', quantite: 60, unite: 'g' }, // 148 kcal
      { nom: 'Avocat, pulpe, cru', quantite: 50, unite: 'g' }, // 80 kcal
      { nom: 'Tomate, crue', quantite: 80, unite: 'g' } // 14 kcal
    ],
    preparation: 'Brouiller les œufs. Toaster le pain. Ajouter l\'avocat écrasé et la tomate.',
    tags: ['protéiné', 'complet', 'rapide']
  },
  {
    id: 'pd_yaourt_muesli_fruits',
    nom: 'Yaourt grec, müesli et fruits',
    type: 'petit_dejeuner',
    ingredients: [
      { nom: 'Yaourt grec nature 0%', quantite: 200, unite: 'g' }, // 118 kcal
      { nom: 'Müesli sans sucre ajouté', quantite: 60, unite: 'g' }, // 220 kcal
      { nom: 'Banane, crue', quantite: 100, unite: 'g' }, // 89 kcal
      { nom: 'Amandes', quantite: 15, unite: 'g' } // 87 kcal
    ],
    preparation: 'Mélanger le yaourt avec le müesli. Ajouter la banane tranchée et les amandes.',
    tags: ['protéiné', 'énergétique', 'rapide']
  },
  {
    id: 'pd_porridge_beurre_cacahuete',
    nom: 'Porridge aux flocons d\'avoine et beurre de cacahuète',
    type: 'petit_dejeuner',
    ingredients: [
      { nom: 'Flocons d\'avoine', quantite: 60, unite: 'g' }, // 233 kcal
      { nom: 'Lait demi-écrémé', quantite: 200, unite: 'ml' }, // 100 kcal
      { nom: 'Beurre de cacahuète', quantite: 20, unite: 'g' }, // 118 kcal
      { nom: 'Banane, crue', quantite: 80, unite: 'g' } // 71 kcal
    ],
    preparation: 'Cuire les flocons dans le lait. Ajouter le beurre de cacahuète et la banane.',
    tags: ['protéiné', 'réconfortant', 'énergétique']
  },
  {
    id: 'pd_omelette_pain_fromage',
    nom: 'Omelette aux légumes, pain et fromage blanc',
    type: 'petit_dejeuner',
    ingredients: [
      { nom: 'Œuf, entier, cuit', quantite: 120, unite: 'g' }, // 186 kcal
      { nom: 'Pain complet', quantite: 50, unite: 'g' }, // 124 kcal
      { nom: 'Fromage blanc 0%', quantite: 100, unite: 'g' }, // 45 kcal
      { nom: 'Tomate, crue', quantite: 80, unite: 'g' }, // 14 kcal
      { nom: 'Poivron rouge, cru', quantite: 50, unite: 'g' } // 16 kcal
    ],
    preparation: 'Faire une omelette avec les œufs et légumes. Servir avec le pain et le fromage blanc.',
    tags: ['protéiné', 'complet', 'équilibré']
  }
];

// ===========================
// DÉJEUNER (600-900 kcal)
// ===========================

export const recettesDejeuner = [
  {
    id: 'dej_poulet_riz_legumes',
    nom: 'Poulet grillé, riz basmati et légumes vapeur',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Poulet, blanc, cuit', quantite: 180, unite: 'g' }, // 297 kcal
      { nom: 'Riz basmati, cuit', quantite: 200, unite: 'g' }, // 260 kcal
      { nom: 'Brocoli, cuit vapeur', quantite: 150, unite: 'g' }, // 53 kcal
      { nom: 'Carotte, crue', quantite: 100, unite: 'g' }, // 41 kcal
      { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' } // 90 kcal
    ],
    preparation: 'Griller le poulet. Cuire le riz. Cuire les légumes à la vapeur. Assaisonner avec l\'huile.',
    tags: ['protéiné', 'complet', 'équilibré']
  },
  {
    id: 'dej_saumon_quinoa_asperges',
    nom: 'Saumon au four, quinoa et légumes',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Saumon, cuit au four', quantite: 150, unite: 'g' }, // 309 kcal
      { nom: 'Quinoa, cuit', quantite: 180, unite: 'g' }, // 216 kcal
      { nom: 'Courgette, crue', quantite: 150, unite: 'g' }, // 26 kcal
      { nom: 'Tomate, crue', quantite: 100, unite: 'g' }, // 18 kcal
      { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' } // 90 kcal
    ],
    preparation: 'Cuire le saumon au four. Préparer le quinoa. Faire sauter les légumes à l\'huile d\'olive.',
    tags: ['oméga-3', 'complet', 'santé']
  },
  {
    id: 'dej_boeuf_pates_ratatouille',
    nom: 'Steak haché, pâtes complètes et ratatouille',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Bœuf, steak haché 5% MG, cuit', quantite: 150, unite: 'g' }, // 233 kcal
      { nom: 'Pâtes complètes, cuites', quantite: 200, unite: 'g' }, // 248 kcal
      { nom: 'Courgette, crue', quantite: 100, unite: 'g' }, // 17 kcal
      { nom: 'Tomate, crue', quantite: 150, unite: 'g' }, // 27 kcal
      { nom: 'Poivron rouge, cru', quantite: 80, unite: 'g' }, // 25 kcal
      { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' } // 90 kcal
    ],
    preparation: 'Cuire le steak. Préparer les pâtes. Faire la ratatouille avec les légumes.',
    tags: ['protéiné', 'énergétique', 'complet']
  },
  {
    id: 'dej_dinde_patates_haricots',
    nom: 'Escalope de dinde, patates douces et haricots verts',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Dinde, escalope, cuite', quantite: 180, unite: 'g' }, // 243 kcal
      { nom: 'Patate douce, cuite', quantite: 200, unite: 'g' }, // 172 kcal
      { nom: 'Haricots verts, cuits', quantite: 150, unite: 'g' }, // 47 kcal
      { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' } // 90 kcal
    ],
    preparation: 'Griller la dinde. Cuire les patates douces. Cuire les haricots verts. Assaisonner.',
    tags: ['protéiné', 'léger', 'complet']
  },
  {
    id: 'dej_lentilles_riz_legumes',
    nom: 'Dahl de lentilles, riz et légumes',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Lentilles, cuites', quantite: 200, unite: 'g' }, // 232 kcal
      { nom: 'Riz basmati, cuit', quantite: 150, unite: 'g' }, // 195 kcal
      { nom: 'Carotte, crue', quantite: 100, unite: 'g' }, // 41 kcal
      { nom: 'Épinards, cuits', quantite: 100, unite: 'g' }, // 23 kcal
      { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' } // 90 kcal
    ],
    preparation: 'Préparer le dahl avec les lentilles. Cuire le riz. Ajouter les légumes.',
    tags: ['végétarien', 'protéiné', 'complet']
  },
  {
    id: 'dej_pois_chiches_legumes',
    nom: 'Pois chiches rôtis, pommes de terre et légumes',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Pois chiches, cuits', quantite: 200, unite: 'g' }, // 328 kcal
      { nom: 'Pomme de terre, cuite vapeur', quantite: 150, unite: 'g' }, // 129 kcal
      { nom: 'Courgette, crue', quantite: 100, unite: 'g' }, // 17 kcal
      { nom: 'Tomate, crue', quantite: 100, unite: 'g' }, // 18 kcal
      { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' } // 90 kcal
    ],
    preparation: 'Rôtir les pois chiches. Cuire les pommes de terre. Faire sauter les légumes.',
    tags: ['végétarien', 'protéiné', 'rassasiant']
  }
];

// ===========================
// DÎNER (500-700 kcal)
// ===========================

export const recettesDiner = [
  {
    id: 'din_saumon_legumes_riz',
    nom: 'Saumon vapeur, légumes et riz complet',
    type: 'diner',
    ingredients: [
      { nom: 'Saumon, cuit au four', quantite: 120, unite: 'g' }, // 247 kcal
      { nom: 'Riz complet, cuit', quantite: 120, unite: 'g' }, // 133 kcal
      { nom: 'Brocoli, cuit vapeur', quantite: 150, unite: 'g' }, // 53 kcal
      { nom: 'Carotte, crue', quantite: 80, unite: 'g' } // 33 kcal
    ],
    preparation: 'Cuire le saumon à la vapeur. Préparer le riz complet. Cuire les légumes.',
    tags: ['léger', 'oméga-3', 'santé']
  },
  {
    id: 'din_oeufs_legumes_patates',
    nom: 'Omelette aux légumes et patates douces',
    type: 'diner',
    ingredients: [
      { nom: 'Œuf, entier, cuit', quantite: 150, unite: 'g' }, // 233 kcal
      { nom: 'Patate douce, cuite', quantite: 150, unite: 'g' }, // 129 kcal
      { nom: 'Épinards, cuits', quantite: 100, unite: 'g' }, // 23 kcal
      { nom: 'Tomate, crue', quantite: 100, unite: 'g' }, // 18 kcal
      { nom: 'Huile d\'olive', quantite: 8, unite: 'ml' } // 72 kcal
    ],
    preparation: 'Faire l\'omelette avec les légumes. Servir avec les patates douces rôties.',
    tags: ['protéiné', 'léger', 'équilibré']
  },
  {
    id: 'din_tofu_legumes_quinoa',
    nom: 'Tofu sauté, légumes et quinoa',
    type: 'diner',
    ingredients: [
      { nom: 'Tofu, nature', quantite: 180, unite: 'g' }, // 137 kcal
      { nom: 'Quinoa, cuit', quantite: 150, unite: 'g' }, // 180 kcal
      { nom: 'Courgette, crue', quantite: 120, unite: 'g' }, // 20 kcal
      { nom: 'Poivron rouge, cru', quantite: 100, unite: 'g' }, // 31 kcal
      { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' } // 90 kcal
    ],
    preparation: 'Faire sauter le tofu avec les légumes. Servir avec le quinoa.',
    tags: ['végétarien', 'léger', 'protéiné']
  },
  {
    id: 'din_cabillaud_legumes',
    nom: 'Cabillaud vapeur et légumes méditerranéens',
    type: 'diner',
    ingredients: [
      { nom: 'Cabillaud, cuit vapeur', quantite: 180, unite: 'g' }, // 189 kcal
      { nom: 'Pomme de terre, cuite vapeur', quantite: 150, unite: 'g' }, // 129 kcal
      { nom: 'Courgette, crue', quantite: 120, unite: 'g' }, // 20 kcal
      { nom: 'Tomate, crue', quantite: 100, unite: 'g' }, // 18 kcal
      { nom: 'Huile d\'olive', quantite: 10, unite: 'ml' } // 90 kcal
    ],
    preparation: 'Cuire le cabillaud à la vapeur. Préparer les légumes. Assaisonner à l\'huile d\'olive.',
    tags: ['léger', 'protéiné', 'santé']
  },
  {
    id: 'din_poulet_salade_avocat',
    nom: 'Salade de poulet, avocat et quinoa',
    type: 'diner',
    ingredients: [
      { nom: 'Poulet, blanc, cuit', quantite: 120, unite: 'g' }, // 198 kcal
      { nom: 'Quinoa, cuit', quantite: 100, unite: 'g' }, // 120 kcal
      { nom: 'Avocat, pulpe, cru', quantite: 60, unite: 'g' }, // 96 kcal
      { nom: 'Salade verte, crue', quantite: 100, unite: 'g' }, // 15 kcal
      { nom: 'Tomate, crue', quantite: 80, unite: 'g' } // 14 kcal
    ],
    preparation: 'Mélanger tous les ingrédients. Assaisonner avec de l\'huile d\'olive.',
    tags: ['frais', 'protéiné', 'complet']
  },
  {
    id: 'din_thon_haricots_legumes',
    nom: 'Thon, haricots rouges et légumes',
    type: 'diner',
    ingredients: [
      { nom: 'Thon, en conserve au naturel', quantite: 120, unite: 'g' }, // 158 kcal
      { nom: 'Haricots rouges, cuits', quantite: 150, unite: 'g' }, // 191 kcal
      { nom: 'Tomate, crue', quantite: 100, unite: 'g' }, // 18 kcal
      { nom: 'Concombre, cru', quantite: 100, unite: 'g' }, // 15 kcal
      { nom: 'Huile d\'olive', quantite: 8, unite: 'ml' } // 72 kcal
    ],
    preparation: 'Mélanger le thon avec les haricots et les légumes. Assaisonner.',
    tags: ['protéiné', 'rapide', 'complet']
  }
];

// COMBINER TOUTES LES RECETTES
export const toutesLesRecettes = [
  ...recettesPetitDejeuner,
  ...recettesDejeuner,
  ...recettesDiner
];

// Ajouter les calculs nutritionnels à chaque recette au chargement
toutesLesRecettes.forEach(recette => {
  try {
    const nutrition = calculerNutritionRecette(recette.ingredients);
    recette.nutrition = nutrition;
    console.log(`✅ Recette "${recette.nom}": ${Math.round(nutrition.calories)} kcal`);
  } catch (error) {
    console.error(`❌ Erreur calcul recette "${recette.nom}":`, error);
    recette.nutrition = {
      calories: 0,
      proteines: 0,
      glucides: 0,
      lipides: 0,
      sucres: 0,
      magnesium: 0
    };
  }
});

export default {
  petitDejeuner: recettesPetitDejeuner,
  dejeuner: recettesDejeuner,
  diner: recettesDiner,
  toutes: toutesLesRecettes
};
