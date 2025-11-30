/**
 * Générateur de menus utilisant UNIQUEMENT les aliments autorisés
 */

import { recettesStrictesDatabase, getRecetteAleatoire, getRecettesParType } from '../data/recettes_strictes.js'
import { calculerNutritionRecette, calculerBesoinsRepas } from './nutritionStricte.js'

/**
 * Génère un menu pour une journée
 */
export const genererMenuJour = (profile, nutritionNeeds) => {
  const { objectif, capaciteDigestive = [] } = profile
  
  // Petit-déjeuner
  const petitDejeuner = getRecetteAleatoire('dejeuner', [])
  const nutritionPetitDej = calculerNutritionRecette(petitDejeuner.ingredients)
  
  // Déjeuner - toujours un repas complet
  const dejeuner = choisirRecetteDejeuner([petitDejeuner.nom])
  const nutritionDejeuner = calculerNutritionRecette(dejeuner.ingredients)
  
  // Dîner - adapté selon capacité digestive
  let diner = null
  let nutritionDiner = null
  
  const besoinDiner = capaciteDigestive.includes('Digestion lente le soir')
  
  if (besoinDiner) {
    // Choisir un dîner léger
    diner = choisirRecetteDinerLeger([petitDejeuner.nom, dejeuner.nom])
  } else {
    // Dîner normal
    diner = choisirRecetteDiner([petitDejeuner.nom, dejeuner.nom])
  }
  
  nutritionDiner = calculerNutritionRecette(diner.ingredients)

  return {
    petitDejeuner: {
      ...petitDejeuner,
      ...nutritionPetitDej
    },
    dejeuner: {
      ...dejeuner,
      ...nutritionDejeuner
    },
    diner: {
      ...diner,
      ...nutritionDiner
    }
  }
}

/**
 * Choisit une recette pour le déjeuner
 */
const choisirRecetteDejeuner = (excludeNames = []) => {
  // Alterner entre légumineuses, céréales et recettes composées
  const rand = Math.random()
  
  if (rand < 0.4) {
    // 40% légumineuses
    const recettes = recettesStrictesDatabase.legumineuses.filter(
      r => !excludeNames.includes(r.nom)
    )
    return recettes[Math.floor(Math.random() * recettes.length)]
  } else if (rand < 0.7) {
    // 30% céréales
    const recettes = recettesStrictesDatabase.cereales.filter(
      r => !excludeNames.includes(r.nom)
    )
    return recettes[Math.floor(Math.random() * recettes.length)]
  } else {
    // 30% recettes composées
    const recettes = recettesStrictesDatabase.recettesComposees.filter(
      r => !excludeNames.includes(r.nom)
    )
    return recettes[Math.floor(Math.random() * recettes.length)]
  }
}

/**
 * Choisit une recette pour le dîner
 */
const choisirRecetteDiner = (excludeNames = []) => {
  // Mélange de toutes les catégories sauf petit-déjeuner
  const toutesRecettes = [
    ...recettesStrictesDatabase.legumineuses,
    ...recettesStrictesDatabase.cereales,
    ...recettesStrictesDatabase.recettesComposees
  ].filter(r => !excludeNames.includes(r.nom))
  
  return toutesRecettes[Math.floor(Math.random() * toutesRecettes.length)]
}

/**
 * Choisit une recette légère pour le dîner
 */
const choisirRecetteDinerLeger = (excludeNames = []) => {
  const recettes = recettesStrictesDatabase.dinerLeger.filter(
    r => !excludeNames.includes(r.nom)
  )
  
  if (recettes.length === 0) {
    // Fallback sur une recette normale
    return choisirRecetteDiner(excludeNames)
  }
  
  return recettes[Math.floor(Math.random() * recettes.length)]
}

/**
 * Génère un menu hebdomadaire complet
 */
export const genererMenuHebdomadaire = (profile) => {
  const { objectif, taille, poids, age, genre, activitePhysique } = profile
  
  // Calculer les besoins caloriques
  const besoinsNutritionnels = calculerBesoinsNutritionnels(profile)
  
  const semaine = []
  const nomsUtilises = []
  
  // Jours de la semaine
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  
  for (let i = 0; i < 7; i++) {
    const jour = jours[i]
    
    // Jeûne intermittent pour objectif perte
    const estJourJeune = objectif === 'perte' && [0, 2, 4, 5].includes(i)
    
    if (estJourJeune) {
      // Jour de jeûne : seulement petit-déjeuner et déjeuner
      const petitDejeuner = getRecetteAleatoire('dejeuner', nomsUtilises)
      const nutritionPetitDej = calculerNutritionRecette(petitDejeuner.ingredients)
      
      const dejeuner = choisirRecetteDejeuner([...nomsUtilises, petitDejeuner.nom])
      const nutritionDejeuner = calculerNutritionRecette(dejeuner.ingredients)
      
      nomsUtilises.push(petitDejeuner.nom, dejeuner.nom)
      
      semaine.push({
        jour,
        menu: {
          petitDejeuner: {
            ...petitDejeuner,
            calories: nutritionPetitDej.calories,
            proteines: nutritionPetitDej.proteines,
            glucides: nutritionPetitDej.glucides,
            lipides: nutritionPetitDej.lipides
          },
          dejeuner: {
            ...dejeuner,
            calories: nutritionDejeuner.calories,
            proteines: nutritionDejeuner.proteines,
            glucides: nutritionDejeuner.glucides,
            lipides: nutritionDejeuner.lipides
          },
          diner: null
        },
        note: '🌙 Jeûne intermittent - Pas de dîner'
      })
    } else {
      // Jour normal avec 3 repas
      const menuJour = genererMenuJour(profile, besoinsNutritionnels)
      
      nomsUtilises.push(
        menuJour.petitDejeuner.nom,
        menuJour.dejeuner.nom,
        menuJour.diner.nom
      )
      
      semaine.push({
        jour,
        menu: menuJour
      })
    }
  }
  
  return {
    semaine,
    nutritionNeeds: besoinsNutritionnels,
    conseils: genererConseils(profile)
  }
}

/**
 * Calcule les besoins nutritionnels
 */
const calculerBesoinsNutritionnels = (profile) => {
  const { taille, poids, age, genre, activitePhysique, objectif } = profile
  
  // Calcul du métabolisme de base (formule de Harris-Benedict)
  let bmr
  if (genre === 'homme') {
    bmr = 88.362 + (13.397 * poids) + (4.799 * taille) - (5.677 * age)
  } else {
    bmr = 447.593 + (9.247 * poids) + (3.098 * taille) - (4.330 * age)
  }
  
  // Facteur d'activité
  const facteursActivite = {
    'sedentaire': 1.2,
    'legere': 1.375,
    'moderee': 1.55,
    'intense': 1.725,
    'tres_intense': 1.9
  }
  
  const facteurActivite = facteursActivite[activitePhysique] || 1.55
  
  // TDEE (Total Daily Energy Expenditure)
  let tdee = bmr * facteurActivite
  
  // Ajustement selon l'objectif
  if (objectif === 'perte') {
    tdee *= 0.8 // Déficit de 20%
  } else if (objectif === 'prise de masse') {
    tdee *= 1.1 // Surplus de 10%
  }
  
  // Répartition des macronutriments
  const proteines = (tdee * 0.25) / 4 // 25% des calories, 4kcal/g
  const lipides = (tdee * 0.30) / 9   // 30% des calories, 9kcal/g
  const glucides = (tdee * 0.45) / 4  // 45% des calories, 4kcal/g
  
  return {
    calories: Math.round(tdee),
    proteines: Math.round(proteines),
    glucides: Math.round(glucides),
    lipides: Math.round(lipides),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee)
  }
}

/**
 * Génère des conseils personnalisés
 */
const genererConseils = (profile) => {
  const conseils = []
  
  if (profile.objectif === 'perte') {
    conseils.push('🏃 Privilégiez les légumineuses riches en fibres')
    conseils.push('💧 Buvez au moins 2L d\'eau par jour')
    conseils.push('🌙 Respectez le jeûne intermittent les jours indiqués')
  }
  
  if (profile.objectif === 'confort digestif') {
    conseils.push('🌿 Les lentilles corail sont plus digestes')
    conseils.push('🍚 Préférez le riz blanc au riz complet le soir')
    conseils.push('⏰ Dînez 2-3h avant le coucher')
  }
  
  if (profile.capaciteDigestive?.includes('Digestion lente le soir')) {
    conseils.push('🌙 Vos dîners sont adaptés pour une digestion facile')
    conseils.push('🥣 Les flocons d\'avoine du soir sont une excellente option')
  }
  
  conseils.push('✅ Tous vos repas utilisent uniquement des aliments autorisés')
  conseils.push('📊 Les valeurs nutritionnelles sont calculées précisément')
  
  return conseils
}

/**
 * Régénère un repas unique
 */
export const regenererRepas = (typeRepas, profile, menuActuel) => {
  // Collecter les noms déjà utilisés dans le menu actuel
  const nomsUtilises = []
  
  if (menuActuel.petitDejeuner) nomsUtilises.push(menuActuel.petitDejeuner.nom)
  if (menuActuel.dejeuner) nomsUtilises.push(menuActuel.dejeuner.nom)
  if (menuActuel.diner) nomsUtilises.push(menuActuel.diner.nom)
  
  let nouvelleRecette
  
  switch (typeRepas) {
    case 'petitDejeuner':
      nouvelleRecette = getRecetteAleatoire('dejeuner', nomsUtilises)
      break
      
    case 'dejeuner':
      nouvelleRecette = choisirRecetteDejeuner(nomsUtilises)
      break
      
    case 'diner':
      if (profile.capaciteDigestive?.includes('Digestion lente le soir')) {
        nouvelleRecette = choisirRecetteDinerLeger(nomsUtilises)
      } else {
        nouvelleRecette = choisirRecetteDiner(nomsUtilises)
      }
      break
      
    default:
      nouvelleRecette = getRecetteAleatoire('diner', nomsUtilises)
  }
  
  const nutrition = calculerNutritionRecette(nouvelleRecette.ingredients)
  
  return {
    ...nouvelleRecette,
    calories: nutrition.calories,
    proteines: nutrition.proteines,
    glucides: nutrition.glucides,
    lipides: nutrition.lipides
  }
}

export default {
  genererMenuJour,
  genererMenuHebdomadaire,
  regenererRepas
}
