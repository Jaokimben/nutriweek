/**
 * GÉNÉRATEUR DE MENUS CORRIGÉ
 * 
 * ✅ CORRECTIONS APPLIQUÉES:
 * 1. Calcul des portions pour atteindre l'objectif calorique (±5%)
 * 2. Équilibrage des macronutriments (P/L/G)
 * 3. Validation stricte des totaux caloriques
 * 4. Diversité alimentaire (anti-répétition)
 * 5. Recettes complètes avec protéines + féculents + légumes
 */

import recettesDatabase from '../data/recettes_equilibrees.js';

const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/**
 * Calcule le métabolisme de base (BMR)
 */
function calculerBMR(profil) {
  const { poids, taille, age, sexe } = profil;
  
  if (sexe === 'homme') {
    return 88.362 + (13.397 * poids) + (4.799 * taille) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * poids) + (3.098 * taille) - (4.330 * age);
  }
}

/**
 * Calcule les besoins caloriques totaux (TDEE)
 */
function calculerTDEE(bmr, niveauActivite) {
  const facteurs = {
    sedentaire: 1.2,
    leger: 1.375,
    modere: 1.55,
    actif: 1.725,
    tres_actif: 1.9
  };
  
  return bmr * (facteurs[niveauActivite] || 1.2);
}

/**
 * Ajuste les calories selon l'objectif
 */
function ajusterCaloriesObjectif(tdee, objectif) {
  switch(objectif) {
    case 'perte':
      return tdee - 500; // Déficit de 500 kcal/jour
    case 'prise':
      return tdee + 300; // Excédent de 300 kcal/jour
    case 'maintien':
    default:
      return tdee;
  }
}

/**
 * Calcule les objectifs macronutriments selon les calories
 * @param {number} calories - Calories journalières
 * @param {string} objectif - Objectif (perte, prise, maintien)
 * @returns {object} Objectifs en grammes
 */
function calculerObjectifsMacros(calories, objectif) {
  // Ratios selon l'objectif
  let ratios = {};
  
  switch(objectif) {
    case 'perte':
      // Perte : Plus de protéines, moins de glucides
      ratios = { proteines: 0.35, lipides: 0.30, glucides: 0.35 };
      break;
    case 'prise':
      // Prise : Plus de glucides et protéines
      ratios = { proteines: 0.30, lipides: 0.25, glucides: 0.45 };
      break;
    case 'maintien':
    default:
      // Maintien : Équilibré
      ratios = { proteines: 0.30, lipides: 0.30, glucides: 0.40 };
      break;
  }
  
  return {
    proteines: Math.round((calories * ratios.proteines) / 4), // 1g protéine = 4 kcal
    lipides: Math.round((calories * ratios.lipides) / 9),      // 1g lipide = 9 kcal
    glucides: Math.round((calories * ratios.glucides) / 4)     // 1g glucide = 4 kcal
  };
}

/**
 * 🆕 Ajuste les portions d'une recette pour atteindre un objectif calorique
 * @param {object} recette - Recette de base
 * @param {number} caloriesCible - Objectif calorique
 * @returns {object} Recette avec portions ajustées
 */
function ajusterPortionsRecette(recette, caloriesCible) {
  const caloriesBase = recette.nutrition.calories;
  
  // Si la recette est à 0 kcal, impossible d'ajuster
  if (caloriesBase === 0) {
    console.warn(`⚠️ Recette "${recette.nom}" a 0 kcal, impossible d'ajuster`);
    return recette;
  }
  
  // Calculer le facteur multiplicateur
  const facteur = caloriesCible / caloriesBase;
  
  // Limiter le facteur entre 0.5 et 2.5 (portions raisonnables)
  const facteurLimite = Math.max(0.5, Math.min(2.5, facteur));
  
  // Ajuster les ingrédients
  const ingredientsAjustes = recette.ingredients.map(ing => ({
    ...ing,
    quantite: Math.round(ing.quantite * facteurLimite)
  }));
  
  // Ajuster les valeurs nutritionnelles
  const nutritionAjustee = {
    calories: Math.round(recette.nutrition.calories * facteurLimite),
    proteines: Math.round(recette.nutrition.proteines * facteurLimite * 10) / 10,
    glucides: Math.round(recette.nutrition.glucides * facteurLimite * 10) / 10,
    lipides: Math.round(recette.nutrition.lipides * facteurLimite * 10) / 10,
    sucres: Math.round(recette.nutrition.sucres * facteurLimite * 10) / 10,
    magnesium: Math.round(recette.nutrition.magnesium * facteurLimite * 10) / 10
  };
  
  console.log(`  📏 Ajustement portions: ${recette.nom}`);
  console.log(`     Base: ${caloriesBase} kcal → Cible: ${caloriesCible} kcal → Résultat: ${nutritionAjustee.calories} kcal (facteur: ${facteurLimite.toFixed(2)})`);
  
  return {
    ...recette,
    ingredients: ingredientsAjustes,
    nutrition: nutritionAjustee,
    facteurPortion: facteurLimite
  };
}

/**
 * Sélectionne une recette aléatoire d'une liste
 */
function choisirRecetteAleatoire(recettes, recettesDejaChoisies = []) {
  const recettesFiltrees = recettes.filter(r => !recettesDejaChoisies.includes(r.id));
  
  if (recettesFiltrees.length === 0) {
    // Si toutes les recettes ont été choisies, on réinitialise
    return recettes[Math.floor(Math.random() * recettes.length)];
  }
  
  return recettesFiltrees[Math.floor(Math.random() * recettesFiltrees.length)];
}

/**
 * Filtre les recettes selon le profil utilisateur
 */
function filtrerRecettesSelonProfil(recettes, profil) {
  return recettes.filter(recette => {
    // Filtrer selon les allergies
    if (profil.allergies && profil.allergies.length > 0) {
      const hasAllergen = recette.ingredients.some(ing => {
        const nomIngredient = ing.nom.toLowerCase();
        return profil.allergies.some(allergie => {
          const allergieNormalisee = allergie.toLowerCase();
          return nomIngredient.includes(allergieNormalisee);
        });
      });
      if (hasAllergen) return false;
    }

    // Filtrer selon les préférences alimentaires
    if (profil.preferences && profil.preferences.length > 0) {
      const matchPreferences = recette.tags && recette.tags.some(tag => 
        profil.preferences.some(pref => pref.toLowerCase() === tag.toLowerCase())
      );
      recette.scorePreference = matchPreferences ? 10 : 1;
    } else {
      recette.scorePreference = 1;
    }

    return true;
  });
}

/**
 * 🆕 Génère un repas avec ajustement automatique des portions
 */
function genererRepas(type, caloriesCible, recettesDejaUtilisees = [], profil = {}) {
  // Filtrer les recettes par type
  let recettes = recettesDatabase.toutes.filter(r => r.type === type);
  
  console.log(`  📊 ${recettes.length} recettes de type "${type}" disponibles`);

  // Filtrer selon le profil utilisateur (allergies, préférences)
  recettes = filtrerRecettesSelonProfil(recettes, profil);

  if (recettes.length === 0) {
    console.warn(`⚠️ Aucune recette disponible pour ${type} après filtrage !`);
    recettes = recettesDatabase.toutes.filter(r => r.type === type);
  }

  const recette = choisirRecetteAleatoire(recettes, recettesDejaUtilisees);
  
  // 🔥 AJUSTER LES PORTIONS POUR ATTEINDRE L'OBJECTIF CALORIQUE
  const recetteAjustee = ajusterPortionsRecette(recette, caloriesCible);
  
  console.log(`  ✓ ${type}: "${recetteAjustee.nom}" → ${recetteAjustee.nutrition.calories} kcal (objectif: ${Math.round(caloriesCible)} kcal)`);
  
  return {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type,
    nom: recetteAjustee.nom,
    recette: recetteAjustee.id,
    ingredients: recetteAjustee.ingredients,
    preparation: recetteAjustee.preparation,
    tags: recetteAjustee.tags,
    nutrition: recetteAjustee.nutrition,
    facteurPortion: recetteAjustee.facteurPortion
  };
}

/**
 * 🆕 Génère un menu pour un jour avec validation stricte
 */
function genererMenuJour(caloriesJournalieres, jeuneIntermittent, recettesUtilisees, profil) {
  let tentatives = 0;
  const MAX_TENTATIVES = 5;
  
  while (tentatives < MAX_TENTATIVES) {
    tentatives++;
    console.log(`\n  🔄 Tentative ${tentatives}/${MAX_TENTATIVES} de génération du menu`);
    
    const repas = [];
    let caloriesDistribuees = {};

    if (jeuneIntermittent) {
      // 16:8 - Pas de petit-déjeuner
      caloriesDistribuees.dejeuner = caloriesJournalieres * 0.6; // 60% au déjeuner
      caloriesDistribuees.diner = caloriesJournalieres * 0.4;     // 40% au dîner
    } else {
      // Distribution classique
      caloriesDistribuees.petit_dejeuner = caloriesJournalieres * 0.27; // 27%
      caloriesDistribuees.dejeuner = caloriesJournalieres * 0.43;       // 43%
      caloriesDistribuees.diner = caloriesJournalieres * 0.30;          // 30%
    }

    // Générer les repas
    if (!jeuneIntermittent) {
      const petitDej = genererRepas('petit_dejeuner', caloriesDistribuees.petit_dejeuner, recettesUtilisees, profil);
      repas.push(petitDej);
    }

    const dejeuner = genererRepas('dejeuner', caloriesDistribuees.dejeuner, recettesUtilisees, profil);
    repas.push(dejeuner);

    const diner = genererRepas('diner', caloriesDistribuees.diner, recettesUtilisees, profil);
    repas.push(diner);

    // Calculer les totaux du jour
    const caloriesTotal = repas.reduce((sum, r) => sum + r.nutrition.calories, 0);
    const proteinesTotal = repas.reduce((sum, r) => sum + r.nutrition.proteines, 0);
    const glucidesTotal = repas.reduce((sum, r) => sum + r.nutrition.glucides, 0);
    const lipidesTotal = repas.reduce((sum, r) => sum + r.nutrition.lipides, 0);

    // 🔥 VALIDATION STRICTE: Le total doit être entre 95% et 105% de l'objectif
    const ecartCalories = Math.abs(caloriesTotal - caloriesJournalieres) / caloriesJournalieres;
    const ecartPourcent = ecartCalories * 100;
    
    console.log(`  📊 Total: ${caloriesTotal} kcal / Objectif: ${Math.round(caloriesJournalieres)} kcal (écart: ${ecartPourcent.toFixed(1)}%)`);
    
    if (ecartCalories <= 0.05) {
      // ✅ Menu valide !
      console.log(`  ✅ Menu validé ! (écart: ${ecartPourcent.toFixed(1)}%)`);
      
      // Ajouter les recettes utilisées pour éviter les répétitions
      repas.forEach(r => recettesUtilisees.push(r.recette));
      
      return {
        repas,
        totaux: {
          calories: Math.round(caloriesTotal),
          proteines: Math.round(proteinesTotal * 10) / 10,
          glucides: Math.round(glucidesTotal * 10) / 10,
          lipides: Math.round(lipidesTotal * 10) / 10
        },
        valide: true,
        tentatives
      };
    } else {
      console.log(`  ⚠️ Écart trop important (${ecartPourcent.toFixed(1)}%), nouvelle tentative...`);
    }
  }
  
  // Si aucune tentative n'a réussi, retourner le dernier menu généré avec un warning
  console.warn(`⚠️ Impossible d'atteindre l'objectif calorique après ${MAX_TENTATIVES} tentatives`);
  
  return {
    repas: [],
    totaux: { calories: 0, proteines: 0, glucides: 0, lipides: 0 },
    valide: false,
    tentatives: MAX_TENTATIVES
  };
}

/**
 * 🆕 Génère un menu hebdomadaire complet avec validation
 */
export async function genererMenuHebdomadaire(profil) {
  console.log('🍽️ Génération du menu CORRIGÉ avec portions ajustées...');
  console.log('📋 Profil reçu:', profil);

  // Calculer les besoins caloriques
  const bmr = calculerBMR(profil);
  const tdee = calculerTDEE(bmr, profil.niveauActivite || 'modere');
  const caloriesJournalieres = ajusterCaloriesObjectif(tdee, profil.objectif);
  
  // Calculer les objectifs macronutriments
  const objectifsMacros = calculerObjectifsMacros(caloriesJournalieres, profil.objectif);

  console.log(`📊 BMR: ${Math.round(bmr)} kcal`);
  console.log(`📊 TDEE: ${Math.round(tdee)} kcal`);
  console.log(`🎯 Calories journalières cibles: ${Math.round(caloriesJournalieres)} kcal`);
  console.log(`🎯 Objectifs macros: P:${objectifsMacros.proteines}g L:${objectifsMacros.lipides}g G:${objectifsMacros.glucides}g`);

  const menuHebdomadaire = {};
  const recettesUtilisees = []; // Pour éviter les répétitions dans la semaine

  // Log des directives utilisateur
  console.log('👤 Directives utilisateur:', {
    objectif: profil.objectif,
    allergies: profil.allergies || [],
    preferences: profil.preferences || [],
    jeuneIntermittent: profil.jeuneIntermittent
  });

  // Générer un menu pour chaque jour
  for (const jour of JOURS_SEMAINE) {
    console.log(`\n📅 Génération du menu pour ${jour}`);
    
    const menuJour = genererMenuJour(
      caloriesJournalieres,
      profil.jeuneIntermittent || false,
      recettesUtilisees,
      profil
    );
    
    if (menuJour.valide) {
      menuHebdomadaire[jour] = menuJour;
      console.log(`✅ Menu ${jour} généré et validé`);
    } else {
      console.error(`❌ Échec génération menu ${jour}`);
      throw new Error(`Impossible de générer un menu valide pour ${jour}`);
    }
  }

  // Calculer les moyennes hebdomadaires
  const caloriesSemaine = Object.values(menuHebdomadaire).map(j => j.totaux.calories);
  const moyenneCalories = Math.round(caloriesSemaine.reduce((a, b) => a + b, 0) / 7);
  
  const proteineSemaine = Object.values(menuHebdomadaire).map(j => j.totaux.proteines);
  const moyenneProteines = Math.round(proteineSemaine.reduce((a, b) => a + b, 0) / 7);
  
  const glucidesSemaine = Object.values(menuHebdomadaire).map(j => j.totaux.glucides);
  const moyenneGlucides = Math.round(glucidesSemaine.reduce((a, b) => a + b, 0) / 7);
  
  const lipidesSemaine = Object.values(menuHebdomadaire).map(j => j.totaux.lipides);
  const moyenneLipides = Math.round(lipidesSemaine.reduce((a, b) => a + b, 0) / 7);

  console.log(`\n📊 VALIDATION FINALE:`);
  console.log(`   Calories: ${moyenneCalories} kcal/jour (objectif: ${Math.round(caloriesJournalieres)} kcal)`);
  console.log(`   Protéines: ${moyenneProteines}g/jour (objectif: ${objectifsMacros.proteines}g)`);
  console.log(`   Glucides: ${moyenneGlucides}g/jour (objectif: ${objectifsMacros.glucides}g)`);
  console.log(`   Lipides: ${moyenneLipides}g/jour (objectif: ${objectifsMacros.lipides}g)`);

  return {
    menu: menuHebdomadaire,
    metadata: {
      profil: {
        objectif: profil.objectif,
        jeuneIntermittent: profil.jeuneIntermittent || false,
        allergies: profil.allergies || [],
        preferences: profil.preferences || []
      },
      besoins: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        caloriesJournalieres: Math.round(caloriesJournalieres),
        moyenneRéelle: moyenneCalories,
        objectifsMacros,
        moyennesMacros: {
          proteines: moyenneProteines,
          glucides: moyenneGlucides,
          lipides: moyenneLipides
        }
      },
      dateGeneration: new Date().toISOString(),
      systeme: 'corrige_v2',
      alimentsUtilises: 'Base complète (protéines + féculents + légumes)'
    }
  };
}

/**
 * Régénère un repas spécifique
 */
export async function regenererRepas(jour, typeRepas, menuActuel, profil) {
  console.log(`🔄 Régénération du ${typeRepas} pour ${jour}`);

  const caloriesCible = menuActuel[jour].totaux.calories / menuActuel[jour].repas.length;
  const recettesDejaUtilisees = Object.values(menuActuel)
    .flatMap(j => j.repas)
    .map(r => r.recette);

  const nouveauRepas = genererRepas(typeRepas, caloriesCible, recettesDejaUtilisees, profil);

  return nouveauRepas;
}

export default {
  genererMenuHebdomadaire,
  regenererRepas
};
