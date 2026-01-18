/**
 * GÉNÉRATEUR DE MENUS À PARTIR DES FICHIERS EXCEL DU PRATICIEN
 * 
 * Ce générateur utilise EXCLUSIVEMENT les aliments uploadés par le praticien
 * dans les fichiers Excel (alimentsPetitDej, alimentsDejeuner, alimentsDiner)
 * 
 * + RESPECTE STRICTEMENT les règles des documents Word uploadés
 */

import { parseExcelFile } from './practitionerExcelParser.js';
import { getAllFiles } from './practitionerStorage.js';
import { 
  chargerReglesPraticien, 
  verifierAlimentAutorise,
  appliquerReglesAuMenu 
} from './practitionerRulesParser.js';
import { calculerBMR, calculerTDEE } from './bmrCalculator.js';
import { diagnostiquerFichiersExcel, formaterMessageErreur } from './excelDiagnostic.js';
import { 
  chercherRecetteCoherente, 
  construireRepasDepuisRecette,
  validerIngredientsRepas,
  verifierCoherenceCombinaison
} from './recipeSearchEngine.js';
import { chargerEtAppliquerReglesCaloriques } from './calorieRulesExtractor.js';

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
 * ⚠️ MODE STRICT : Refuse si fichiers manquants ou vides
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
    
    // Vérification stricte : au moins 3 aliments par fichier minimum
    const erreurs = [];
    if (alimentsPetitDej.length < 3) {
      erreurs.push(`Petit-déjeuner: ${alimentsPetitDej.length} aliments (minimum 3 requis)`);
    }
    if (alimentsDejeuner.length < 3) {
      erreurs.push(`Déjeuner: ${alimentsDejeuner.length} aliments (minimum 3 requis)`);
    }
    if (alimentsDiner.length < 3) {
      erreurs.push(`Dîner: ${alimentsDiner.length} aliments (minimum 3 requis)`);
    }
    
    if (erreurs.length > 0) {
      throw new Error(
        '❌ FICHIERS EXCEL INSUFFISANTS\n\n' +
        'Chaque fichier Excel doit contenir au moins 3 aliments pour générer des menus variés.\n\n' +
        'Problèmes détectés:\n' +
        erreurs.map(e => `  - ${e}`).join('\n') +
        '\n\nVeuillez demander au praticien de compléter les fichiers Excel.'
      );
    }
    
    console.log('✅ Validation OK - Tous les fichiers contiennent suffisamment d\'aliments');
    console.log('⚠️ MODE STRICT : AUCUN aliment externe ne sera ajouté');
    
    return {
      petitDejeuner: alimentsPetitDej,
      dejeuner: alimentsDejeuner,
      diner: alimentsDiner
    };
    
  } catch (error) {
    console.error('❌ Erreur chargement fichiers Excel:', error);
    throw error; // Re-throw pour arrêter la génération
  }
}

/**
 * Sélectionne des aliments aléatoires pour atteindre un objectif calorique
 * + Filtre selon les règles praticien
 */
function selectionnerAliments(alimentsDisponibles, caloriesCible, alimentsUtilises = [], regles = []) {
  const aliments = [];
  let caloriesAccumulees = 0;
  const tentatives = [];
  
  // Filtrer les aliments déjà utilisés aujourd'hui
  let alimentsNonUtilises = alimentsDisponibles.filter(
    a => !alimentsUtilises.includes(a.nom)
  );
  
  // Filtrer selon les règles praticien (aliments interdits)
  if (regles.length > 0) {
    alimentsNonUtilises = alimentsNonUtilises.filter(aliment => 
      verifierAlimentAutorise(aliment, regles)
    );
    console.log(`  🔍 Après filtrage règles: ${alimentsNonUtilises.length} aliments autorisés`);
  }
  
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
 * + Applique les règles praticien
 * 🆕 MODE RECETTES COHÉRENTES : Cherche d'abord des recettes réelles
 */
async function genererRepas(type, caloriesCible, alimentsDisponibles, alimentsUtilisesAujourdhui, regles = []) {
  console.log(`\n🍽️ GÉNÉRATION REPAS: ${type} (objectif: ${caloriesCible} kcal)`);
  console.log(`  📋 ${alimentsDisponibles.length} aliments disponibles`);
  
  // Filtrer les aliments selon les règles praticien
  let alimentsAutorises = alimentsDisponibles;
  if (regles.length > 0) {
    alimentsAutorises = alimentsDisponibles.filter(aliment => 
      verifierAlimentAutorise(aliment, regles)
    );
    console.log(`  🔍 Après règles praticien: ${alimentsAutorises.length} aliments autorisés`);
  }
  
  // Filtrer les aliments déjà utilisés
  alimentsAutorises = alimentsAutorises.filter(
    a => !alimentsUtilisesAujourdhui.includes(a.nom)
  );
  console.log(`  ✅ Aliments finaux disponibles: ${alimentsAutorises.length}`);
  
  if (alimentsAutorises.length === 0) {
    console.warn(`  ⚠️ Aucun aliment disponible pour ${type}`);
    alimentsAutorises = alimentsDisponibles; // Fallback
  }
  
  // 🆕 ÉTAPE 1: Chercher une recette cohérente
  try {
    console.log(`\n🔍 ====== RECHERCHE RECETTE COHÉRENTE ======`);
    console.log(`  📝 Aliments autorisés disponibles:`, alimentsAutorises.map(a => a.nom).slice(0, 15));
    const recette = chercherRecetteCoherente(alimentsAutorises, type, caloriesCible);
    
    if (recette) {
      console.log(`✨ Recette trouvée: ${recette.nom} (score: ${recette.score})`);
      
      // Construire le repas depuis la recette
      const repasRecette = construireRepasDepuisRecette(recette, alimentsAutorises, caloriesCible);
      
      if (repasRecette) {
        // Valider que TOUS les ingrédients sont autorisés
        const valide = validerIngredientsRepas(repasRecette, alimentsAutorises);
        
        if (valide) {
          console.log(`✅ SUCCÈS: Repas cohérent "${repasRecette.nom}" généré depuis recette`);
          console.log(`  📊 Nutrition: ${repasRecette.nutrition.calories} kcal`);
          console.log(`  🍽️ Ingrédients: ${repasRecette.ingredients.map(i => i.nom).join(', ')}`);
          
          return {
            type,
            nom: repasRecette.nom,
            ingredients: repasRecette.ingredients,
            nutrition: repasRecette.nutrition,
            source: 'recette_coherente',
            score: repasRecette.score
          };
        } else {
          console.warn(`⚠️ Recette rejetée: contient des ingrédients non autorisés`);
        }
      }
    } else {
      console.log(`⚠️ Aucune recette cohérente trouvée, utilisation sélection aléatoire`);
    }
  } catch (error) {
    console.error(`❌ Erreur recherche recettes: ${error.message}`);
    console.warn(`⚠️ Fallback vers génération aléatoire`);
  }
  
  // 🔄 FALLBACK: Génération aléatoire (comme avant)
  console.log(`\n🎲 ====== GÉNÉRATION ALÉATOIRE ======`);
  
  let meilleurRepas = null;
  let meilleurEcart = Infinity;
  let tentativesCoherentes = 0;
  let tentativesIncoherentes = 0;
  
  for (let tentative = 0; tentative < MAX_TENTATIVES_REPAS; tentative++) {
    const { aliments, caloriesTotal } = selectionnerAliments(
      alimentsAutorises, 
      caloriesCible,
      [],  // Pas de filtre ici car déjà filtré
      []   // Pas de règles ici car déjà filtré
    );
    
    // 🆕 VALIDATION COHÉRENCE : Vérifier que la combinaison d'aliments est cohérente
    const nomsAliments = aliments.map(a => a.nom);
    console.log(`\n  🔍 VALIDATION tentative ${tentative + 1}/${MAX_TENTATIVES_REPAS}:`);
    console.log(`     Aliments sélectionnés: ${nomsAliments.join(', ')}`);
    
    const validationCoherence = verifierCoherenceCombinaison(nomsAliments);
    console.log(`     Résultat cohérence:`, validationCoherence);
    
    if (!validationCoherence.coherent) {
      tentativesIncoherentes++;
      console.log(`  ❌ REJET tentative ${tentative + 1}: Combinaison incohérente`);
      validationCoherence.raisons.forEach(r => console.log(`     ${r}`));
      continue; // Rejeter cette combinaison et essayer une autre
    }
    
    tentativesCoherentes++;
    console.log(`  ✅ ACCEPTÉ tentative ${tentative + 1}: Combinaison cohérente`);
    
    const ecart = Math.abs(caloriesTotal - caloriesCible) / caloriesCible;
    
    if (ecart < meilleurEcart) {
      meilleurEcart = ecart;
      
      // Calculer la nutrition
      const proteines = Math.round(aliments.reduce((sum, a) => sum + (a.proteines || 0), 0));
      const glucides = Math.round(aliments.reduce((sum, a) => sum + (a.glucides || 0), 0));
      const lipides = Math.round(aliments.reduce((sum, a) => sum + (a.lipides || 0), 0));
      
      meilleurRepas = {
        type,
        nom: `${type} du jour`,
        ingredients: aliments,
        nutrition: {
          calories: Math.round(caloriesTotal),
          proteines,
          glucides,
          lipides
        },
        source: 'selection_aleatoire',
        coherence: validationCoherence // Ajouter les infos de cohérence
      };
      
      // Si l'écart est acceptable, on arrête
      if (ecart <= TOLERANCE_CALORIES) {
        console.log(`  ✅ Écart acceptable: ${(ecart * 100).toFixed(1)}% (tentative ${tentative + 1})`);
        break;
      }
    }
  }
  
  // Statistiques de cohérence
  console.log(`\n📊 Statistiques génération aléatoire:`);
  console.log(`  ✅ Tentatives cohérentes: ${tentativesCoherentes}`);
  console.log(`  ❌ Tentatives incohérentes rejetées: ${tentativesIncoherentes}`);
  console.log(`  📈 Taux de cohérence: ${((tentativesCoherentes / (tentativesCoherentes + tentativesIncoherentes)) * 100).toFixed(1)}%`);
  
  if (meilleurRepas) {
    // 🛡️ VALIDATION FINALE CRITIQUE : Double vérification avant retour
    const nomsIngredientsFinal = meilleurRepas.ingredients.map(i => i.nom);
    const validationFinale = verifierCoherenceCombinaison(nomsIngredientsFinal);
    
    console.log(`\n🛡️ VALIDATION FINALE du repas:`);
    console.log(`  🍽️ Ingrédients: ${nomsIngredientsFinal.join(', ')}`);
    console.log(`  📊 Cohérence:`, validationFinale);
    
    if (!validationFinale.coherent) {
      console.error(`\n🚨 ALERTE CRITIQUE: Le repas généré est INCOHÉRENT malgré les filtres!`);
      console.error(`  ❌ Raisons:`, validationFinale.raisons);
      console.error(`  🔧 Le repas sera REJETÉ et un nouveau sera tenté`);
      
      // On ne retourne PAS ce repas incohérent
      throw new Error(`Impossible de générer un repas cohérent après ${MAX_TENTATIVES_REPAS} tentatives. Raisons: ${validationFinale.raisons.join(', ')}`);
    }
    
    console.log(`✅ Repas validé: ${meilleurRepas.ingredients.length} ingrédients, ${meilleurRepas.nutrition.calories} kcal`);
    console.log(`  🍽️ Ingrédients validés: ${nomsIngredientsFinal.join(', ')}`);
  }
  
  return meilleurRepas;
}

/**
 * Génère un menu pour une journée
 * + Applique les règles praticien
 */
async function genererMenuJour(caloriesJournalieres, jeuneIntermittent, alimentsExcel, regles = []) {
  const distribution = jeuneIntermittent ? DISTRIBUTION_JEUNE : DISTRIBUTION_NORMALE;
  const alimentsUtilisesAujourdhui = [];
  
  for (let tentative = 0; tentative < MAX_TENTATIVES_JOUR; tentative++) {
    const repas = {};
    
    // Petit-déjeuner (si pas de jeûne)
    if (!jeuneIntermittent && alimentsExcel.petitDejeuner.length > 0) {
      const caloriesPetitDej = Math.round(caloriesJournalieres * distribution.petitDejeuner);
      repas.petitDejeuner = await genererRepas(
        'Petit-déjeuner',
        caloriesPetitDej,
        alimentsExcel.petitDejeuner,
        alimentsUtilisesAujourdhui,
        regles
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
      repas.dejeuner = await genererRepas(
        'Déjeuner',
        caloriesDejeuner,
        alimentsExcel.dejeuner,
        alimentsUtilisesAujourdhui,
        regles
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
      repas.diner = await genererRepas(
        'Dîner',
        caloriesDiner,
        alimentsExcel.diner,
        alimentsUtilisesAujourdhui,
        regles
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
 * + Charge et applique les règles praticien
 * ⚠️ MODE STRICT : UNIQUEMENT aliments des fichiers Excel
 */
export async function genererMenuHebdomadaireExcel(profil) {
  console.log('🎯 MODE STRICT : Génération menu depuis fichiers Excel UNIQUEMENT');
  console.log('⚠️ AUCUN aliment externe ne sera utilisé');
  console.log('Profil:', profil);
  
  // Charger les aliments depuis les fichiers Excel (lance erreur si insuffisant)
  const alimentsExcel = await chargerAlimentsExcel();
  
  // Charger les règles praticien depuis les documents Word
  const reglesData = await chargerReglesPraticien(profil);
  console.log(`📋 Règles chargées: ${reglesData.toutesLesRegles.length} règles actives`);
  
  // Calculer les besoins nutritionnels (BMR/TDEE)
  const bmr = calculerBMR(profil);
  const tdee = calculerTDEE(bmr, profil.activitePhysique || profil.activite || 'moderee');
  let caloriesJournalieres = calculerCaloriesJournalieres(tdee, profil.objectif);
  
  console.log('📊 Besoins nutritionnels calculés (BMR/TDEE):');
  console.log('  BMR:', Math.round(bmr), 'kcal');
  console.log('  TDEE:', Math.round(tdee), 'kcal');
  console.log('  Objectif journalier (avant règles praticien):', caloriesJournalieres, 'kcal');
  
  // 🆕 APPLIQUER LES RÈGLES CALORIQUES DU PRATICIEN
  let regleCaloriqueAppliquee = null;
  if (reglesData.texteComplet.specifiques || reglesData.texteComplet.generales) {
    const texteRegles = reglesData.texteComplet.specifiques || reglesData.texteComplet.generales;
    const resultatRegles = chargerEtAppliquerReglesCaloriques(texteRegles, caloriesJournalieres, profil);
    
    if (resultatRegles.regleAppliquee) {
      console.log(`\n🔒 RÈGLE PRATICIEN APPLIQUÉE:`);
      console.log(`  📉 Calories ajustées: ${caloriesJournalieres} → ${resultatRegles.calories} kcal`);
      console.log(`  📝 Raison: ${resultatRegles.ajustement}`);
      console.log(`  📄 Contexte: "${resultatRegles.regleAppliquee.contexte}"`);
      
      caloriesJournalieres = resultatRegles.calories;
      regleCaloriqueAppliquee = resultatRegles.regleAppliquee;
    } else {
      console.log(`\n✅ Aucune règle calorique praticien → Utilisation calcul BMR/TDEE`);
    }
  }
  
  const macrosCibles = calculerMacrosCibles(caloriesJournalieres, profil.objectif);
  
  console.log('\n📊 Besoins nutritionnels FINAUX (après règles praticien):');
  console.log('  Objectif journalier:', caloriesJournalieres, 'kcal');
  console.log('  Macros cibles:', macrosCibles);
  
  // Générer les menus pour chaque jour (avec règles)
  const semaine = [];
  
  for (let i = 0; i < 7; i++) {
    const jourNom = JOURS_SEMAINE[i];
    console.log(`\n📅 Génération ${jourNom}...`);
    
    const menuJour = await genererMenuJour(
      caloriesJournalieres,
      profil.jeuneIntermittent,
      alimentsExcel,
      reglesData.toutesLesRegles
    );
    
    if (!menuJour) {
      console.error(`❌ Échec génération pour ${jourNom}`);
      console.log('🔍 Lancement du diagnostic des fichiers Excel...');
      
      // Effectuer un diagnostic détaillé
      const diagnostic = await diagnostiquerFichiersExcel();
      const messageDetaille = formaterMessageErreur(jourNom, diagnostic);
      
      // Créer une erreur avec le message détaillé
      const error = new Error(messageDetaille);
      error.diagnostic = diagnostic; // Attacher le diagnostic à l'erreur
      throw error;
    }
    
    // Calculer la date
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Extraire les repas sans le champ totaux
    const { totaux, ...repasSeuls } = menuJour;
    
    semaine.push({
      jour: jourNom,
      date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
      jeune: profil.jeuneIntermittent,
      menu: repasSeuls,  // Uniquement petitDejeuner, dejeuner, diner
      totaux: totaux      // totaux à part
    });
    
    console.log(`✅ ${jourNom} généré: ${totaux.calories} kcal`);
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
  
  // Valider le menu contre les règles praticien
  const menuComplet = {
    semaine,
    metadata: {
      profil,
      besoins: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        caloriesJournalieres,
        caloriesAvantReglesPraticien: calculerCaloriesJournalieres(tdee, profil.objectif), // Calories BMR/TDEE brutes
        regleCaloriqueAppliquee: regleCaloriqueAppliquee, // Règle calorique du document Word si appliquée
        macrosCibles
      },
      totaux: totalSemaine,
      moyennes: moyenneSemaine,
      dateGeneration: new Date().toISOString(),
      source: 'Fichiers Excel uploadés par le praticien',
      regles: {
        nombre: reglesData.toutesLesRegles.length,
        generales: reglesData.generales.length,
        specifiques: reglesData.specifiques.length,
        texteComplet: reglesData.texteComplet
      }
    }
  };
  
  // Appliquer et vérifier les règles
  if (reglesData.toutesLesRegles.length > 0) {
    const validation = appliquerReglesAuMenu(
      menuComplet, 
      reglesData.toutesLesRegles, 
      profil
    );
    
    menuComplet.metadata.validation = validation;
    
    if (!validation.valide) {
      console.warn('⚠️ Le menu contient des violations des règles praticien:');
      validation.violations.forEach(v => {
        console.warn(`  - ${v.jour} ${v.repas}: ${v.raison}`);
      });
    } else {
      console.log('✅ Menu conforme à toutes les règles praticien');
    }
  }
  
  // VALIDATION FINALE STRICTE : Vérifier que TOUS les aliments proviennent des fichiers Excel CORRESPONDANTS
  console.log('\n🔍 VALIDATION FINALE STRICTE : Vérification de la conformité 100% Excel PAR REPAS...');
  
  // Créer des Sets séparés pour chaque type de repas
  const alimentsParRepas = {
    petitDejeuner: new Set(alimentsExcel.petitDejeuner.map(a => a.nom.toLowerCase())),
    dejeuner: new Set(alimentsExcel.dejeuner.map(a => a.nom.toLowerCase())),
    diner: new Set(alimentsExcel.diner.map(a => a.nom.toLowerCase()))
  };
  
  console.log('📋 Aliments autorisés par repas:');
  console.log(`  Petit-déjeuner: ${alimentsParRepas.petitDejeuner.size} aliments`);
  console.log(`  Déjeuner: ${alimentsParRepas.dejeuner.size} aliments`);
  console.log(`  Dîner: ${alimentsParRepas.diner.size} aliments`);
  
  const alimentsExternesDetectes = [];
  
  menuComplet.semaine.forEach(jour => {
    Object.entries(jour.menu).forEach(([typeRepas, repas]) => {
      if (repas && repas.ingredients) {
        // Déterminer quelle liste utiliser selon le type de repas
        let alimentsAutorises;
        if (typeRepas === 'petitDejeuner') {
          alimentsAutorises = alimentsParRepas.petitDejeuner;
        } else if (typeRepas === 'dejeuner') {
          alimentsAutorises = alimentsParRepas.dejeuner;
        } else if (typeRepas === 'diner') {
          alimentsAutorises = alimentsParRepas.diner;
        }
        
        repas.ingredients.forEach(ingredient => {
          const nomIngredient = ingredient.nom.toLowerCase();
          if (!alimentsAutorises.has(nomIngredient)) {
            alimentsExternesDetectes.push({
              jour: jour.jour,
              repas: typeRepas,
              ingredient: ingredient.nom,
              raison: `Cet aliment n'est pas dans le fichier Excel ${typeRepas}`
            });
          }
        });
      }
    });
  });
  
  if (alimentsExternesDetectes.length > 0) {
    console.error('❌ ERREUR CRITIQUE : Des aliments EXTERNES ou MAL PLACÉS ont été détectés !');
    console.error('Aliments non autorisés pour leur repas:');
    alimentsExternesDetectes.forEach(item => {
      console.error(`  - ${item.jour} ${item.repas}: ${item.ingredient}`);
      console.error(`    → ${item.raison}`);
    });
    throw new Error(
      'ERREUR CRITIQUE : Des aliments non autorisés ont été utilisés.\n' +
      'Chaque repas doit utiliser UNIQUEMENT les aliments de son fichier Excel correspondant.\n' +
      `${alimentsExternesDetectes.length} aliment(s) non autorisé(s) détecté(s).`
    );
  }
  
  const totalAliments = alimentsParRepas.petitDejeuner.size + alimentsParRepas.dejeuner.size + alimentsParRepas.diner.size;
  console.log(`✅ VALIDATION STRICTE PAR REPAS RÉUSSIE : ${totalAliments} aliments Excel vérifiés`);
  console.log('✅ AUCUN aliment mal placé détecté - Conformité 100% par repas');
  
  menuComplet.metadata.validationStricte = {
    conforme: true,
    nombreAlimentsExcel: totalAliments,
    nombreAlimentsParRepas: {
      petitDejeuner: alimentsParRepas.petitDejeuner.size,
      dejeuner: alimentsParRepas.dejeuner.size,
      diner: alimentsParRepas.diner.size
    },
    nombreAlimentsExternes: 0,
    message: 'Menu généré à 100% depuis les fichiers Excel du praticien (validation par repas)'
  };
  
  return menuComplet;
}

/**
 * Régénère un repas spécifique (avec règles praticien)
 */
export async function regenererRepasExcel(jourIndex, typeRepas, profil) {
  const alimentsExcel = await chargerAlimentsExcel();
  const reglesData = await chargerReglesPraticien(profil);
  
  const caloriesJournalieres = calculerCaloriesJournalieres(
    calculerTDEE(calculerBMR(profil), profil.activitePhysique || profil.activite || 'moderee'),
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
  
  return await genererRepas(typeRepas, caloriesCible, alimentsDisponibles, [], reglesData.toutesLesRegles);
}
