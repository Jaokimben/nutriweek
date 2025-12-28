/**
 * Service de gestion des favoris
 * Stockage dans localStorage avec sync multi-devices possible
 */

const FAVORITES_KEY = 'nutriweek_favorites'
const FAVORITES_STATS_KEY = 'nutriweek_favorites_stats'

/**
 * Structure d'un favori
 * {
 *   id: string (unique),
 *   userId: string,
 *   recipeId: string,
 *   recipeName: string,
 *   recipeType: 'petit_dejeuner' | 'dejeuner' | 'diner',
 *   calories: number,
 *   proteines: number,
 *   lipides: number,
 *   glucides: number,
 *   ingredients: array,
 *   preparation: string,
 *   tags: array,
 *   addedAt: timestamp,
 *   notes: string (optional)
 * }
 */

// ========== Lecture ==========

/**
 * Récupère tous les favoris d'un utilisateur
 */
export const getFavorites = (userId) => {
  try {
    const allFavorites = localStorage.getItem(FAVORITES_KEY)
    if (!allFavorites) return []
    
    const favorites = JSON.parse(allFavorites)
    // Filtrer par utilisateur
    return favorites.filter(fav => fav.userId === userId)
  } catch (error) {
    console.error('Erreur lecture favoris:', error)
    return []
  }
}

/**
 * Récupère un favori par ID
 */
export const getFavoriteById = (favoriteId) => {
  try {
    const allFavorites = localStorage.getItem(FAVORITES_KEY)
    if (!allFavorites) return null
    
    const favorites = JSON.parse(allFavorites)
    return favorites.find(fav => fav.id === favoriteId) || null
  } catch (error) {
    console.error('Erreur lecture favori:', error)
    return null
  }
}

/**
 * Vérifie si une recette est en favoris
 */
export const isFavorite = (userId, recipeId) => {
  try {
    const favorites = getFavorites(userId)
    return favorites.some(fav => fav.recipeId === recipeId)
  } catch (error) {
    console.error('Erreur vérification favori:', error)
    return false
  }
}

// ========== Écriture ==========

/**
 * Ajoute une recette aux favoris
 */
export const addFavorite = (userId, recipe) => {
  try {
    if (!userId || !recipe) {
      return { success: false, error: 'Données manquantes' }
    }
    
    // Vérifier si déjà en favoris
    if (isFavorite(userId, recipe.id || recipe.nom)) {
      return { success: false, error: 'Cette recette est déjà dans vos favoris' }
    }
    
    const allFavorites = localStorage.getItem(FAVORITES_KEY)
    const favorites = allFavorites ? JSON.parse(allFavorites) : []
    
    // Créer le favori
    const favorite = {
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      recipeId: recipe.id || recipe.nom,
      recipeName: recipe.nom,
      recipeType: recipe.type,
      calories: recipe.calories || recipe.nutrition?.calories,
      proteines: recipe.proteines || recipe.nutrition?.proteines,
      lipides: recipe.lipides || recipe.nutrition?.lipides,
      glucides: recipe.glucides || recipe.nutrition?.glucides,
      ingredients: recipe.ingredients,
      preparation: recipe.preparation,
      tags: recipe.tags || [],
      addedAt: new Date().toISOString(),
      notes: ''
    }
    
    favorites.push(favorite)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    
    // Mettre à jour les statistiques
    updateStats(userId, 'add', favorite.recipeType)
    
    console.log('✅ Favori ajouté:', favorite.recipeName)
    return { success: true, favorite }
  } catch (error) {
    console.error('❌ Erreur ajout favori:', error)
    return { success: false, error: 'Erreur lors de l\'ajout' }
  }
}

/**
 * Retire une recette des favoris
 */
export const removeFavorite = (userId, recipeId) => {
  try {
    const allFavorites = localStorage.getItem(FAVORITES_KEY)
    if (!allFavorites) return { success: false, error: 'Aucun favori' }
    
    let favorites = JSON.parse(allFavorites)
    const initialLength = favorites.length
    
    // Trouver et retirer le favori
    const favoriteToRemove = favorites.find(
      fav => fav.userId === userId && fav.recipeId === recipeId
    )
    
    if (!favoriteToRemove) {
      return { success: false, error: 'Favori non trouvé' }
    }
    
    favorites = favorites.filter(
      fav => !(fav.userId === userId && fav.recipeId === recipeId)
    )
    
    if (favorites.length === initialLength) {
      return { success: false, error: 'Impossible de retirer le favori' }
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    
    // Mettre à jour les statistiques
    updateStats(userId, 'remove', favoriteToRemove.recipeType)
    
    console.log('✅ Favori retiré:', recipeId)
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur retrait favori:', error)
    return { success: false, error: 'Erreur lors du retrait' }
  }
}

/**
 * Toggle favori (ajouter si pas présent, retirer si présent)
 */
export const toggleFavorite = (userId, recipe) => {
  const recipeId = recipe.id || recipe.nom
  if (isFavorite(userId, recipeId)) {
    return removeFavorite(userId, recipeId)
  } else {
    return addFavorite(userId, recipe)
  }
}

/**
 * Mettre à jour les notes d'un favori
 */
export const updateFavoriteNotes = (favoriteId, notes) => {
  try {
    const allFavorites = localStorage.getItem(FAVORITES_KEY)
    if (!allFavorites) return { success: false, error: 'Aucun favori' }
    
    const favorites = JSON.parse(allFavorites)
    const favorite = favorites.find(fav => fav.id === favoriteId)
    
    if (!favorite) {
      return { success: false, error: 'Favori non trouvé' }
    }
    
    favorite.notes = notes
    favorite.updatedAt = new Date().toISOString()
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    
    console.log('✅ Notes mises à jour:', favoriteId)
    return { success: true, favorite }
  } catch (error) {
    console.error('❌ Erreur mise à jour notes:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

// ========== Filtres et Tri ==========

/**
 * Filtre les favoris par type de repas
 */
export const filterByType = (favorites, type) => {
  if (!type || type === 'tous') return favorites
  return favorites.filter(fav => fav.recipeType === type)
}

/**
 * Recherche dans les favoris
 */
export const searchFavorites = (favorites, query) => {
  if (!query) return favorites
  
  const lowerQuery = query.toLowerCase()
  return favorites.filter(fav => 
    fav.recipeName.toLowerCase().includes(lowerQuery) ||
    fav.ingredients.some(ing => 
      (typeof ing === 'string' ? ing : ing.nom).toLowerCase().includes(lowerQuery)
    )
  )
}

/**
 * Trie les favoris
 */
export const sortFavorites = (favorites, sortBy) => {
  const sorted = [...favorites]
  
  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    
    case 'alpha':
      return sorted.sort((a, b) => a.recipeName.localeCompare(b.recipeName))
    
    case 'calories':
      return sorted.sort((a, b) => b.calories - a.calories)
    
    case 'proteines':
      return sorted.sort((a, b) => b.proteines - a.proteines)
    
    default:
      return sorted
  }
}

// ========== Statistiques ==========

/**
 * Récupère les statistiques des favoris
 */
export const getFavoritesStats = (userId) => {
  try {
    const favorites = getFavorites(userId)
    
    if (favorites.length === 0) {
      return {
        total: 0,
        byType: {
          petit_dejeuner: 0,
          dejeuner: 0,
          diner: 0
        },
        avgCalories: 0,
        mostRecent: null,
        topRecipe: null
      }
    }
    
    // Compter par type
    const byType = {
      petit_dejeuner: favorites.filter(f => f.recipeType === 'petit_dejeuner').length,
      dejeuner: favorites.filter(f => f.recipeType === 'dejeuner').length,
      diner: favorites.filter(f => f.recipeType === 'diner').length
    }
    
    // Calories moyennes
    const avgCalories = Math.round(
      favorites.reduce((sum, f) => sum + f.calories, 0) / favorites.length
    )
    
    // Plus récent
    const mostRecent = favorites.sort((a, b) => 
      new Date(b.addedAt) - new Date(a.addedAt)
    )[0]
    
    // Type favori
    const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0][0]
    
    return {
      total: favorites.length,
      byType,
      avgCalories,
      mostRecent,
      topType
    }
  } catch (error) {
    console.error('Erreur stats favoris:', error)
    return null
  }
}

/**
 * Met à jour les statistiques (interne)
 */
const updateStats = (userId, action, recipeType) => {
  try {
    const statsKey = `${FAVORITES_STATS_KEY}_${userId}`
    let stats = localStorage.getItem(statsKey)
    stats = stats ? JSON.parse(stats) : { adds: 0, removes: 0, byType: {} }
    
    if (action === 'add') {
      stats.adds = (stats.adds || 0) + 1
      stats.byType[recipeType] = (stats.byType[recipeType] || 0) + 1
    } else if (action === 'remove') {
      stats.removes = (stats.removes || 0) + 1
    }
    
    localStorage.setItem(statsKey, JSON.stringify(stats))
  } catch (error) {
    console.error('Erreur update stats:', error)
  }
}

// ========== Export/Import ==========

/**
 * Exporte les favoris en JSON
 */
export const exportFavorites = (userId) => {
  try {
    const favorites = getFavorites(userId)
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userId,
      favorites
    }
    
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `nutriweek_favoris_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    
    console.log('✅ Favoris exportés')
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur export favoris:', error)
    return { success: false, error: 'Erreur lors de l\'export' }
  }
}

/**
 * Importe des favoris depuis JSON
 */
export const importFavorites = (userId, jsonData) => {
  try {
    const data = JSON.parse(jsonData)
    
    if (!data.favorites || !Array.isArray(data.favorites)) {
      return { success: false, error: 'Format de fichier invalide' }
    }
    
    let imported = 0
    let skipped = 0
    
    data.favorites.forEach(fav => {
      // Réassigner l'userId
      fav.userId = userId
      fav.id = `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Vérifier si déjà présent
      if (!isFavorite(userId, fav.recipeId)) {
        const result = addFavorite(userId, {
          id: fav.recipeId,
          nom: fav.recipeName,
          type: fav.recipeType,
          calories: fav.calories,
          proteines: fav.proteines,
          lipides: fav.lipides,
          glucides: fav.glucides,
          ingredients: fav.ingredients,
          preparation: fav.preparation,
          tags: fav.tags
        })
        
        if (result.success) imported++
        else skipped++
      } else {
        skipped++
      }
    })
    
    console.log(`✅ Import terminé: ${imported} importés, ${skipped} ignorés`)
    return { success: true, imported, skipped }
  } catch (error) {
    console.error('❌ Erreur import favoris:', error)
    return { success: false, error: 'Erreur lors de l\'import' }
  }
}

// ========== Utilitaires ==========

/**
 * Nettoie les favoris orphelins (sans utilisateur)
 */
export const cleanupFavorites = () => {
  try {
    const allFavorites = localStorage.getItem(FAVORITES_KEY)
    if (!allFavorites) return { success: true, removed: 0 }
    
    const favorites = JSON.parse(allFavorites)
    const cleaned = favorites.filter(fav => fav.userId)
    
    const removed = favorites.length - cleaned.length
    
    if (removed > 0) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(cleaned))
      console.log(`✅ Nettoyage: ${removed} favoris orphelins supprimés`)
    }
    
    return { success: true, removed }
  } catch (error) {
    console.error('❌ Erreur nettoyage favoris:', error)
    return { success: false, error: 'Erreur lors du nettoyage' }
  }
}

/**
 * Compte le nombre total de favoris
 */
export const getTotalFavoritesCount = () => {
  try {
    const allFavorites = localStorage.getItem(FAVORITES_KEY)
    if (!allFavorites) return 0
    
    const favorites = JSON.parse(allFavorites)
    return favorites.length
  } catch (error) {
    console.error('Erreur comptage favoris:', error)
    return 0
  }
}
