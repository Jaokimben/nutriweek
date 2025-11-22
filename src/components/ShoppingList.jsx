import { useState } from 'react'
import { generateShoppingList, exportShoppingListText, getCategoryInfo } from '../utils/shoppingListGenerator'
import './ShoppingList.css'

const ShoppingList = ({ weeklyMenu, onClose }) => {
  const [shoppingList, setShoppingList] = useState(() => generateShoppingList(weeklyMenu))
  const [checkedItems, setCheckedItems] = useState(new Set())
  const [showCategories, setShowCategories] = useState({})

  if (!shoppingList) {
    return (
      <div className="shopping-list-modal">
        <div className="shopping-list-container">
          <button className="close-button" onClick={onClose}>✕</button>
          <p>❌ Impossible de générer la liste de courses</p>
        </div>
      </div>
    )
  }

  const handleCheckItem = (categoryKey, itemName) => {
    const key = `${categoryKey}-${itemName}`
    const newChecked = new Set(checkedItems)
    
    if (newChecked.has(key)) {
      newChecked.delete(key)
    } else {
      newChecked.add(key)
    }
    
    setCheckedItems(newChecked)
  }

  const toggleCategory = (categoryKey) => {
    setShowCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyText = () => {
    const text = exportShoppingListText(shoppingList)
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Liste copiée dans le presse-papier !')
    }).catch(() => {
      alert('❌ Impossible de copier la liste')
    })
  }

  const handleDownloadText = () => {
    const text = exportShoppingListText(shoppingList)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `liste-courses-${shoppingList.metadata.weekStart}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalChecked = checkedItems.size
  const totalItems = shoppingList.metadata.totalItems

  return (
    <div className="shopping-list-modal">
      <div className="shopping-list-container">
        <button className="close-button" onClick={onClose}>✕</button>
        
        <div className="shopping-list-header">
          <h2>🛒 Liste de Courses</h2>
          <p className="shopping-list-subtitle">
            📅 Semaine du {shoppingList.metadata.weekStart}
          </p>
          <div className="shopping-list-progress">
            <span className="progress-text">
              {totalChecked} / {totalItems} articles cochés
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(totalChecked / totalItems) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="shopping-list-actions">
          <button className="action-btn" onClick={handlePrint}>
            🖨️ Imprimer
          </button>
          <button className="action-btn" onClick={handleCopyText}>
            📋 Copier
          </button>
          <button className="action-btn" onClick={handleDownloadText}>
            📥 Télécharger
          </button>
        </div>

        <div className="shopping-list-content">
          {Object.entries(shoppingList.categories).map(([categoryKey, items]) => {
            const categoryInfo = getCategoryInfo(categoryKey)
            const isExpanded = showCategories[categoryKey] !== false // Ouvert par défaut
            const categoryChecked = items.filter(item => 
              checkedItems.has(`${categoryKey}-${item.name}`)
            ).length

            return (
              <div key={categoryKey} className="shopping-category">
                <div 
                  className="category-header"
                  onClick={() => toggleCategory(categoryKey)}
                >
                  <div className="category-title">
                    <span className="category-icon">{categoryInfo.icon}</span>
                    <span className="category-label">{categoryInfo.label}</span>
                    <span className="category-count">
                      ({categoryChecked}/{items.length})
                    </span>
                  </div>
                  <span className="category-toggle">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>

                {isExpanded && (
                  <div className="category-items">
                    {items.map((item, index) => {
                      const itemKey = `${categoryKey}-${item.name}`
                      const isChecked = checkedItems.has(itemKey)

                      return (
                        <div 
                          key={index} 
                          className={`shopping-item ${isChecked ? 'checked' : ''}`}
                          onClick={() => handleCheckItem(categoryKey, item.name)}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="item-checkbox"
                          />
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">{item.quantity}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="shopping-list-footer">
          <p className="footer-note">
            💡 <strong>Astuce :</strong> Cochez les articles au fur et à mesure de vos achats !
          </p>
          <button className="btn-close-footer" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShoppingList
