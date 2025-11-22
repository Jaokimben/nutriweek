/**
 * Calcule le métabolisme de base (BMR) avec la formule de Mifflin-St Jeor
 * @param {Object} profile - Profil utilisateur
 * @returns {number} - BMR en kcal/jour
 */
const calculateBMR = (profile) => {
  const { poids, taille, age, genre } = profile;
  
  // Formule de Mifflin-St Jeor (plus précise que Harris-Benedict)
  // Homme: BMR = (10 × poids en kg) + (6.25 × taille en cm) - (5 × âge en années) + 5
  // Femme: BMR = (10 × poids en kg) + (6.25 × taille en cm) - (5 × âge en années) - 161
  
  const baseCalc = (10 * parseFloat(poids)) + (6.25 * parseFloat(taille)) - (5 * parseFloat(age));
  
  if (genre === 'M') {
    return baseCalc + 5;
  } else {
    return baseCalc - 161;
  }
};

/**
 * Calcule les besoins caloriques totaux (TDEE) selon l'activité
 * @param {number} bmr - Métabolisme de base
 * @param {string} activitePhysique - Niveau d'activité
 * @returns {number} - TDEE en kcal/jour
 */
const calculateTDEE = (bmr, activitePhysique) => {
  // Facteurs d'activité
  const activityFactors = {
    sedentaire: 1.2,    // Peu ou pas d'exercice
    moderee: 1.55,      // Exercice modéré (3-5 jours/semaine)
    elevee: 1.725       // Exercice intense (6-7 jours/semaine)
  };
  
  return bmr * (activityFactors[activitePhysique] || 1.2);
};

/**
 * Calcule les besoins caloriques selon les règles définies
 * @param {Object} profile - Profil utilisateur
 * @returns {Object} - Besoins nutritionnels calculés
 */
export const calculateCalories = (profile) => {
  const { objectif, activitePhysique, genre, semaineActuelle = 1, poids, taille, age } = profile;

  // Calculer le métabolisme de base et les besoins totaux
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, activitePhysique);
  
  let dailyCalories = 0;

  // Règles pour la perte de poids
  if (objectif === 'perte') {
    if (semaineActuelle <= 3) {
      // Les trois premières semaines : déficit calorique modéré (25-30%)
      dailyCalories = Math.round(tdee * 0.70);
      
      // Limites de sécurité : minimum 1200 kcal pour femmes, 1500 pour hommes
      const minCalories = genre === 'M' ? 1500 : 1200;
      dailyCalories = Math.max(dailyCalories, minCalories);
      
    } else if (semaineActuelle === 4) {
      // La 4ème semaine : déficit plus important (35-40%)
      dailyCalories = Math.round(tdee * 0.60);
      
      // Limites de sécurité
      const minCalories = genre === 'M' ? 1400 : 1000;
      dailyCalories = Math.max(dailyCalories, minCalories);
      
    } else {
      // Par la suite : maintenance avec léger déficit (10-15%)
      dailyCalories = Math.round(tdee * 0.85);
    }
  } else {
    // Pour confort digestif et vitalité : utiliser le TDEE complet
    dailyCalories = Math.round(tdee);
  }

  // Répartition des macronutriments
  let macroRatio = { proteines: 30, lipides: 30, glucides: 40 };
  
  if (objectif === 'perte') {
    // 40% protéines, 40% graisses, 20% glucides pour perte de poids
    macroRatio = { proteines: 40, lipides: 40, glucides: 20 };
  }

  // Calcul des grammes (plus précis avec 1 décimale)
  const macros = {
    proteines: parseFloat(((dailyCalories * macroRatio.proteines / 100) / 4).toFixed(1)), // 4 cal/g
    lipides: parseFloat(((dailyCalories * macroRatio.lipides / 100) / 9).toFixed(1)), // 9 cal/g
    glucides: parseFloat(((dailyCalories * macroRatio.glucides / 100) / 4).toFixed(1)), // 4 cal/g
  };

  // Répartition des repas (arrondi à l'unité supérieure)
  const { nombreRepas } = profile;
  let mealDistribution = {};

  if (nombreRepas === '2') {
    // Midi: 60%, Soir: 40% (mais soir hypocalorique pour perte de poids)
    if (objectif === 'perte') {
      mealDistribution = {
        dejeuner: Math.ceil(dailyCalories * 0.70),
        diner: Math.ceil(dailyCalories * 0.30)
      };
    } else {
      mealDistribution = {
        dejeuner: Math.ceil(dailyCalories * 0.60),
        diner: Math.ceil(dailyCalories * 0.40)
      };
    }
  } else if (nombreRepas === '3') {
    // Matin: 25%, Midi: 45%, Soir: 30%
    if (objectif === 'perte') {
      mealDistribution = {
        petitDejeuner: Math.ceil(dailyCalories * 0.30),
        dejeuner: Math.ceil(dailyCalories * 0.50),
        diner: Math.ceil(dailyCalories * 0.20)
      };
    } else {
      mealDistribution = {
        petitDejeuner: Math.ceil(dailyCalories * 0.25),
        dejeuner: Math.ceil(dailyCalories * 0.45),
        diner: Math.ceil(dailyCalories * 0.30)
      };
    }
  }

  return {
    dailyCalories: Math.round(dailyCalories), // Arrondi à l'unité
    bmr: Math.round(bmr), // Ajout du BMR dans les résultats
    tdee: Math.round(tdee), // Ajout du TDEE dans les résultats
    macros,
    macroRatio,
    mealDistribution
  };
};

/**
 * Détermine si un aliment est autorisé selon le profil
 * @param {Object} aliment - Aliment à vérifier
 * @param {Object} profile - Profil utilisateur
 * @returns {boolean} - True si l'aliment est autorisé
 */
export const isAlimentAllowed = (aliment, profile) => {
  const { objectif, intolerances, capaciteDigestive } = profile;

  // Vérifier les intolérances
  const alimentNom = aliment.alim_nom_fr?.toLowerCase() || '';
  
  if (intolerances.includes('Gluten') && 
      (alimentNom.includes('blé') || alimentNom.includes('orge') || alimentNom.includes('avoine'))) {
    return false;
  }
  
  if (intolerances.includes('Lait') && alimentNom.includes('lait')) {
    return false;
  }

  // Règles spécifiques pour perte de poids
  if (objectif === 'perte') {
    // Limiter les glucides à 100g par jour
    // Éviter le pain (sera géré dans la génération de menu)
    // Limiter le blé et le maïs
    if (alimentNom.includes('pain') || alimentNom.includes('maïs')) {
      return false;
    }
  }

  // Règles pour confort digestif
  if (objectif === 'confort') {
    // Si reflux, limiter les aliments gras
    if (capaciteDigestive.includes('Reflux gastrique') || 
        capaciteDigestive.includes('Rôt') || 
        capaciteDigestive.includes('Nausée')) {
      if (aliment['Lipides (g/100 g)'] > 15) {
        return false;
      }
    }
    
    // Si ballonnement, exclure gluten et produits laitiers
    if (capaciteDigestive.includes('Ballonnement')) {
      if (alimentNom.includes('blé') || alimentNom.includes('lait')) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Calcule l'indice glycémique estimé d'un aliment
 * @param {Object} aliment - Aliment à évaluer
 * @returns {number} - IG estimé (approximatif)
 */
export const calculateGI = (aliment) => {
  const glucides = aliment['Glucides (g/100 g)'] || 0;
  const fibres = aliment['Fibres (g/100 g)'] || 0;
  const sucres = aliment['Sucres (g/100 g)'] || 0;
  
  // Estimation très simplifiée de l'IG
  // Les légumineuses ont généralement un IG bas (20-40)
  // Les céréales complètes ont un IG moyen (40-60)
  // Les céréales raffinées ont un IG élevé (60-80)
  
  const alimentNom = aliment.alim_nom_fr?.toLowerCase() || '';
  
  if (alimentNom.includes('lentille') || alimentNom.includes('pois') || 
      alimentNom.includes('haricot') || alimentNom.includes('fève')) {
    return 35; // IG bas pour légumineuses
  }
  
  if (alimentNom.includes('complet') || alimentNom.includes('quinoa')) {
    return 50; // IG moyen pour céréales complètes
  }
  
  if (alimentNom.includes('blanc') || alimentNom.includes('raffiné')) {
    return 70; // IG élevé pour céréales raffinées
  }
  
  // Estimation basée sur le ratio sucres/glucides
  if (glucides > 0) {
    const sugarRatio = sucres / glucides;
    if (sugarRatio > 0.6) return 65; // Haute teneur en sucres
    if (sugarRatio > 0.3) return 55; // Teneur moyenne en sucres
    return 45; // Faible teneur en sucres
  }
  
  return 50; // Valeur par défaut
};

/**
 * Vérifie si un aliment est de saison en France
 * @param {string} aliment - Nom de l'aliment
 * @param {number} mois - Mois (1-12)
 * @returns {boolean} - True si de saison
 */
export const isSaisonal = (aliment, mois = new Date().getMonth() + 1) => {
  // Simplification : la plupart des légumineuses et céréales sont disponibles toute l'année
  // Cette fonction pourrait être étendue avec une vraie base de données de saisonnalité
  return true;
};

/**
 * Calcule l'IMC (Indice de Masse Corporelle)
 * @param {number} poids - Poids en kg
 * @param {number} taille - Taille en cm
 * @returns {Object} - IMC et catégorie
 */
export const calculateIMC = (poids, taille) => {
  const tailleM = taille / 100;
  const imc = poids / (tailleM * tailleM);
  
  let categorie = '';
  if (imc < 18.5) categorie = 'Maigreur';
  else if (imc < 25) categorie = 'Normal';
  else if (imc < 30) categorie = 'Surpoids';
  else categorie = 'Obésité';
  
  return {
    imc: imc.toFixed(1),
    categorie
  };
};
