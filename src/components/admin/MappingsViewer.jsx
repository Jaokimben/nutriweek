import { useState } from 'react'
import { NUTRITION_MAPPINGS, getAllMappedCiqualCodes } from '../../utils/nutritionMappings'

const MappingsViewer = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Convertir les mappings en array pour manipulation
  const mappingsArray = Object.entries(NUTRITION_MAPPINGS).map(([ingredient, code]) => ({
    ingredient,
    code
  }))

  // Catégoriser les mappings
  const categories = {
    all: 'Tous',
    herbs: 'Herbes & Épices',
    vegetables: 'Légumes',
    legumes: 'Légumineuses',
    cereals: 'Céréales',
    fruits: 'Fruits',
    meat: 'Viandes',
    fish: 'Poissons',
    dairy: 'Produits laitiers',
    other: 'Autres'
  }

  // Fonction pour détecter la catégorie
  const detectCategory = (ingredient) => {
    const ing = ingredient.toLowerCase()
    if (ing.includes('basilic') || ing.includes('persil') || ing.includes('thym') || ing.includes('herbes')) return 'herbs'
    if (ing.includes('tomate') || ing.includes('carotte') || ing.includes('courgette') || ing.includes('poivron')) return 'vegetables'
    if (ing.includes('lentille') || ing.includes('pois chiche') || ing.includes('haricot')) return 'legumes'
    if (ing.includes('riz') || ing.includes('quinoa') || ing.includes('avoine') || ing.includes('pâte')) return 'cereals'
    if (ing.includes('pomme') || ing.includes('banane') || ing.includes('orange') || ing.includes('citron')) return 'fruits'
    if (ing.includes('poulet') || ing.includes('boeuf') || ing.includes('porc') || ing.includes('veau')) return 'meat'
    if (ing.includes('saumon') || ing.includes('thon') || ing.includes('poisson') || ing.includes('crevette')) return 'fish'
    if (ing.includes('lait') || ing.includes('yaourt') || ing.includes('fromage') || ing.includes('crème')) return 'dairy'
    return 'other'
  }

  // Filtrer les mappings
  const filteredMappings = mappingsArray.filter(mapping => {
    const matchesSearch = mapping.ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mapping.code.includes(searchTerm)
    const matchesCategory = filterCategory === 'all' || detectCategory(mapping.ingredient) === filterCategory
    return matchesSearch && matchesCategory
  })

  // Statistiques
  const uniqueCodes = getAllMappedCiqualCodes()
  const stats = {
    total: mappingsArray.length,
    uniqueCodes: uniqueCodes.length,
    filtered: filteredMappings.length
  }

  return (
    <div className="mappings-viewer">
      {/* Header avec recherche et filtres */}
      <div className="viewer-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Rechercher un ingrédient ou code CIQUAL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              className={`filter-btn ${filterCategory === key ? 'active' : ''}`}
              onClick={() => setFilterCategory(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="mappings-stats">
        <div className="stat-badge">
          <span className="badge-label">Total mappings:</span>
          <span className="badge-value">{stats.total}</span>
        </div>
        <div className="stat-badge">
          <span className="badge-label">Codes CIQUAL uniques:</span>
          <span className="badge-value">{stats.uniqueCodes}</span>
        </div>
        <div className="stat-badge">
          <span className="badge-label">Affichés:</span>
          <span className="badge-value">{stats.filtered}</span>
        </div>
      </div>

      {/* Table des mappings */}
      <div className="mappings-table-container">
        <table className="mappings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ingrédient</th>
              <th>Code CIQUAL</th>
              <th>Catégorie</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMappings.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  Aucun mapping trouvé
                </td>
              </tr>
            ) : (
              filteredMappings.map((mapping, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="ingredient-cell">
                    <span className="ingredient-name">{mapping.ingredient}</span>
                  </td>
                  <td className="code-cell">
                    <code>{mapping.code}</code>
                  </td>
                  <td>
                    <span className={`category-badge ${detectCategory(mapping.ingredient)}`}>
                      {categories[detectCategory(mapping.ingredient)]}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon" title="Copier le code">
                      📋
                    </button>
                    <button className="btn-icon" title="Voir détails">
                      👁️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Export */}
      <div className="export-section">
        <button
          className="btn-export"
          onClick={() => {
            const csv = 'ingredient,code\n' + 
              filteredMappings.map(m => `${m.ingredient},${m.code}`).join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `mappings-${Date.now()}.csv`
            a.click()
          }}
        >
          📥 Exporter en CSV ({stats.filtered} mappings)
        </button>
        <button
          className="btn-export"
          onClick={() => {
            const json = JSON.stringify(
              Object.fromEntries(filteredMappings.map(m => [m.ingredient, m.code])),
              null,
              2
            )
            const blob = new Blob([json], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `mappings-${Date.now()}.json`
            a.click()
          }}
        >
          📥 Exporter en JSON
        </button>
      </div>
    </div>
  )
}

export default MappingsViewer
