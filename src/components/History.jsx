import { useState, useEffect } from 'react'
import { getUserMenus } from '../utils/authService'
import { formatSavedDate } from '../utils/storage'
import './History.css'

const History = ({ onLoadMenu }) => {
  const [menus, setMenus] = useState([])

  useEffect(() => {
    loadMenus()
  }, [])

  const loadMenus = () => {
    const userMenus = getUserMenus()
    setMenus(userMenus)
  }

  const handleLoadMenu = (menuData) => {
    if (confirm('Charger ce menu ? Cela remplacera le menu actuel.')) {
      onLoadMenu(menuData.menu)
    }
  }

  if (menus.length === 0) {
    return (
      <div className="history-container">
        <div className="history-header">
          <h1>📚 Historique des Menus</h1>
        </div>
        <div className="empty-history">
          <span className="empty-icon">📭</span>
          <h3>Aucun menu dans l'historique</h3>
          <p>Générez votre premier menu personnalisé pour commencer votre historique.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>📚 Historique des Menus</h1>
        <p className="history-subtitle">
          {menus.length} menu{menus.length > 1 ? 's' : ''} sauvegardé{menus.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="history-list">
        {menus.map((menuData, index) => (
          <div key={menuData.id} className="history-item">
            <div className="history-item-header">
              <div className="history-number">#{index + 1}</div>
              <div className="history-date">
                {formatSavedDate(menuData.savedAt)}
              </div>
            </div>
            
            <div className="history-preview">
              <h3>Menu de la semaine</h3>
              <div className="menu-days-preview">
                {menuData.menu?.semaine?.slice(0, 3).map((day, i) => (
                  <div key={i} className="day-preview">
                    <span className="day-name">{day.jour}</span>
                    <span className="meals-count">
                      {day.menu.petitDejeuner ? '🥐' : ''}
                      {day.menu.dejeuner ? '🍽️' : ''}
                      {day.menu.diner ? '🌙' : ''}
                    </span>
                  </div>
                ))}
                {menuData.menu?.semaine?.length > 3 && (
                  <div className="day-preview more">
                    +{menuData.menu.semaine.length - 3} jours
                  </div>
                )}
              </div>
            </div>

            <div className="history-actions">
              <button 
                className="btn-load"
                onClick={() => handleLoadMenu(menuData)}
              >
                📥 Charger ce menu
              </button>
              <button className="btn-details">
                👁️ Voir détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default History
