/**
 * 🧮 BMR CALCULATOR - Calcul du Métabolisme de Base
 * 
 * Formule de Harris-Benedict (révisée)
 * - Homme: BMR = 88.362 + (13.397 × poids) + (4.799 × taille) - (5.677 × âge)
 * - Femme: BMR = 447.593 + (9.247 × poids) + (3.098 × taille) - (4.330 × âge)
 * 
 * Supporte plusieurs formats de genre:
 * - 'M' / 'F' (format standard)
 * - 'homme' / 'femme' (format texte)
 * - 'male' / 'female' (format anglais)
 * 
 * Supporte plusieurs noms de champs:
 * - profil.genre
 * - profil.sexe
 * - profil.gender
 */

/**
 * Normalise le genre vers 'M' ou 'F'
 * @param {string} genre - Genre à normaliser
 * @returns {string} 'M' ou 'F'
 */
export const normaliserGenre = (genre) => {
  if (!genre) {
    console.warn('⚠️ [normaliserGenre] Genre non défini, défaut: M')
    return 'M'
  }

  const genreStr = String(genre).toLowerCase().trim()
  
  // Formats homme
  if (['m', 'homme', 'male', 'masculin', 'h'].includes(genreStr)) {
    return 'M'
  }
  
  // Formats femme
  if (['f', 'femme', 'female', 'féminin', 'femenin'].includes(genreStr)) {
    return 'F'
  }
  
  console.warn(`⚠️ [normaliserGenre] Genre inconnu: "${genre}", défaut: M`)
  return 'M'
}

/**
 * Extrait le genre du profil (supporte genre/sexe/gender)
 * @param {Object} profil - Profil utilisateur
 * @returns {string} 'M' ou 'F'
 */
export const extraireGenre = (profil) => {
  const genre = profil.genre || profil.sexe || profil.gender
  return normaliserGenre(genre)
}

/**
 * Calcule le BMR (Basal Metabolic Rate)
 * @param {Object} profil - Profil utilisateur
 * @param {number} profil.poids - Poids en kg
 * @param {number} profil.taille - Taille en cm
 * @param {number} profil.age - Âge en années
 * @param {string} profil.genre - Genre ('M', 'F', 'homme', 'femme', etc.)
 * @returns {number} BMR en kcal/jour
 */
export const calculerBMR = (profil) => {
  const { poids, taille, age } = profil
  
  // Validation des données
  if (!poids || !taille || !age) {
    console.error('❌ [calculerBMR] Données manquantes:', { poids, taille, age })
    throw new Error('Données manquantes pour calculer le BMR (poids, taille, âge requis)')
  }

  // Extraire et normaliser le genre
  const genre = extraireGenre(profil)

  console.log(`🧮 [calculerBMR] Calcul BMR:`, {
    poids: `${poids} kg`,
    taille: `${taille} cm`,
    age: `${age} ans`,
    genre,
    genreOriginal: profil.genre || profil.sexe || profil.gender
  })

  let bmr
  
  if (genre === 'M') {
    // Formule Harris-Benedict pour homme
    bmr = 88.362 + (13.397 * poids) + (4.799 * taille) - (5.677 * age)
  } else {
    // Formule Harris-Benedict pour femme
    bmr = 447.593 + (9.247 * poids) + (3.098 * taille) - (4.330 * age)
  }

  const bmrRounded = Math.round(bmr)
  console.log(`✅ [calculerBMR] BMR calculé: ${bmrRounded} kcal/jour (genre: ${genre})`)
  
  return bmrRounded
}

/**
 * Multiplicateurs d'activité physique
 */
export const ACTIVITE_MULTIPLICATEURS = {
  sedentaire: 1.2,      // Peu ou pas d'exercice
  legere: 1.375,        // Exercice léger 1-3 jours/semaine
  moderee: 1.55,        // Exercice modéré 3-5 jours/semaine
  intense: 1.725,       // Exercice intense 6-7 jours/semaine
  extreme: 1.9          // Exercice très intense 2x/jour
}

/**
 * Calcule le TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - BMR en kcal/jour
 * @param {string} activite - Niveau d'activité
 * @returns {number} TDEE en kcal/jour
 */
export const calculerTDEE = (bmr, activite) => {
  const multiplicateur = ACTIVITE_MULTIPLICATEURS[activite] || 1.55 // Default: modérée

  console.log(`🏃 [calculerTDEE] Calcul TDEE:`, {
    bmr: `${bmr} kcal/jour`,
    activite,
    multiplicateur
  })

  const tdee = Math.round(bmr * multiplicateur)
  console.log(`✅ [calculerTDEE] TDEE calculé: ${tdee} kcal/jour`)
  
  return tdee
}

/**
 * Ajuste les calories selon l'objectif
 * @param {number} tdee - TDEE en kcal/jour
 * @param {string} objectif - Objectif ('perte', 'maintien', 'prise', 'confort', 'vitalite')
 * @returns {number} Calories journalières ajustées
 */
export const ajusterCaloriesObjectif = (tdee, objectif) => {
  let caloriesJournalieres

  switch(objectif) {
    case 'perte':
      // Déficit de 15-20% pour perte de poids
      caloriesJournalieres = Math.round(tdee * 0.85)
      break
    case 'prise':
      // Surplus de 10-15% pour prise de masse
      caloriesJournalieres = Math.round(tdee * 1.15)
      break
    case 'confort':
    case 'vitalite':
    case 'maintien':
    default:
      // Maintien: TDEE
      caloriesJournalieres = tdee
      break
  }

  console.log(`🎯 [ajusterCaloriesObjectif] Ajustement calories:`, {
    tdee: `${tdee} kcal/jour`,
    objectif,
    caloriesJournalieres: `${caloriesJournalieres} kcal/jour`,
    variation: `${((caloriesJournalieres - tdee) / tdee * 100).toFixed(1)}%`
  })

  return caloriesJournalieres
}

/**
 * Calcule les besoins caloriques complets
 * @param {Object} profil - Profil utilisateur complet
 * @returns {Object} { bmr, tdee, caloriesJournalieres }
 */
export const calculerBesoinsCaloriques = (profil) => {
  console.log('📊 [calculerBesoinsCaloriques] Calcul complet des besoins caloriques')
  
  const bmr = calculerBMR(profil)
  const tdee = calculerTDEE(bmr, profil.activitePhysique || profil.activite || 'moderee')
  const caloriesJournalieres = ajusterCaloriesObjectif(tdee, profil.objectif || 'maintien')

  const resultat = {
    bmr,
    tdee,
    caloriesJournalieres,
    genre: extraireGenre(profil)
  }

  console.log('✅ [calculerBesoinsCaloriques] Résultat:', resultat)
  
  return resultat
}
