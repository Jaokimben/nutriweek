import { useState, useEffect } from 'react'
import { generateWeeklyMenu, parseAlimentsCSV } from '../utils/menuGenerator'
import { calculateIMC } from '../utils/nutritionCalculator'
import './WeeklyMenu.css'

const WeeklyMenu = ({ userProfile, onBack }) => {
  const [weeklyMenu, setWeeklyMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(0)
  const [aliments, setAliments] = useState([])

  useEffect(() => {
    // Charger les aliments depuis le CSV
    fetch('/aliments.csv')
      .then(response => response.text())
      .then(csvText => {
        const parsedAliments = parseAlimentsCSV(csvText)
        setAliments(parsedAliments)
        
        // Générer le menu hebdomadaire
        const menu = generateWeeklyMenu(userProfile, parsedAliments)
        setWeeklyMenu(menu)
        setLoading(false)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des aliments:', error)
        // Générer quand même le menu avec une base vide
        const menu = generateWeeklyMenu(userProfile, [])
        setWeeklyMenu(menu)
        setLoading(false)
      })
  }, [userProfile])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Génération de votre menu personnalisé...</p>
      </div>
    )
  }

  const imc = calculateIMC(userProfile.poids, userProfile.taille)
  const currentDayMenu = weeklyMenu.semaine[selectedDay]

  return (
    <div className="weekly-menu">
      <div className="menu-header">
        <button className="back-button" onClick={onBack}>
          ← Retour
        </button>
        <h1>📅 Votre Menu Hebdomadaire</h1>
        <div className="profile-summary">
          <p><strong>Objectif:</strong> {getObjectifLabel(userProfile.objectif)}</p>
          <p><strong>IMC:</strong> {imc.imc} ({imc.categorie})</p>
          <p><strong>Calories/jour:</strong> {weeklyMenu.nutritionNeeds.dailyCalories} kcal</p>
        </div>
      </div>

      {/* Navigation des jours */}
      <div className="days-navigation">
        {weeklyMenu.semaine.map((day, index) => (
          <button
            key={index}
            className={`day-button ${selectedDay === index ? 'active' : ''} ${day.jeune ? 'jeune-day' : ''}`}
            onClick={() => setSelectedDay(index)}
          >
            <span className="day-name">{day.jour.substring(0, 3)}</span>
            <span className="day-date">{day.date.split(' ')[0]}</span>
            {day.jeune && <span className="jeune-badge">🌙</span>}
          </button>
        ))}
      </div>

      {/* Menu du jour sélectionné */}
      <div className="day-menu fade-in">
        <h2>{currentDayMenu.jour} - {currentDayMenu.date}</h2>
        
        {currentDayMenu.jeune && (
          <div className="jeune-alert">
            <h3>{currentDayMenu.menu.jeune.type}</h3>
            <p>{currentDayMenu.menu.jeune.message}</p>
            <p className="conseil-jeune">💡 {currentDayMenu.menu.jeune.conseil}</p>
          </div>
        )}

        <div className="meals-container">
          {currentDayMenu.menu.petitDejeuner && (
            <MealCard meal={currentDayMenu.menu.petitDejeuner} />
          )}
          
          {currentDayMenu.menu.dejeuner && (
            <MealCard meal={currentDayMenu.menu.dejeuner} />
          )}
          
          {currentDayMenu.menu.diner && (
            <MealCard meal={currentDayMenu.menu.diner} />
          )}
        </div>
      </div>

      {/* Macronutriments */}
      <div className="macros-section">
        <h3>📊 Vos Macronutriments</h3>
        <div className="macros-grid">
          <div className="macro-card">
            <span className="macro-icon">🥩</span>
            <span className="macro-label">Protéines</span>
            <span className="macro-value">{weeklyMenu.nutritionNeeds.macros.proteines}g</span>
            <span className="macro-percent">{weeklyMenu.nutritionNeeds.macroRatio.proteines}%</span>
          </div>
          <div className="macro-card">
            <span className="macro-icon">🥑</span>
            <span className="macro-label">Lipides</span>
            <span className="macro-value">{weeklyMenu.nutritionNeeds.macros.lipides}g</span>
            <span className="macro-percent">{weeklyMenu.nutritionNeeds.macroRatio.lipides}%</span>
          </div>
          <div className="macro-card">
            <span className="macro-icon">🍞</span>
            <span className="macro-label">Glucides</span>
            <span className="macro-value">{weeklyMenu.nutritionNeeds.macros.glucides}g</span>
            <span className="macro-percent">{weeklyMenu.nutritionNeeds.macroRatio.glucides}%</span>
          </div>
        </div>
      </div>

      {/* Conseils */}
      <div className="tips-section">
        <h3>💡 Conseils Personnalisés</h3>
        <div className="tips-list">
          {weeklyMenu.conseils.map((tip, index) => (
            <div key={index} className="tip-card">
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="actions-section">
        <button className="btn-action btn-print" onClick={() => window.print()}>
          🖨️ Imprimer le menu
        </button>
        <button className="btn-action btn-share" onClick={() => shareMenu()}>
          📤 Partager
        </button>
      </div>
    </div>
  )
}

const MealCard = ({ meal }) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="meal-card">
      <div className="meal-header">
        <h4>{meal.nom}</h4>
        <span className="meal-calories">{meal.calories} kcal</span>
      </div>
      <p className="meal-moment">{meal.moment}</p>
      
      {meal.note && (
        <p className="meal-note">💬 {meal.note}</p>
      )}

      <button 
        className="toggle-details"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? '▼ Masquer les détails' : '▶ Voir les détails'}
      </button>

      {showDetails && (
        <div className="meal-details">
          <div className="ingredients-section">
            <h5>🥗 Ingrédients:</h5>
            <ul>
              {meal.ingredients.map((ing, index) => (
                <li key={index}>{ing}</li>
              ))}
            </ul>
          </div>
          <div className="preparation-section">
            <h5>👨‍🍳 Préparation:</h5>
            <p>{meal.preparation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const getObjectifLabel = (objectif) => {
  switch(objectif) {
    case 'perte': return '🎯 Perte de poids'
    case 'confort': return '💚 Confort digestif'
    case 'vitalite': return '⚡ Vitalité'
    default: return objectif
  }
}

const shareMenu = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Mon Menu Personnalisé',
      text: 'Découvrez mon menu hebdomadaire personnalisé !',
      url: window.location.href
    })
  } else {
    alert('📋 Copiez le lien pour partager: ' + window.location.href)
  }
}

export default WeeklyMenu
