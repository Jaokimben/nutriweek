/**
 * BASE DE DONNÉES DE RECETTES STRICTES
 * 
 * Utilise UNIQUEMENT les aliments du fichier Excel autorisé
 * Chaque recette est validée pour les calculs nutritionnels
 */

import { calculerNutritionRecette } from '../utils/nutritionStricte.js';

// RECETTES PETIT-DÉJEUNER
export const recettesPetitDejeuner = [
  {
    id: 'pd_avocat_toast',
    nom: 'Tartine d\'avocat',
    type: 'petit_dejeuner',
    ingredients: [
      { nom: 'Avocat, pulpe, cru', quantite: 50, unite: 'g' },
      { nom: 'Pomme Golden, pulpe et peau, crue', quantite: 100, unite: 'g' }
    ],
    preparation: 'Écrasez l\'avocat et étalez-le sur le pain. Ajoutez la pomme en tranches.',
    tags: ['végétarien', 'rapide', 'santé']
  },
  {
    id: 'pd_fruits_rouges',
    nom: 'Bol de fruits rouges et pomme',
    type: 'petit_dejeuner',
    ingredients: [
      { nom: 'Fruits rouges, crus (framboises, fraises, groseilles, cassis)', quantite: 100, unite: 'g' },
      { nom: 'Pomme Golden, pulpe et peau, crue', quantite: 150, unite: 'g' },
      { nom: 'Raisin noir Muscat, cru', quantite: 50, unite: 'g' }
    ],
    preparation: 'Mélangez tous les fruits dans un bol.',
    tags: ['végétarien', 'léger', 'antioxydants']
  },
  {
    id: 'pd_salade_fruits',
    nom: 'Salade de fruits mixte',
    type: 'petit_dejeuner',
    ingredients: [
      { nom: 'Pomme Golden, pulpe et peau, crue', quantite: 100, unite: 'g' },
      { nom: 'Framboise, surgelée, crue', quantite: 50, unite: 'g' },
      { nom: 'Myrtille, surgelée, crue', quantite: 50, unite: 'g' },
      { nom: 'Raisin noir Muscat, cru', quantite: 50, unite: 'g' }
    ],
    preparation: 'Décongeler les fruits surgelés et mélanger avec les fruits frais.',
    tags: ['végétarien', 'vitaminé', 'coloré']
  }
];

// RECETTES DÉJEUNER AVEC LÉGUMES
export const recettesDejeunerLegumes = [
  {
    id: 'dej_salade_avocat',
    nom: 'Grande salade d\'avocat et légumes',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Avocat, pulpe, cru', quantite: 100, unite: 'g' },
      { nom: 'Carotte, crue', quantite: 80, unite: 'g' },
      { nom: 'Concombre, pulpe et peau, cru', quantite: 100, unite: 'g' },
      { nom: 'Laitue, crue', quantite: 50, unite: 'g' },
      { nom: 'Tomate, séchée, à l\'huile', quantite: 30, unite: 'g' }
    ],
    preparation: 'Coupez tous les légumes en dés ou tranches. Mélangez dans un saladier.',
    tags: ['végétarien', 'complet', 'frais']
  },
  {
    id: 'dej_brocoli_vapeur',
    nom: 'Brocoli vapeur et pommes de terre',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Brocoli, cuit à la vapeur', quantite: 200, unite: 'g' },
      { nom: 'Pomme de terre, appertisée, égouttée', quantite: 150, unite: 'g' },
      { nom: 'Carotte, bouillie/cuite à l\'eau, croquante', quantite: 100, unite: 'g' }
    ],
    preparation: 'Réchauffez le brocoli vapeur. Servez avec les pommes de terre et les carottes.',
    tags: ['végétarien', 'chaud', 'simple']
  },
  {
    id: 'dej_puree_legumes',
    nom: 'Purée de légumes mélangés',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Légumes (3-4 sortes en mélange), purée', quantite: 200, unite: 'g' },
      { nom: 'Carotte, purée', quantite: 100, unite: 'g' },
      { nom: 'Brocoli, purée', quantite: 100, unite: 'g' }
    ],
    preparation: 'Réchauffez toutes les purées et mélangez-les ensemble.',
    tags: ['végétarien', 'onctueux', 'réconfortant']
  },
  {
    id: 'dej_champignons_shiitake',
    nom: 'Sauté de champignons shiitaké',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Champignon, lentin comestible ou shiitaké, séché', quantite: 30, unite: 'g' },
      { nom: 'Champignon, tout type, cru', quantite: 150, unite: 'g' },
      { nom: 'Oignon, cru', quantite: 50, unite: 'g' },
      { nom: 'Courgette, pulpe et peau, crue', quantite: 100, unite: 'g' }
    ],
    preparation: 'Réhydratez les shiitaké. Faites sauter tous les champignons avec l\'oignon et la courgette.',
    tags: ['végétarien', 'umami', 'protéiné']
  }
];

// RECETTES DÎNER LÉGER
export const recettesDinerLeger = [
  {
    id: 'din_soupe_legumes',
    nom: 'Soupe de légumes mixtes',
    type: 'diner',
    ingredients: [
      { nom: 'Carotte, crue', quantite: 100, unite: 'g' },
      { nom: 'Courgette, pulpe et peau, crue', quantite: 100, unite: 'g' },
      { nom: 'Céleri branche, cru', quantite: 50, unite: 'g' },
      { nom: 'Oignon, cru', quantite: 50, unite: 'g' },
      { nom: 'Tomate, coulis, appertisé (purée de tomates mi-réduite à 11%)', quantite: 50, unite: 'g' }
    ],
    preparation: 'Coupez les légumes en morceaux. Faites cuire dans l\'eau bouillante 20 minutes. Mixez.',
    tags: ['végétarien', 'léger', 'chaud']
  },
  {
    id: 'din_salade_chou',
    nom: 'Salade de chou rouge et endives',
    type: 'diner',
    ingredients: [
      { nom: 'Chou rouge, cru', quantite: 100, unite: 'g' },
      { nom: 'Endive, crue', quantite: 100, unite: 'g' },
      { nom: 'Carotte, crue', quantite: 80, unite: 'g' },
      { nom: 'Pomme Golden, pulpe et peau, crue', quantite: 50, unite: 'g' }
    ],
    preparation: 'Râpez le chou et les carottes. Coupez les endives. Ajoutez la pomme en dés.',
    tags: ['végétarien', 'croquant', 'frais']
  },
  {
    id: 'din_champignons_light',
    nom: 'Champignons de Paris légers',
    type: 'diner',
    ingredients: [
      { nom: 'Champignon de Paris ou champignon de couche, surgelé, cru', quantite: 150, unite: 'g' },
      { nom: 'Champignon, tout type, cru', quantite: 100, unite: 'g' },
      { nom: 'Fenouil, cru', quantite: 80, unite: 'g' }
    ],
    preparation: 'Faites cuire les champignons avec le fenouil émincé.',
    tags: ['végétarien', 'léger', 'parfumé']
  },
  {
    id: 'din_concombre_fraicheur',
    nom: 'Concombre et légumes croquants',
    type: 'diner',
    ingredients: [
      { nom: 'Concombre, pulpe et peau, cru', quantite: 200, unite: 'g' },
      { nom: 'Concombre, pulpe, cru', quantite: 100, unite: 'g' },
      { nom: 'Roquette, crue', quantite: 50, unite: 'g' },
      { nom: 'Tomate, séchée', quantite: 20, unite: 'g' }
    ],
    preparation: 'Coupez les concombres en rondelles. Ajoutez la roquette et les tomates séchées réhydratées.',
    tags: ['végétarien', 'très léger', 'hydratant']
  }
];

// RECETTES AVANCÉES AVEC POMMES DE TERRE
export const recettesAvancees = [
  {
    id: 'adv_pdt_noisette',
    nom: 'Pommes de terre noisette et légumes grillés',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Pomme de terre noisette, surgelée, crue', quantite: 150, unite: 'g' },
      { nom: 'Carotte, crue', quantite: 100, unite: 'g' },
      { nom: 'Courgette, pulpe et peau, crue', quantite: 100, unite: 'g' },
      { nom: 'Champignon, tout type, cru', quantite: 80, unite: 'g' }
    ],
    preparation: 'Faites cuire les pommes de terre au four. Grillez les légumes.',
    tags: ['végétarien', 'consistant', 'savoureux']
  },
  {
    id: 'adv_melange_surgeles',
    nom: 'Mélange de légumes surgelés',
    type: 'dejeuner',
    ingredients: [
      { nom: 'Brocoli, surgelé, cru', quantite: 100, unite: 'g' },
      { nom: 'Chou de Bruxelles, surgelé, cru', quantite: 100, unite: 'g' },
      { nom: 'Petits pois et carottes, surgelés, crus', quantite: 100, unite: 'g' },
      { nom: 'Maïs doux, surgelé, cru', quantite: 50, unite: 'g' }
    ],
    preparation: 'Faites cuire tous les légumes surgelés ensemble à la vapeur.',
    tags: ['végétarien', 'pratique', 'coloré']
  }
];

// COMBINER TOUTES LES RECETTES
export const toutesLesRecettes = [
  ...recettesPetitDejeuner,
  ...recettesDejeunerLegumes,
  ...recettesDinerLeger,
  ...recettesAvancees
];

// Ajouter les calculs nutritionnels à chaque recette au chargement
toutesLesRecettes.forEach(recette => {
  const nutrition = calculerNutritionRecette(recette.ingredients);
  recette.nutrition = nutrition;
});

export default {
  petitDejeuner: recettesPetitDejeuner,
  dejeunerLegumes: recettesDejeunerLegumes,
  dinerLeger: recettesDinerLeger,
  avancees: recettesAvancees,
  toutes: toutesLesRecettes
};
