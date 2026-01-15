/**
 * GÉNÉRATEUR DE MENUS À PARTIR DES FICHIERS EXCEL DU PRATICIEN
 * 
 * Ce générateur utilise EXCLUSIVEMENT les aliments uploadés par le praticien
 * dans les fichiers Excel (alimentsPetitDej, alimentsDejeuner, alimentsDiner)
 */

import { parseExcelFile } from './practitionerExcelParser.js';
import { getAllFiles } from './practitionerStorage.js';

// Jours de la semaine
const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Paramètres de distribution calorique
const DISTRIBUTION_NORMALE = {
  petitDejeuner: 0.27,  // 27%
  dejeuner: 0.43,       // 43%
  diner: 0.30           // 30%
};

const DISTRIBUTION_JEUNE = {
  petitDejeuner: 0,     // 0% (jeûne)
  dejeuner: 0.60,       // 60%
  diner: 0.40           // 40%
};

// Paramètres de validation
const TOLERANCE_CALORIES = 0.10; // ±10% de tolérance
const MAX_TENTATIVES_JOUR = 20;
const MAX_TENTATIVES_REPAS = 50;

/**
 * Calcule le BMR (Basal Metabolic Rate)
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
 * Calcule le TDEE (Total Daily Energy Expenditure)
 */
function calculerTDEE(bmr, activite) {
  const multiplicateurs = {
    sedentaire: 1.2,
    leger: 1.375,
    modere: 1.55,
    actif: 1.725,
    tres_actif: 1.9
  };
  
  return bmr * (multiplicateurs[activite] || 1.2);
}

/**
 * Calcule les besoins caloriques journaliers selon l'objectif
 */
function calculerCaloriesJournalieres(tdee, objectif) {
  switch (objectif) {
    case 'perte':
      return Math.round(tdee - 500);
    case 'prise':
      return Math.round(tdee + 300);
    case 'maintien':
    default:
      return Math.round(tdee);
  }
}

/**
 * Calcule les macros cibles selon l'objectif
 */
function calculerMacrosCibles(caloriesJournalieres, objectif) {
  let ratios;
  
  switch (objectif) {
    case 'perte':
      ratios = { proteines: 0.35, lipides: 0.30, glucides: 0.35 };
      break;
    case 'prise':
      ratios = { proteines: 0.25, lipides: 0.25, glucides: 0.50 };
      break;
    case 'maintien':
    default:
      ratios = { proteines: 0.25, lipides: 0.30, glucides: 0.45 };
  }
  
  return {
    proteines: Math.round((caloriesJournalieres * ratios.proteines) / 4),
    lipides: Math.round((caloriesJournalieres * ratios.lipides) / 9),
    glucides: Math.round((caloriesJournalieres * ratios.glucides) / 4)
  };
}

/**
 * Charge les aliments depuis les fichiers Excel uploadés
 */
async function chargerAlimentsExcel() {
  try {
    const files = getAllFiles();
    
    const alimentsPetitDej = files.alimentsPetitDej 
      ? await parseExcelFile(files.alimentsPetitDej.data)
      : [];
    
    const alimentsDejeuner = files.alimentsDejeuner
      ? await parseExcelFile(files.alimentsDejeuner.data)
      : [];
    
    const alimentsDiner = files.alimentsDiner
      ? await parseExcelFile(files.alimentsDiner.data)
      : [];
    
    console.log('📊 Aliments chargés depuis Excel:');
    console.log('  Petit-déjeuner:', alimentsPetitDej.length, 'aliments');
    console.log('  Déjeuner:', alimentsDejeuner.length, 'aliments');
    console.log('  Dîner:', alimentsDiner.length, 'aliments');
    
    return {
      petitDejeuner: alimentsPetitDej,
      dejeuner: alimentsDejeuner,
      diner: alimentsDiner
    };
    
  } catch (error) {
    console.error('❌ Erreur chargement fichiers Excel:', error);
    return {
      petitDejeuner: [],
      dejeuner: [],
      diner: []
    };
  }
}

/**
 * Sélectionne des aliments aléatoires pour atteindre un objectif calorique
 */
function selectionnerAliments(alimentsDisponibles, caloriesCible, alimentsUtilises = []) {
  const aliments = [];
  let caloriesAccumulees = 0;
  const tentatives = [];
  
  // Filtrer les aliments déjà utilisés aujourd'hui
  const alimentsNonUtilises = alimentsDisponibles.filter(
    a => !alimentsUtilises.includes(a.nom)
  );
  
  const alimentsPool = alimentsNonUtilises.length > 0 
    ? alimentsNonUtilises 
    : alimentsDisponibles;
  
  // Stratégie : sélectionner 3-5 aliments aléatoires
  const nbAliments = Math.min(3 + Math.floor(Math.random() * 3), alimentsPool.length);
  
  // Mélanger les aliments
  const alimentsMelanges = [...alimentsPool].sort(() => Math.random() - 0.5);
  
  // Sélectionner les premiers aliments
  const alimentsSelectionnes = alimentsMelanges.slice(0, nbAliments);
  
  // Calculer les portions pour atteindre l'objectif calorique
  const caloriesParAliment = caloriesCible / nbAliments;
  
  for (const aliment of alimentsSelectionnes) {
    if (aliment.energie > 0) {
      // Calculer la portion nécessaire (en grammes)
      const portionGrammes = Math.round((caloriesParAliment / aliment.energie) * 100);
      
      // Limiter les portions entre 30g et 500g
      const portionFinale = Math.max(30, Math.min(500, portionGrammes));
      
      // Calories réelles de cette portion
      const caloriesReelles = Math.round((aliment.energie * portionFinale) / 100);
      
      aliments.push({
        nom: aliment.nom,
        quantite: portionFinale,
        unite: 'g',
        calories: caloriesReelles,
        proteines: Math.round((aliment.proteines * portionFinale) / 100 * 10) / 10,
        glucides: Math.round((aliment.glucides * portionFinale) / 100 * 10) / 10,
        lipides: Math.round((aliment.lipides * portionFinale) / 100 * 10) / 10
      });
      
      caloriesAccumulees += caloriesReelles;
    }
  }
  
  return {
    aliments,
    caloriesTotal: caloriesAccumulees
  };
}

/**
 * Génère un repas (petit-déjeuner, déjeuner ou dîner)
 */
function genererRepas(type, caloriesCible, alimentsDisponibles, alimentsUtilisesAujourdhui) {
  let meilleurRepas = null;
  let meilleurEcart = Infinity;
  
  for (let tentative = 0; tentative < MAX_TENTATIVES_REPAS; tentative++) {
    const { aliments, caloriesTotal } = selectionnerAliments(
      alimentsDisponibles, 
      caloriesCible,
      alimentsUtilisesAujourdhui
    );
    
    const ecart = Math.abs(caloriesTotal - caloriesCible) / caloriesCible;
    
    if (ecart < meilleurEcart) {
      meilleurEcart = ecart;
      meilleurRepas = {
        type,
        nom: `${type.charAt(0).toUpperCase() + type.slice(1)} du jour`,
        ingredients: aliments,
        nutrition: {
          calories: caloriesTotal,
          proteines: aliments.reduce((sum, a) => sum + a.proteines, 0),
          glucides: aliments.reduce((sum, a) => sum + a.glucides, 0),
          lipides: aliments.reduce((sum, a) => sum + a.lipides, 0)
        }
      };
      
      // Si l'écart est acceptable, on arrête
      if (ecart <= TOLERANCE_CALORIES) {
        break;
      }
    }
  }
  
  return meilleurRepas;
}

/**
 * Génère un menu pour une journée
 */
function genererMenuJour(caloriesJournalieres, jeuneIntermittent, alimentsExcel) {
  const distribution = jeuneIntermittent ? DISTRIBUTION_JEUNE : DISTRIBUTION_NORMALE;
  const alimentsUtilisesAujourdhui = [];
  
  for (let tentative = 0; tentative < MAX_TENTATIVES_JOUR; tentative++) {
    const repas = {};
    
    // Petit-déjeuner (si pas de jeûne)
    if (!jeuneIntermittent && alimentsExcel.petitDejeuner.length > 0) {
      const caloriesPetitDej = Math.round(caloriesJournalieres * distribution.petitDejeuner);
      repas.petitDejeuner = genererRepas(
        'Petit-déjeuner',
        caloriesPetitDej,
        alimentsExcel.petitDejeuner,
        alimentsUtilisesAujourdhui
      );
      
      if (repas.petitDejeuner) {
        repas.petitDejeuner.ingredients.forEach(ing => {
          alimentsUtilisesAujourdhui.push(ing.nom);
        });
      }
    }
    
    // Déjeuner
    if (alimentsExcel.dejeuner.length > 0) {
      const caloriesDejeuner = Math.round(caloriesJournalieres * distribution.dejeuner);
      repas.dejeuner = genererRepas(
        'Déjeuner',
        caloriesDejeuner,
        alimentsExcel.dejeuner,
        alimentsUtilisesAujourdhui
      );
      
      if (repas.dejeuner) {
        repas.dejeuner.ingredients.forEach(ing => {
          alimentsUtilisesAujourdhui.push(ing.nom);
        });
      }
    }
    
    // Dîner
    if (alimentsExcel.diner.length > 0) {
      const caloriesDiner = Math.round(caloriesJournalieres * distribution.diner);
      repas.diner = genererRepas(
        'Dîner',
        caloriesDiner,
        alimentsExcel.diner,
        alimentsUtilisesAujourdhui
      );
    }
    
    // Calculer les totaux
    const totaux = {
      calories: 0,
      proteines: 0,
      glucides: 0,
      lipides: 0
    };
    
    Object.values(repas).forEach(r => {
      if (r && r.nutrition) {
        totaux.calories += r.nutrition.calories;
        totaux.proteines += r.nutrition.proteines;
        totaux.glucides += r.nutrition.glucides;
        totaux.lipides += r.nutrition.lipides;
      }
    });
    
    // Vérifier si le menu est valide
    const ecart = Math.abs(totaux.calories - caloriesJournalieres) / caloriesJournalieres;
    
    if (ecart <= TOLERANCE_CALORIES) {
      return {
        ...repas,
        totaux
      };
    }
  }
  
  // Si aucune tentative n'a réussi, retourner le dernier essai
  console.warn('⚠️ Menu généré avec écart supérieur à la tolérance');
  return null;
}

/**
 * Génère un menu hebdomadaire complet
 */
export async function genererMenuHebdomadaireExcel(profil) {
  console.log('🎯 Génération menu hebdomadaire depuis fichiers Excel');
  console.log('Profil:', profil);
  
  // Charger les aliments depuis les fichiers Excel
  const alimentsExcel = await chargerAlimentsExcel();
  
  // Vérifier que des fichiers ont été uploadés
  if (alimentsExcel.petitDejeuner.length === 0 && 
      alimentsExcel.dejeuner.length === 0 && 
      alimentsExcel.diner.length === 0) {
    throw new Error('Aucun fichier Excel uploadé. Le praticien doit d\'abord uploader les aliments autorisés.');
  }
  
  // Calculer les besoins nutritionnels
  const bmr = calculerBMR(profil);
  const tdee = calculerTDEE(bmr, profil.activite);
  const caloriesJournalieres = calculerCaloriesJournalieres(tdee, profil.objectif);
  const macrosCibles = calculerMacrosCibles(caloriesJournalieres, profil.objectif);
  
  console.log('📊 Besoins nutritionnels:');
  console.log('  BMR:', Math.round(bmr), 'kcal');
  console.log('  TDEE:', Math.round(tdee), 'kcal');
  console.log('  Objectif journalier:', caloriesJournalieres, 'kcal');
  console.log('  Macros cibles:', macrosCibles);
  
  // Générer les menus pour chaque jour
  const semaine = [];
  
  for (let i = 0; i < 7; i++) {
    const jourNom = JOURS_SEMAINE[i];
    console.log(`\n📅 Génération ${jourNom}...`);
    
    const menuJour = genererMenuJour(
      caloriesJournalieres,
      profil.jeuneIntermittent,
      alimentsExcel
    );
    
    if (!menuJour) {
      throw new Error(`Impossible de générer un menu valide pour ${jourNom}. Vérifiez les fichiers Excel uploadés.`);
    }
    
    // Calculer la date
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    semaine.push({
      jour: jourNom,
      date: date.toLocaleDateString('fr-FR'),
      jeune: profil.jeuneIntermittent,
      menu: menuJour,
      totaux: menuJour.totaux
    });
    
    console.log(`✅ ${jourNom} généré: ${menuJour.totaux.calories} kcal`);
  }
  
  // Calculer les statistiques hebdomadaires
  const totalSemaine = semaine.reduce((acc, jour) => ({
    calories: acc.calories + jour.totaux.calories,
    proteines: acc.proteines + jour.totaux.proteines,
    glucides: acc.glucides + jour.totaux.glucides,
    lipides: acc.lipides + jour.totaux.lipides
  }), { calories: 0, proteines: 0, glucides: 0, lipides: 0 });
  
  const moyenneSemaine = {
    calories: Math.round(totalSemaine.calories / 7),
    proteines: Math.round(totalSemaine.proteines / 7),
    glucides: Math.round(totalSemaine.glucides / 7),
    lipides: Math.round(totalSemaine.lipides / 7)
  };
  
  console.log('\n✅ Menu hebdomadaire généré avec succès!');
  console.log('📊 Moyenne journalière:', moyenneSemaine);
  
  return {
    semaine,
    metadata: {
      profil,
      besoins: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        caloriesJournalieres,
        macrosCibles
      },
      totaux: totalSemaine,
      moyennes: moyenneSemaine,
      dateGeneration: new Date().toISOString(),
      source: 'Fichiers Excel uploadés par le praticien'
    }
  };
}

/**
 * Régénère un repas spécifique
 */
export async function regenererRepasExcel(jourIndex, typeRepas, profil) {
  const alimentsExcel = await chargerAlimentsExcel();
  const caloriesJournalieres = calculerCaloriesJournalieres(
    calculerTDEE(calculerBMR(profil), profil.activite),
    profil.objectif
  );
  
  const distribution = profil.jeuneIntermittent ? DISTRIBUTION_JEUNE : DISTRIBUTION_NORMALE;
  let caloriesCible;
  let alimentsDisponibles;
  
  switch (typeRepas) {
    case 'petitDejeuner':
      caloriesCible = Math.round(caloriesJournalieres * distribution.petitDejeuner);
      alimentsDisponibles = alimentsExcel.petitDejeuner;
      break;
    case 'dejeuner':
      caloriesCible = Math.round(caloriesJournalieres * distribution.dejeuner);
      alimentsDisponibles = alimentsExcel.dejeuner;
      break;
    case 'diner':
      caloriesCible = Math.round(caloriesJournalieres * distribution.diner);
      alimentsDisponibles = alimentsExcel.diner;
      break;
    default:
      throw new Error('Type de repas invalide');
  }
  
  return genererRepas(typeRepas, caloriesCible, alimentsDisponibles, []);
}
