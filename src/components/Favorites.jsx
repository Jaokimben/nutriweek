import { useState, useEffect } from 'react'
import { getCurrentUser } from '../utils/authService'
import {
  getFavorites,
  removeFavorite,
  filterByType,
  searchFavorites,
  sortFavorites,
  getFavoritesStats,
  exportFavorites
} from '../utils/favoritesStorage'
import './Favorites.css'

const Favorites = ({ onBack, onSelectRecipe }) => {
  const [user, setUser] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [filteredFavorites, setFilteredFavorites] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Filtres et tri
  const [typeFilter, setTypeFilter] = useState('tous')
  const [sortBy, setSortBy] = useState('date')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal pour détails
  const [selectedFavorite, setSelectedFavorite] = useState(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [favorites, typeFilter, sortBy, searchQuery])

  const loadFavorites = () => {
    try {
      setLoading(true)
      const currentUser = getCurrentUser()
      
      if (!currentUser) {
        setLoading(false)
        return
      }
      
      setUser(currentUser)
      
      const userFavorites = getFavorites(currentUser.id)
      setFavorites(userFavorites)
      
      const favStats = getFavoritesStats(currentUser.id)
      setStats(favStats)
      
      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement favoris:', error)
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let result = [...favorites]
    
    // Filtrer par type
    result = filterByType(result, typeFilter)
    
    // Recherche
    result = searchFavorites(result, searchQuery)
    
    // Trier
    result = sortFavorites(result, sortBy)
    
    setFilteredFavorites(result)
  }

  const handleRemoveFavorite = (recipeId) => {
    if (confirm('Retirer cette recette de vos favoris ?')) {
      const result = removeFavorite(user.id, recipeId)
      
      if (result.success) {
        loadFavorites()
        // Toast success
        showToast('Favori retiré avec succès', 'success')
      } else {
        showToast(result.error, 'error')
      }
    }
  }

  const handleExport = () => {
    const result = exportFavorites(user.id)
    if (result.success) {
      showToast('Favoris exportés avec succès', 'success')
    } else {
      showToast(result.error, 'error')
    }
  }

  const showToast = (message, type) => {
    // Simple toast (peut être amélioré)
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = message
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.classList.add('show')
    }, 100)
    
    setTimeout(() => {
      toast.classList.remove('show')
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  const getTypeLabel = (type) => {
    switch(type) {
      case 'petit_dejeuner': return '🌅 Petit-déjeuner'
      case 'dejeuner': return '☀️ Déjeuner'
      case 'diner': return '🌙 Dîner'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement de vos favoris...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="favorites-container">
        <div className="no-user-state">
          <div className="no-user-icon">👤</div>
          <h2>Non connecté</h2>
          <p>Vous devez être connecté pour accéder à vos favoris.</p>
          <button className="btn-login" onClick={onBack}>
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-container">
      {/* Header */}
      <div className="favorites-header">
        <button className="back-button" onClick={onBack}>
          ← Retour
        </button>
        <h1>⭐ Mes Favoris</h1>
      </div>

      {/* Statistiques */}
      {stats && stats.total > 0 && (
        <div className="stats-banner">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Favoris</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.byType.petit_dejeuner}</span>
            <span className="stat-label">Petit-déj</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.byType.dejeuner}</span>
            <span className="stat-label">Déjeuners</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.byType.diner}</span>
            <span className="stat-label">Dîners</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.avgCalories}</span>
            <span className="stat-label">kcal moy.</span>
          </div>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💔</div>
          <h2>Aucun favori</h2>
          <p>Vous n'avez pas encore ajouté de recettes à vos favoris.</p>
          <p>Cliquez sur le cœur ❤️ dans vos menus pour sauvegarder vos plats préférés !</p>
          <button className="btn-primary" onClick={onBack}>
            Découvrir des recettes
          </button>
        </div>
      ) : (
        <>
          {/* Filtres et recherche */}
          <div className="controls-section">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Rechercher une recette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filters-row">
              <div className="filter-group">
                <label>Type de repas :</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="tous">Tous</option>
                  <option value="petit_dejeuner">🌅 Petit-déjeuner</option>
                  <option value="dejeuner">☀️ Déjeuner</option>
                  <option value="diner">🌙 Dîner</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Trier par :</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date">Date (plus récent)</option>
                  <option value="alpha">Nom (A-Z)</option>
                  <option value="calories">Calories (décroissant)</option>
                  <option value="proteines">Protéines (décroissant)</option>
                </select>
              </div>

              <button className="btn-export" onClick={handleExport} title="Exporter en JSON">
                💾 Exporter
              </button>
            </div>
          </div>

          {/* Résultats */}
          <div className="results-info">
            {filteredFavorites.length} recette{filteredFavorites.length > 1 ? 's' : ''}
            {searchQuery && ` pour "${searchQuery}"`}
          </div>

          {/* Grille de favoris */}
          {filteredFavorites.length === 0 ? (
            <div className="no-results">
              <p>Aucune recette ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="favorites-grid">
              {filteredFavorites.map((favorite) => (
                <div key={favorite.id} className="favorite-card">
                  {/* Badge nouveau si < 7 jours */}
                  {isNew(favorite.addedAt) && (
                    <span className="badge-new">Nouveau</span>
                  )}
                  
                  <div className="card-header">
                    <h3>{favorite.recipeName}</h3>
                    <button
                      className="btn-remove-favorite"
                      onClick={() => handleRemoveFavorite(favorite.recipeId)}
                      title="Retirer des favoris"
                    >
                      💔
                    </button>
                  </div>

                  <span className="recipe-type">{getTypeLabel(favorite.recipeType)}</span>

                  <div className="recipe-macros">
                    <span className="macro">🔥 {favorite.calories} kcal</span>
                    <span className="macro">🌱 P: {favorite.proteines}g</span>
                    <span className="macro">🥑 L: {favorite.lipides}g</span>
                    <span className="macro">🍞 G: {favorite.glucides}g</span>
                  </div>

                  <div className="recipe-meta">
                    <span className="added-date">
                      Ajouté le {new Date(favorite.addedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <button
                    className="btn-view-details"
                    onClick={() => setSelectedFavorite(favorite)}
                  >
                    👁️ Voir les détails
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal détails */}
      {selectedFavorite && (
        <div className="modal-overlay" onClick={() => setSelectedFavorite(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedFavorite(null)}>
              ✕
            </button>

            <h2>{selectedFavorite.recipeName}</h2>
            <span className="recipe-type">{getTypeLabel(selectedFavorite.recipeType)}</span>

            <div className="modal-macros">
              <div className="macro-item">
                <span className="macro-icon">🔥</span>
                <span className="macro-value">{selectedFavorite.calories} kcal</span>
              </div>
              <div className="macro-item">
                <span className="macro-icon">🌱</span>
                <span className="macro-value">{selectedFavorite.proteines}g</span>
              </div>
              <div className="macro-item">
                <span className="macro-icon">🥑</span>
                <span className="macro-value">{selectedFavorite.lipides}g</span>
              </div>
              <div className="macro-item">
                <span className="macro-icon">🍞</span>
                <span className="macro-value">{selectedFavorite.glucides}g</span>
              </div>
            </div>

            <div className="modal-section">
              <h3>🥗 Ingrédients</h3>
              <ul className="ingredients-list">
                {selectedFavorite.ingredients.map((ing, index) => (
                  <li key={index}>
                    {typeof ing === 'object' 
                      ? `${ing.nom} - ${ing.quantite} ${ing.unite}`
                      : ing
                    }
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-section">
              <h3>👨‍🍳 Préparation</h3>
              <p>{selectedFavorite.preparation}</p>
            </div>

            {selectedFavorite.tags && selectedFavorite.tags.length > 0 && (
              <div className="modal-section">
                <h3>🏷️ Tags</h3>
                <div className="tags-list">
                  {selectedFavorite.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Utilitaire pour vérifier si un favori est nouveau (< 7 jours)
const isNew = (addedAt) => {
  const added = new Date(addedAt)
  const now = new Date()
  const diffDays = (now - added) / (1000 * 60 * 60 * 24)
  return diffDays < 7
}

export default Favorites
