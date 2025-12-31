/**
 * Gestion du stockage des favoris avec LocalStorage
 * 
 * Structure de données:
 * - nutriweek_favorites: { [userId]: { [recipeId]: { recipe, addedAt, notes } } }
 */

const FAVORITES_KEY = 'nutriweek_favorites'

/**
 * Récupérer tous les favoris d'un utilisateur
 */
export const getAllFavorites = async () => {
  try {
    const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
    const userFavorites = allFavorites['current'] || {}
    
    // Convertir en tableau
    const favoritesArray = Object.entries(userFavorites).map(([recipeId, data]) => ({
      id: recipeId,
      recipe: data.recipe,
      addedAt: data.addedAt,
      notes: data.notes || ''
    }))
    
    // Trier par date (plus récent en premier)
    return favoritesArray.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error)
    return []
  }
}

/**
 * Ajouter un favori
 */
export const addFavorite = async (recipe, notes = '') => {
  try {
    const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
    
    if (!allFavorites['current']) {
      allFavorites['current'] = {}
    }
    
    const recipeId = recipe.id || recipe.nom
    
    allFavorites['current'][recipeId] = {
      recipe: {
        id: recipeId,
        nom: recipe.nom,
        type: recipe.type || getMealTypeFromMoment(recipe.moment),
        calories: recipe.calories,
        proteines: recipe.proteines,
        lipides: recipe.lipides,
        glucides: recipe.glucides,
        ingredients: recipe.ingredients,
        preparation: recipe.preparation,
        tags: recipe.tags || []
      },
      addedAt: new Date().toISOString(),
      notes: notes
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites))
    
    console.log(`✅ Favori ajouté: ${recipe.nom}`)
    return { success: true }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du favori:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Retirer un favori
 */
export const removeFavorite = async (recipeId) => {
  try {
    const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
    
    if (allFavorites['current'] && allFavorites['current'][recipeId]) {
      delete allFavorites['current'][recipeId]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites))
      
      console.log(`✅ Favori retiré: ${recipeId}`)
      return { success: true }
    }
    
    return { success: false, error: 'Favori non trouvé' }
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Vérifier si une recette est dans les favoris
 */
export const isFavorite = async (recipeId) => {
  try {
    const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
    return !!(allFavorites['current'] && allFavorites['current'][recipeId])
  } catch (error) {
    console.error('Erreur lors de la vérification du favori:', error)
    return false
  }
}

/**
 * Ajouter/modifier une note sur un favori
 */
export const updateFavoriteNote = async (recipeId, notes) => {
  try {
    const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
    
    if (allFavorites['current'] && allFavorites['current'][recipeId]) {
      allFavorites['current'][recipeId].notes = notes
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites))
      
      console.log(`✅ Note mise à jour pour: ${recipeId}`)
      return { success: true }
    }
    
    return { success: false, error: 'Favori non trouvé' }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtenir les statistiques des favoris
 */
export const getFavoritesStats = async () => {
  try {
    const favorites = await getAllFavorites()
    
    const stats = {
      total: favorites.length,
      byType: {
        'petit-dejeuner': favorites.filter(f => f.recipe.type === 'petit-dejeuner').length,
        'dejeuner': favorites.filter(f => f.recipe.type === 'dejeuner').length,
        'diner': favorites.filter(f => f.recipe.type === 'diner').length
      },
      averageCalories: favorites.length > 0 
        ? Math.round(favorites.reduce((sum, f) => sum + f.recipe.calories, 0) / favorites.length)
        : 0,
      topFavorites: favorites.slice(0, 3)
    }
    
    return stats
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error)
    return {
      total: 0,
      byType: { 'petit-dejeuner': 0, 'dejeuner': 0, 'diner': 0 },
      averageCalories: 0,
      topFavorites: []
    }
  }
}

/**
 * Exporter les favoris en JSON
 */
export const exportFavorites = async () => {
  try {
    const favorites = await getAllFavorites()
    const dataStr = JSON.stringify(favorites, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `nutriweek-favoris-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    return { success: true }
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Importer des favoris depuis un fichier JSON
 */
export const importFavorites = async (fileContent) => {
  try {
    const importedFavorites = JSON.parse(fileContent)
    
    if (!Array.isArray(importedFavorites)) {
      throw new Error('Format de fichier invalide')
    }
    
    const allFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
    
    if (!allFavorites['current']) {
      allFavorites['current'] = {}
    }
    
    // Ajouter les favoris importés
    importedFavorites.forEach(fav => {
      const recipeId = fav.id || fav.recipe.id || fav.recipe.nom
      allFavorites['current'][recipeId] = {
        recipe: fav.recipe,
        addedAt: fav.addedAt,
        notes: fav.notes || ''
      }
    })
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites))
    
    return { success: true, count: importedFavorites.length }
  } catch (error) {
    console.error('Erreur lors de l\'import:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Utilitaire pour déterminer le type de repas depuis le moment
 */
const getMealTypeFromMoment = (moment) => {
  if (!moment) return 'dejeuner'
  
  const momentLower = moment.toLowerCase()
  if (momentLower.includes('petit')) return 'petit-dejeuner'
  if (momentLower.includes('déjeuner') || momentLower.includes('dejeuner')) return 'dejeuner'
  if (momentLower.includes('dîner') || momentLower.includes('diner')) return 'diner'
  
  return 'dejeuner'
}
