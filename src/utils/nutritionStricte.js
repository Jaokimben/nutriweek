/**
 * Calcul nutritionnel basé UNIQUEMENT sur les aliments autorisés
 * Utilise les données nutritionnelles exactes du fichier Excel
 */

import alimentsAutorisesData from '../data/aliments_autorises.json'

// Créer un index pour un accès rapide
const alimentsIndex = {}
alimentsAutorisesData.forEach(aliment => {
  // Normaliser le nom pour la recherche
  const nomNormalise = aliment.nom.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .trim()
  
  alimentsIndex[nomNormalise] = aliment
  // Aussi indexer par le nom original
  alimentsIndex[aliment.nom] = aliment
})

/**
 * Trouve un aliment dans la base de données
 */
export const trouverAliment = (nomAliment) => {
  // Recherche exacte d'abord
  if (alimentsIndex[nomAliment]) {
    return alimentsIndex[nomAliment]
  }
  
  // Recherche normalisée
  const nomNormalise = nomAliment.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
  
  if (alimentsIndex[nomNormalise]) {
    return alimentsIndex[nomNormalise]
  }
  
  // Recherche partielle
  const cle = Object.keys(alimentsIndex).find(k => 
    k.includes(nomNormalise) || nomNormalise.includes(k)
  )
  
  if (cle) {
    return alimentsIndex[cle]
  }
  
  return null
}

/**
 * Calcule les valeurs nutritionnelles d'une recette
 */
export const calculerNutritionRecette = (ingredients) => {
  let calories = 0
  let proteines = 0
  let glucides = 0
  let lipides = 0
  let alimentsNonTrouves = []

  for (const [nomIngredient, details] of Object.entries(ingredients)) {
    const aliment = trouverAliment(nomIngredient)
    
    if (!aliment) {
      console.warn(`⚠️ Aliment non trouvé: ${nomIngredient}`)
      alimentsNonTrouves.push(nomIngredient)
      continue
    }

    const quantiteGrammes = convertirEnGrammes(details.quantite, details.unite)
    const facteur = quantiteGrammes / 100 // Valeurs pour 100g

    calories += (aliment.energie || 0) * facteur
    proteines += (aliment.proteines || 0) * facteur
    glucides += (aliment.glucides || 0) * facteur
    lipides += (aliment.lipides || 0) * facteur

    console.log(`✅ ${nomIngredient}: ${quantiteGrammes}g = ${(aliment.energie * facteur).toFixed(1)}kcal`)
  }

  if (alimentsNonTrouves.length > 0) {
    console.error(`❌ Aliments non trouvés: ${alimentsNonTrouves.join(', ')}`)
  }

  return {
    calories: Math.round(calories),
    proteines: Math.round(proteines * 10) / 10,
    glucides: Math.round(glucides * 10) / 10,
    lipides: Math.round(lipides * 10) / 10,
    alimentsNonTrouves
  }
}

/**
 * Convertit une quantité en grammes
 */
const convertirEnGrammes = (quantite, unite) => {
  const uniteNormalisee = unite.toLowerCase()
  
  switch (uniteNormalisee) {
    case 'g':
    case 'grammes':
      return quantite
    
    case 'kg':
    case 'kilogrammes':
      return quantite * 1000
    
    case 'ml':
    case 'millilitres':
      return quantite // Approximation 1ml = 1g pour la plupart des aliments
    
    case 'l':
    case 'litres':
      return quantite * 1000
    
    case 'cuillère à soupe':
    case 'c. à soupe':
    case 'cs':
      return quantite * 15
    
    case 'cuillère à café':
    case 'c. à café':
    case 'cc':
      return quantite * 5
    
    case 'tasse':
      return quantite * 240
    
    case 'portion':
      return quantite * 100
    
    default:
      console.warn(`⚠️ Unité non reconnue: ${unite}, utilisation de ${quantite}g`)
      return quantite
  }
}

/**
 * Vérifie si un aliment est autorisé
 */
export const estAlimentAutorise = (nomAliment) => {
  return trouverAliment(nomAliment) !== null
}

/**
 * Obtient la liste de tous les aliments autorisés
 */
export const getAlimentsAutorises = () => {
  return alimentsAutorisesData
}

/**
 * Obtient les informations nutritionnelles d'un aliment
 */
export const getInfoNutritionnelles = (nomAliment) => {
  return trouverAliment(nomAliment)
}

/**
 * Calcule les besoins nutritionnels pour un repas
 * basé sur l'objectif calorique total et la répartition
 */
export const calculerBesoinsRepas = (caloriesJournalieres, typeRepas) => {
  // Répartition standard
  const repartition = {
    'dejeuner': 0.25,  // 25% petit-déjeuner
    'diner': 0.40,     // 40% déjeuner
    'gouter': 0.35     // 35% dîner
  }

  const caloriesRepas = caloriesJournalieres * (repartition[typeRepas] || 0.33)
  
  // Répartition des macros (approximation)
  const proteines = (caloriesRepas * 0.20) / 4  // 20% des calories, 4kcal/g
  const lipides = (caloriesRepas * 0.30) / 9    // 30% des calories, 9kcal/g
  const glucides = (caloriesRepas * 0.50) / 4   // 50% des calories, 4kcal/g

  return {
    calories: Math.round(caloriesRepas),
    proteines: Math.round(proteines * 10) / 10,
    glucides: Math.round(glucides * 10) / 10,
    lipides: Math.round(lipides * 10) / 10
  }
}

/**
 * Valide qu'une recette utilise uniquement des aliments autorisés
 */
export const validerRecette = (recette) => {
  const errors = []
  const warnings = []

  if (!recette.ingredients || Object.keys(recette.ingredients).length === 0) {
    errors.push("La recette n'a pas d'ingrédients")
    return { valide: false, errors, warnings }
  }

  for (const nomIngredient of Object.keys(recette.ingredients)) {
    if (!estAlimentAutorise(nomIngredient)) {
      errors.push(`Aliment non autorisé: ${nomIngredient}`)
    }
  }

  // Calculer la nutrition
  const nutrition = calculerNutritionRecette(recette.ingredients)
  
  if (nutrition.alimentsNonTrouves.length > 0) {
    warnings.push(`Aliments non trouvés: ${nutrition.alimentsNonTrouves.join(', ')}`)
  }

  if (nutrition.calories === 0) {
    warnings.push("La recette a 0 calories, vérifier les ingrédients")
  }

  return {
    valide: errors.length === 0,
    errors,
    warnings,
    nutrition
  }
}

export default {
  trouverAliment,
  calculerNutritionRecette,
  estAlimentAutorise,
  getAlimentsAutorises,
  getInfoNutritionnelles,
  calculerBesoinsRepas,
  validerRecette
}
