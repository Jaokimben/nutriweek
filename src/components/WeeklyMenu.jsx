import { useState, useEffect } from 'react'
import { generateWeeklyMenu, regenerateSingleMeal } from '../utils/menuGenerator'
import { calculateIMC, calculateCalories } from '../utils/nutritionCalculator'
import { loadCIQUAL } from '../utils/ciqualParser'
import { loadAlimentsSimple } from '../utils/alimentsSimpleParser'
import { saveMenu } from '../utils/storage'
import ShoppingList from './ShoppingList'
import './WeeklyMenu.css'

const WeeklyMenu = ({ userProfile, initialMenu = null, onMenuGenerated, onBack }) => {
  const [weeklyMenu, setWeeklyMenu] = useState(initialMenu)
  const [loading, setLoading] = useState(!initialMenu)
  const [selectedDay, setSelectedDay] = useState(0)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [regeneratingMeal, setRegeneratingMeal] = useState(null)
  const [alimentsSimple, setAlimentsSimple] = useState(null)
  const [ciqualData, setCiqualData] = useState(null)

  useEffect(() => {
    // Si on a déjà un menu initial, ne pas générer
    if (initialMenu) {
      return
    }

    // Charger la base simplifiée (prioritaire) et CIQUAL (backup)
    const loadAndGenerateMenu = async () => {
      try {
        console.log('🔍 Chargement des bases nutritionnelles...')
        
        // Charger la base simplifiée en priorité
        const alimentsSimpleData = await loadAlimentsSimple()
        console.log(`✅ Base simplifiée: ${alimentsSimpleData?.length || 0} aliments`)
        setAlimentsSimple(alimentsSimpleData)
        
        // Charger CIQUAL en backup
        let ciqualDataLoaded = null
        try {
          ciqualDataLoaded = await loadCIQUAL()
          console.log(`✅ CIQUAL (backup): ${Object.keys(ciqualDataLoaded || {}).length} aliments`)
          setCiqualData(ciqualDataLoaded)
        } catch (e) {
          console.warn('⚠️ CIQUAL non disponible, utilisation uniquement base simplifiée')
        }
        
        // Générer le menu avec la base simplifiée en priorité
        console.log('🎯 [WeeklyMenu] Appel generateWeeklyMenu...')
        const menu = await generateWeeklyMenu(userProfile, alimentsSimpleData, ciqualDataLoaded)
        console.log('📊 [WeeklyMenu] Menu généré reçu:', menu)
        console.log('📊 [WeeklyMenu] Premier jour du menu:', menu.semaine[0])
        setWeeklyMenu(menu)
        console.log('✅ [WeeklyMenu] setWeeklyMenu appelé')
        
        // Sauvegarder automatiquement
        saveMenu(menu, userProfile)
        
        // Notifier le parent
        if (onMenuGenerated) {
          onMenuGenerated(menu)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ Erreur lors du chargement:', error)
        // Générer quand même le menu sans bases
        const menu = await generateWeeklyMenu(userProfile, null, null)
        setWeeklyMenu(menu)
        saveMenu(menu, userProfile)
        setLoading(false)
      }
    }
    
    loadAndGenerateMenu()
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

  // Handler pour régénérer un repas
  const handleRegenerateMeal = async (dayIndex, mealType) => {
    try {
      console.log(`🔄 Régénération du repas: Jour ${dayIndex}, Type ${mealType}`)
      
      // Marquer le repas en cours de régénération
      setRegeneratingMeal({ dayIndex, mealType })
      
      // Calculer les besoins nutritionnels
      const nutritionNeeds = calculateCalories(userProfile)
      
      // Collecter toutes les recettes utilisées dans la semaine pour éviter les doublons
      const excludedRecipes = []
      weeklyMenu.semaine.forEach(day => {
        if (day.menu.petitDejeuner) excludedRecipes.push(day.menu.petitDejeuner.nom)
        if (day.menu.dejeuner) excludedRecipes.push(day.menu.dejeuner.nom)
        if (day.menu.diner) excludedRecipes.push(day.menu.diner.nom)
      })
      
      // Générer un nouveau repas
      const newMeal = await regenerateSingleMeal(
        mealType,
        userProfile,
        alimentsSimple,
        ciqualData,
        nutritionNeeds,
        excludedRecipes
      )
      
      // Mettre à jour le menu
      const updatedMenu = { ...weeklyMenu }
      updatedMenu.semaine[dayIndex].menu[mealType] = newMeal
      
      setWeeklyMenu(updatedMenu)
      saveMenu(updatedMenu, userProfile)
      
      console.log('✅ Repas régénéré avec succès')
    } catch (error) {
      console.error('❌ Erreur régénération repas:', error)
      alert('Erreur lors de la régénération du repas')
    } finally {
      setRegeneratingMeal(null)
    }
  }

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
          <p><strong>Métabolisme de base (BMR):</strong> {weeklyMenu.nutritionNeeds.bmr || 'N/A'} kcal/jour</p>
          <p><strong>Dépense totale (TDEE):</strong> {weeklyMenu.nutritionNeeds.tdee || 'N/A'} kcal/jour</p>
          <p><strong>🎯 Objectif calorique:</strong> {weeklyMenu.nutritionNeeds.dailyCalories} kcal/jour</p>
          <p className="macro-info">
            <strong>Macros:</strong> P: {weeklyMenu.nutritionNeeds.macros.proteines}g | 
            L: {weeklyMenu.nutritionNeeds.macros.lipides}g | 
            G: {weeklyMenu.nutritionNeeds.macros.glucides}g
          </p>
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
            <MealCard 
              meal={currentDayMenu.menu.petitDejeuner}
              onRegenerate={() => handleRegenerateMeal(selectedDay, 'petitDejeuner')}
              isRegenerating={regeneratingMeal?.dayIndex === selectedDay && regeneratingMeal?.mealType === 'petitDejeuner'}
            />
          )}
          
          {currentDayMenu.menu.dejeuner && (
            <MealCard 
              meal={currentDayMenu.menu.dejeuner}
              onRegenerate={() => handleRegenerateMeal(selectedDay, 'dejeuner')}
              isRegenerating={regeneratingMeal?.dayIndex === selectedDay && regeneratingMeal?.mealType === 'dejeuner'}
            />
          )}
          
          {currentDayMenu.menu.diner && (
            <MealCard 
              meal={currentDayMenu.menu.diner}
              onRegenerate={() => handleRegenerateMeal(selectedDay, 'diner')}
              isRegenerating={regeneratingMeal?.dayIndex === selectedDay && regeneratingMeal?.mealType === 'diner'}
            />
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
        <button className="btn-action btn-shopping" onClick={() => setShowShoppingList(true)}>
          🛒 Liste de courses
        </button>
        <button className="btn-action btn-print" onClick={() => window.print()}>
          🖨️ Imprimer le menu
        </button>
        <button className="btn-action btn-share" onClick={() => shareMenu()}>
          📤 Partager
        </button>
      </div>

      {/* Shopping List Modal */}
      {showShoppingList && (
        <ShoppingList 
          weeklyMenu={weeklyMenu}
          onClose={() => setShowShoppingList(false)}
        />
      )}
    </div>
  )
}

const MealCard = ({ meal, onRegenerate, isRegenerating }) => {
  const [showDetails, setShowDetails] = useState(false)
  
  // DEBUG: Log ce que reçoit MealCard
  console.log('🍽️ [MealCard] Rendu pour:', meal.nom)
  console.log('📊 [MealCard] Valeurs nutrition:', {
    calories: meal.calories,
    proteines: meal.proteines,
    lipides: meal.lipides,
    glucides: meal.glucides
  })
  console.log('🔍 [MealCard] Objet meal complet:', meal)

  return (
    <div className="meal-card">
      <div className="meal-header">
        <div>
          <h4>{meal.nom}</h4>
          <span className="meal-calories">{meal.calories} kcal</span>
        </div>
        {onRegenerate && (
          <button 
            className="btn-regenerate"
            onClick={onRegenerate}
            disabled={isRegenerating}
            title="Changer ce repas"
          >
            {isRegenerating ? '⏳' : '🔄'}
          </button>
        )}
      </div>
      <p className="meal-moment">{meal.moment}</p>
      
      {/* Affichage des macronutriments */}
      {meal.proteines !== undefined && (
        <div className="meal-macros">
          <span className="macro-item">🥩 P: {meal.proteines}g</span>
          <span className="macro-item">🥑 L: {meal.lipides}g</span>
          <span className="macro-item">🍞 G: {meal.glucides}g</span>
        </div>
      )}
      
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
                <li key={index}>
                  {typeof ing === 'object' ? (
                    <>
                      <span className="ingredient-name">{ing.nom}</span>
                      <span className="ingredient-quantity"> - {ing.quantite} {ing.unite}</span>
                    </>
                  ) : (
                    ing
                  )}
                </li>
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
