/**
 * CALCULATEUR DE NUTRITION STRICTE
 * 
 * Utilise UNIQUEMENT les aliments du fichier JSON autorisé
 * Calculs précis basés sur les données Excel fournies
 * 
 * MISE À JOUR: Utilise maintenant la base alimentaire complète avec protéines, féculents, etc.
 */

import alimentsAutorisesBase from '../data/aliments_autorises.json' with { type: 'json' };
import alimentsComplets from '../data/aliments_complets.json' with { type: 'json' };

// Fusionner les deux bases de données (priorité aux aliments complets)
const alimentsAutorises = [...alimentsComplets, ...alimentsAutorisesBase];

// Créer un index pour une recherche rapide (insensible à la casse et aux accents)
const normalizeString = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .trim();
};

const alimentsIndex = {};
alimentsAutorises.forEach(aliment => {
  const key = normalizeString(aliment.nom);
  alimentsIndex[key] = aliment;
});

/**
 * Recherche un aliment dans la base de données autorisée
 * @param {string} nomAliment - Nom de l'aliment à rechercher
 * @returns {object|null} L'aliment trouvé ou null
 */
export function chercherAliment(nomAliment) {
  const key = normalizeString(nomAliment);
  const aliment = alimentsIndex[key];
  
  if (!aliment) {
    console.warn(`⚠️ Aliment non trouvé dans la base autorisée: "${nomAliment}"`);
    return null;
  }
  
  return aliment;
}

/**
 * Convertit les quantités en grammes
 * @param {number} quantite - Quantité de l'ingrédient
 * @param {string} unite - Unité de mesure
 * @returns {number} Quantité en grammes
 */
function convertirEnGrammes(quantite, unite) {
  const conversions = {
    'g': 1,
    'kg': 1000,
    'mg': 0.001,
    'ml': 1, // Approximation : 1ml = 1g pour les liquides
    'l': 1000,
    'cl': 10,
    'cuillère à soupe': 15,
    'cuillère à café': 5,
    'c.s.': 15,
    'c.c.': 5,
    'tasse': 240,
    'verre': 200,
  };

  const uniteNormalisee = unite.toLowerCase().trim();
  const facteur = conversions[uniteNormalisee] || 1;
  
  return quantite * facteur;
}

/**
 * Calcule la nutrition pour un ingrédient
 * @param {object} ingredient - { nom, quantite, unite }
 * @returns {object} Valeurs nutritionnelles
 */
export function calculerNutritionIngredient(ingredient) {
  const aliment = chercherAliment(ingredient.nom);
  
  if (!aliment) {
    return {
      calories: 0,
      proteines: 0,
      glucides: 0,
      lipides: 0,
      sucres: 0,
      magnesium: 0,
      valide: false,
      nom: ingredient.nom
    };
  }

  const quantiteEnGrammes = convertirEnGrammes(ingredient.quantite, ingredient.unite);
  const facteur = quantiteEnGrammes / 100; // Les valeurs sont pour 100g

  return {
    calories: (aliment.energie * facteur) || 0,
    proteines: (aliment.proteines * facteur) || 0,
    glucides: (aliment.glucides * facteur) || 0,
    lipides: (aliment.lipides * facteur) || 0,
    sucres: (aliment.sucres * facteur) || 0,
    magnesium: (aliment.magnesium * facteur) || 0,
    valide: true,
    nom: ingredient.nom,
    quantite: quantiteEnGrammes
  };
}

/**
 * Calcule la nutrition totale pour une recette
 * @param {array} ingredients - Liste d'ingrédients { nom, quantite, unite }
 * @returns {object} Valeurs nutritionnelles totales
 */
export function calculerNutritionRecette(ingredients) {
  const total = {
    calories: 0,
    proteines: 0,
    glucides: 0,
    lipides: 0,
    sucres: 0,
    magnesium: 0,
    ingredientsValides: 0,
    ingredientsTotal: ingredients.length
  };

  const details = [];

  ingredients.forEach(ingredient => {
    const nutrition = calculerNutritionIngredient(ingredient);
    
    total.calories += nutrition.calories;
    total.proteines += nutrition.proteines;
    total.glucides += nutrition.glucides;
    total.lipides += nutrition.lipides;
    total.sucres += nutrition.sucres;
    total.magnesium += nutrition.magnesium;
    
    if (nutrition.valide) {
      total.ingredientsValides++;
    }
    
    details.push({
      nom: ingredient.nom,
      quantite: ingredient.quantite,
      unite: ingredient.unite,
      ...nutrition
    });
  });

  // Arrondir les valeurs
  total.calories = Math.round(total.calories);
  total.proteines = Math.round(total.proteines * 10) / 10;
  total.glucides = Math.round(total.glucides * 10) / 10;
  total.lipides = Math.round(total.lipides * 10) / 10;
  total.sucres = Math.round(total.sucres * 10) / 10;
  total.magnesium = Math.round(total.magnesium * 10) / 10;

  return {
    ...total,
    details,
    valide: total.ingredientsValides === total.ingredientsTotal
  };
}

/**
 * Valide qu'une recette utilise uniquement des aliments autorisés
 * @param {array} ingredients - Liste d'ingrédients
 * @returns {object} Résultat de la validation
 */
export function validerRecette(ingredients) {
  const errors = [];
  const warnings = [];

  ingredients.forEach(ingredient => {
    const aliment = chercherAliment(ingredient.nom);
    
    if (!aliment) {
      errors.push(`Aliment non autorisé: "${ingredient.nom}"`);
    } else if (aliment.energie === 0) {
      warnings.push(`Aliment avec 0 kcal: "${ingredient.nom}" - vérifier les données`);
    }
  });

  return {
    valide: errors.length === 0,
    errors,
    warnings,
    total: ingredients.length,
    valides: ingredients.length - errors.length
  };
}

/**
 * Liste tous les aliments autorisés
 * @returns {array} Liste des aliments
 */
export function listerAlimentsAutorises() {
  return alimentsAutorises.map(a => ({
    nom: a.nom,
    energie: a.energie,
    proteines: a.proteines,
    glucides: a.glucides,
    lipides: a.lipides
  })).sort((a, b) => a.nom.localeCompare(b.nom));
}

/**
 * Recherche des aliments par catégorie
 * @param {string} motCle - Mot-clé pour filtrer
 * @returns {array} Aliments correspondants
 */
export function rechercherAlimentsParMotCle(motCle) {
  const motCleNormalise = normalizeString(motCle);
  
  return alimentsAutorises.filter(aliment => {
    const nomNormalise = normalizeString(aliment.nom);
    return nomNormalise.includes(motCleNormalise);
  });
}

export default {
  chercherAliment,
  calculerNutritionIngredient,
  calculerNutritionRecette,
  validerRecette,
  listerAlimentsAutorises,
  rechercherAlimentsParMotCle
};
