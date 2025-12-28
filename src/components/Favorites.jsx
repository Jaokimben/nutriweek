import { useState, useEffect } from 'react'
import {
  getAllFavorites,
  removeFavorite,
  updateFavoriteNote,
  getFavoritesStats,
  exportFavorites,
  importFavorites
} from '../utils/favoritesStorage'
import { getCurrentUser } from '../utils/authService'
import './Favorites.css'

const Favorites = () => {
  const [favorites, setFavorites] = useState([])
  const [filteredFavorites, setFilteredFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState(null)
  const [showStats, setShowStats] = useState(true)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [noteText, setNoteText] = useState('')

  const user = getCurrentUser()

  useEffect(() => {
    loadFavorites()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [favorites, filterType, sortBy, searchQuery])

  const loadFavorites = async () => {
    setLoading(true)
    try {
      const favs = await getAllFavorites()
      const statistics = await getFavoritesStats()
      
      setFavorites(favs)
      setStats(statistics)
    } catch (error) {
      console.error('Erreur chargement favoris:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...favorites]

    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(fav => fav.recipe.type === filterType)
    }

    // Recherche par nom
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(fav =>
        fav.recipe.nom.toLowerCase().includes(query)
      )
    }

    // Tri
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        break
      case 'alpha':
        filtered.sort((a, b) => a.recipe.nom.localeCompare(b.recipe.nom))
        break
      case 'calories':
        filtered.sort((a, b) => a.recipe.calories - b.recipe.calories)
        break
      default:
        break
    }

    setFilteredFavorites(filtered)
  }

  const handleRemoveFavorite = async (recipeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce plat de vos favoris ?')) {
      const result = await removeFavorite(recipeId)
      if (result.success) {
        await loadFavorites()
      }
    }
  }

  const handleSaveNote = async (recipeId) => {
    const result = await updateFavoriteNote(recipeId, noteText)
    if (result.success) {
      await loadFavorites()
      setEditingNote(null)
      setNoteText('')
    }
  }

  const handleExport = async () => {
    const result = await exportFavorites()
    if (result.success) {
      alert('Favoris exportés avec succès !')
    } else {
      alert('Erreur lors de l\'export: ' + result.error)
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const result = await importFavorites(e.target.result)
        if (result.success) {
          alert(`${result.count} favoris importés avec succès !`)
          await loadFavorites()
        } else {
          alert('Erreur lors de l\'import: ' + result.error)
        }
      } catch (error) {
        alert('Fichier invalide')
      }
    }
    reader.readAsText(file)
  }

  const getMealTypeLabel = (type) => {
    const labels = {
      'petit-dejeuner': '🌅 Petit-déjeuner',
      'dejeuner': '☀️ Déjeuner',
      'diner': '🌙 Dîner'
    }
    return labels[type] || type
  }

  const isNew = (addedAt) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(addedAt) > weekAgo
  }

  if (!user) {
    return (
      <div className="favorites-container">
        <div className="no-user-message">
          <h2>❤️ Mes Favoris</h2>
          <p>Vous devez être connecté pour accéder à vos favoris.</p>
          <p>Créez un compte ou connectez-vous pour sauvegarder vos plats préférés !</p>
        </div>
      </div>
    )
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

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>❤️ Mes Favoris</h1>
        <p className="favorites-count">{favorites.length} plat{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}</p>
      </div>

      {/* Statistiques */}
      {stats && stats.total > 0 && (
        <div className="favorites-stats">
          <button 
            className="stats-toggle"
            onClick={() => setShowStats(!showStats)}
          >
            📊 Statistiques {showStats ? '▼' : '▶'}
          </button>
          
          {showStats && (
            <div className="stats-content">
              <div className="stat-item">
                <span className="stat-label">Total de favoris:</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Calories moyennes:</span>
                <span className="stat-value">{stats.averageCalories} kcal</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Par type:</span>
                <div className="stat-breakdown">
                  <span>🌅 {stats.byType['petit-dejeuner']}</span>
                  <span>☀️ {stats.byType['dejeuner']}</span>
                  <span>🌙 {stats.byType['diner']}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contrôles */}
      <div className="favorites-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Rechercher un plat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${filterType === 'petit-dejeuner' ? 'active' : ''}`}
            onClick={() => setFilterType('petit-dejeuner')}
          >
            🌅 Petit-déj
          </button>
          <button
            className={`filter-btn ${filterType === 'dejeuner' ? 'active' : ''}`}
            onClick={() => setFilterType('dejeuner')}
          >
            ☀️ Déjeuner
          </button>
          <button
            className={`filter-btn ${filterType === 'diner' ? 'active' : ''}`}
            onClick={() => setFilterType('diner')}
          >
            🌙 Dîner
          </button>
        </div>

        <div className="sort-controls">
          <label>Trier par:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date d'ajout</option>
            <option value="alpha">Nom (A-Z)</option>
            <option value="calories">Calories</option>
          </select>
        </div>

        <div className="export-controls">
          <button className="btn-export" onClick={handleExport}>
            📥 Exporter
          </button>
          <label className="btn-import">
            📤 Importer
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Liste des favoris */}
      {filteredFavorites.length === 0 ? (
        <div className="empty-state">
          {searchQuery || filterType !== 'all' ? (
            <p>Aucun favori ne correspond à vos critères de recherche.</p>
          ) : (
            <>
              <p>Vous n'avez pas encore de favoris.</p>
              <p>Ajoutez vos plats préférés en cliquant sur le cœur 🤍 dans vos menus !</p>
            </>
          )}
        </div>
      ) : (
        <div className="favorites-grid">
          {filteredFavorites.map((fav) => (
            <div key={fav.id} className="favorite-card">
              {isNew(fav.addedAt) && <span className="badge-new">Nouveau ✨</span>}
              
              <div className="favorite-header">
                <h3>{fav.recipe.nom}</h3>
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveFavorite(fav.id)}
                  title="Retirer des favoris"
                >
                  ❌
                </button>
              </div>

              <div className="favorite-type">{getMealTypeLabel(fav.recipe.type)}</div>
              
              <div className="favorite-calories">
                {fav.recipe.calories} kcal
              </div>

              <div className="favorite-macros">
                <span>🌱 P: {fav.recipe.proteines}g</span>
                <span>🥑 L: {fav.recipe.lipides}g</span>
                <span>🍞 G: {fav.recipe.glucides}g</span>
              </div>

              {fav.notes && (
                <div className="favorite-notes">
                  <strong>📝 Note:</strong> {fav.notes}
                </div>
              )}

              <div className="favorite-date">
                Ajouté le {new Date(fav.addedAt).toLocaleDateString('fr-FR')}
              </div>

              <div className="favorite-actions">
                <button
                  className="btn-view"
                  onClick={() => setSelectedMeal(fav)}
                >
                  👁️ Voir détails
                </button>
                <button
                  className="btn-note"
                  onClick={() => {
                    setEditingNote(fav.id)
                    setNoteText(fav.notes || '')
                  }}
                >
                  ✏️ Ajouter note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal détails */}
      {selectedMeal && (
        <div className="modal-overlay" onClick={() => setSelectedMeal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMeal(null)}>✕</button>
            
            <h2>{selectedMeal.recipe.nom}</h2>
            <div className="modal-type">{getMealTypeLabel(selectedMeal.recipe.type)}</div>
            <div className="modal-calories">{selectedMeal.recipe.calories} kcal</div>
            
            <div className="modal-macros">
              <span>🌱 Protéines: {selectedMeal.recipe.proteines}g</span>
              <span>🥑 Lipides: {selectedMeal.recipe.lipides}g</span>
              <span>🍞 Glucides: {selectedMeal.recipe.glucides}g</span>
            </div>

            <div className="modal-section">
              <h3>🥗 Ingrédients</h3>
              <ul>
                {selectedMeal.recipe.ingredients.map((ing, idx) => (
                  <li key={idx}>
                    {typeof ing === 'string' 
                      ? ing 
                      : `${ing.nom}: ${ing.quantite}${ing.unite}`}
                  </li>
                ))}
              </ul>
            </div>

            {selectedMeal.recipe.preparation && (
              <div className="modal-section">
                <h3>👨‍🍳 Préparation</h3>
                <p>{selectedMeal.recipe.preparation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal note */}
      {editingNote && (
        <div className="modal-overlay" onClick={() => setEditingNote(null)}>
          <div className="modal-content modal-note" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditingNote(null)}>✕</button>
            
            <h3>📝 Ajouter une note</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Vos commentaires, adaptations, etc."
              maxLength={200}
              rows={5}
            />
            <div className="note-char-count">{noteText.length}/200</div>
            
            <div className="modal-actions">
              <button 
                className="btn-save"
                onClick={() => handleSaveNote(editingNote)}
              >
                💾 Enregistrer
              </button>
              <button 
                className="btn-cancel"
                onClick={() => setEditingNote(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Favorites
