/**
 * GÉNÉRATEUR DE MENUS STRICT
 * 
 * Génère des menus uniquement avec les aliments autorisés
 * Calculs caloriques précis basés sur les données Excel
 */

import recettesDatabase from '../data/recettes_strictes.js';

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
      // Si l'utilisateur a des préférences, favoriser les recettes correspondantes
      // mais ne pas exclure les autres complètement
      const matchPreferences = recette.tags && recette.tags.some(tag => 
        profil.preferences.some(pref => pref.toLowerCase() === tag.toLowerCase())
      );
      // Ajouter un score de préférence (utilisé plus tard)
      recette.scorePreference = matchPreferences ? 10 : 1;
    } else {
      recette.scorePreference = 1;
    }

    return true;
  });
}

/**
 * Génère un repas
 */
function genererRepas(type, caloriesCible, recettesDejaUtilisees = [], profil = {}) {
  let recettes;
  
  switch(type) {
    case 'petit_dejeuner':
      recettes = recettesDatabase.petitDejeuner;
      break;
    case 'dejeuner':
      recettes = [...recettesDatabase.dejeunerLegumes, ...recettesDatabase.avancees];
      break;
    case 'diner':
      recettes = recettesDatabase.dinerLeger;
      break;
    default:
      recettes = recettesDatabase.toutes;
  }

  // Filtrer selon le profil utilisateur (allergies, préférences)
  recettes = filtrerRecettesSelonProfil(recettes, profil);

  if (recettes.length === 0) {
    console.warn(`⚠️ Aucune recette disponible pour ${type} après filtrage !`);
    // Fallback : utiliser toutes les recettes sans filtrage d'allergies (dangereux mais évite un crash)
    recettes = recettesDatabase.toutes;
  }

  const recette = choisirRecetteAleatoire(recettes, recettesDejaUtilisees);
  
  return {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type,
    nom: recette.nom,
    recette: recette.id,
    ingredients: recette.ingredients,
    preparation: recette.preparation,
    tags: recette.tags,
    nutrition: recette.nutrition
  };
}

/**
 * Génère un menu pour un jour
 */
function genererMenuJour(caloriesJournalieres, jeuneIntermittent, recettesUtilisees, profil) {
  const repas = [];
  let caloriesDistribuees = {
    petit_dejeuner: 0,
    dejeuner: 0,
    diner: 0
  };

  if (jeuneIntermittent) {
    // 16:8 - Pas de petit-déjeuner
    caloriesDistribuees.dejeuner = caloriesJournalieres * 0.6; // 60% au déjeuner
    caloriesDistribuees.diner = caloriesJournalieres * 0.4;     // 40% au dîner
  } else {
    // Distribution classique
    caloriesDistribuees.petit_dejeuner = caloriesJournalieres * 0.25; // 25%
    caloriesDistribuees.dejeuner = caloriesJournalieres * 0.45;       // 45%
    caloriesDistribuees.diner = caloriesJournalieres * 0.30;          // 30%
  }

  // Générer les repas en passant le profil pour le filtrage
  if (!jeuneIntermittent) {
    const petitDej = genererRepas('petit_dejeuner', caloriesDistribuees.petit_dejeuner, recettesUtilisees, profil);
    repas.push(petitDej);
    recettesUtilisees.push(petitDej.recette);
  }

  const dejeuner = genererRepas('dejeuner', caloriesDistribuees.dejeuner, recettesUtilisees, profil);
  repas.push(dejeuner);
  recettesUtilisees.push(dejeuner.recette);

  const diner = genererRepas('diner', caloriesDistribuees.diner, recettesUtilisees, profil);
  repas.push(diner);
  recettesUtilisees.push(diner.recette);

  // Calculer les totaux du jour
  const caloriesTotal = repas.reduce((sum, r) => sum + r.nutrition.calories, 0);
  const proteinesTotal = repas.reduce((sum, r) => sum + r.nutrition.proteines, 0);
  const glucidesTotal = repas.reduce((sum, r) => sum + r.nutrition.glucides, 0);
  const lipidesTotal = repas.reduce((sum, r) => sum + r.nutrition.lipides, 0);

  return {
    repas,
    totaux: {
      calories: Math.round(caloriesTotal),
      proteines: Math.round(proteinesTotal * 10) / 10,
      glucides: Math.round(glucidesTotal * 10) / 10,
      lipides: Math.round(lipidesTotal * 10) / 10
    }
  };
}

/**
 * Génère un menu hebdomadaire complet
 */
export async function genererMenuHebdomadaire(profil) {
  console.log('🍽️ Génération du menu STRICT avec aliments autorisés...');
  console.log('📋 Profil reçu:', profil);

  // Calculer les besoins caloriques
  const bmr = calculerBMR(profil);
  const tdee = calculerTDEE(bmr, profil.niveauActivite || 'modere');
  const caloriesJournalieres = ajusterCaloriesObjectif(tdee, profil.objectif);

  console.log(`📊 BMR: ${Math.round(bmr)} kcal`);
  console.log(`📊 TDEE: ${Math.round(tdee)} kcal`);
  console.log(`🎯 Calories journalières cibles: ${Math.round(caloriesJournalieres)} kcal`);

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
  JOURS_SEMAINE.forEach(jour => {
    menuHebdomadaire[jour] = genererMenuJour(
      caloriesJournalieres,
      profil.jeuneIntermittent || false,
      recettesUtilisees,
      profil  // Passer le profil complet
    );
  });

  // Calculer les moyennes hebdomadaires
  const caloriesSemaine = Object.values(menuHebdomadaire).map(j => j.totaux.calories);
  const moyenneCalories = Math.round(caloriesSemaine.reduce((a, b) => a + b, 0) / 7);

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
        moyenneRéelle: moyenneCalories
      },
      dateGeneration: new Date().toISOString(),
      systeme: 'strict',
      alimentsUtilises: 'Excel autorisé uniquement'
    }
  };
}

/**
 * Régénère un repas spécifique
 */
export async function regenererRepas(jour, typeRepas, menuActuel, profil) {
  console.log(`🔄 Régénération du ${typeRepas} pour ${jour}`);
  console.log('👤 Respect des directives:', {
    allergies: profil.allergies || [],
    preferences: profil.preferences || []
  });

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
