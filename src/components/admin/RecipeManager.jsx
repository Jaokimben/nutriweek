import { useState } from 'react'

const RecipeManager = () => {
  const [selectedCategory, setSelectedCategory] = useState('legumineuses')
  const [searchTerm, setSearchTerm] = useState('')

  // Simuler le chargement des recettes (en production, charger depuis menuGenerator.js)
  const recipeCategories = {
    legumineuses: [
      { id: 1, nom: 'Salade de lentilles aux légumes', type: 'dejeuner', ingredients: 7 },
      { id: 2, nom: 'Curry de pois chiches', type: 'dejeuner', ingredients: 7 },
      { id: 3, nom: 'Soupe de lentilles corail', type: 'diner', ingredients: 6 }
    ],
    cereales: [
      { id: 4, nom: 'Riz complet aux légumes', type: 'dejeuner', ingredients: 8 },
      { id: 5, nom: 'Quinoa façon risotto', type: 'dejeuner', ingredients: 9 }
    ],
    petitDejeuner: [
      { id: 6, nom: 'Porridge aux fruits', type: 'petitDejeuner', ingredients: 5 },
      { id: 7, nom: 'Smoothie bowl', type: 'petitDejeuner', ingredients: 6 }
    ],
    diner: [
      { id: 8, nom: 'Velouté de légumes', type: 'diner', ingredients: 5 },
      { id: 9, nom: 'Salade composée', type: 'diner', ingredients: 7 }
    ]
  }

  const recipes = recipeCategories[selectedCategory] || []
  
  const filteredRecipes = recipes.filter(recipe =>
    recipe.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="recipe-manager">
      {/* Header avec actions */}
      <div className="manager-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Rechercher une recette..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-add">
          ➕ Ajouter une recette
        </button>
      </div>

      {/* Catégories */}
      <div className="category-tabs">
        <button
          className={`tab ${selectedCategory === 'legumineuses' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('legumineuses')}
        >
          🫘 Légumineuses ({recipeCategories.legumineuses.length})
        </button>
        <button
          className={`tab ${selectedCategory === 'cereales' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('cereales')}
        >
          🌾 Céréales ({recipeCategories.cereales.length})
        </button>
        <button
          className={`tab ${selectedCategory === 'petitDejeuner' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('petitDejeuner')}
        >
          🥐 Petit-déjeuner ({recipeCategories.petitDejeuner.length})
        </button>
        <button
          className={`tab ${selectedCategory === 'diner' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('diner')}
        >
          🌙 Dîner ({recipeCategories.diner.length})
        </button>
      </div>

      {/* Liste des recettes */}
      <div className="recipes-list">
        {filteredRecipes.length === 0 ? (
          <div className="empty-state">
            <p>Aucune recette trouvée</p>
          </div>
        ) : (
          filteredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-info">
                <h4>{recipe.nom}</h4>
                <div className="recipe-meta">
                  <span className="badge">{recipe.type}</span>
                  <span className="ingredient-count">{recipe.ingredients} ingrédients</span>
                </div>
              </div>
              <div className="recipe-actions">
                <button className="btn-icon" title="Éditer">
                  ✏️
                </button>
                <button className="btn-icon" title="Dupliquer">
                  📋
                </button>
                <button className="btn-icon danger" title="Supprimer">
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistiques */}
      <div className="recipe-stats">
        <div className="stat-box">
          <strong>{Object.values(recipeCategories).flat().length}</strong>
          <span>Recettes totales</span>
        </div>
        <div className="stat-box">
          <strong>{filteredRecipes.length}</strong>
          <span>Affichées</span>
        </div>
        <div className="stat-box">
          <strong>4</strong>
          <span>Catégories</span>
        </div>
      </div>

      {/* Note pour développement futur */}
      <div className="dev-note">
        <p><strong>💡 Note:</strong> Cette interface permettra dans le futur d'ajouter, modifier et supprimer des recettes directement depuis le backoffice.</p>
        <p>Les recettes sont actuellement stockées dans <code>src/utils/menuGenerator.js</code></p>
      </div>
    </div>
  )
}

export default RecipeManager
