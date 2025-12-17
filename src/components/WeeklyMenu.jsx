import { useState, useEffect } from 'react'
import { generateWeeklyMenu, regenerateSingleMeal } from '../utils/menuGenerator'
import { genererMenuHebdomadaire, regenererRepas } from '../utils/menuGeneratorStrict'
import { calculateIMC, calculateCalories } from '../utils/nutritionCalculator'
import { loadCIQUAL } from '../utils/ciqualParser'
import { loadAlimentsSimple } from '../utils/alimentsSimpleParser'
import { saveMenu } from '../utils/storage'
import ShoppingList from './ShoppingList'
import './WeeklyMenu.css'

// Fonction pour transformer le format du menu strict vers le format d'affichage
function transformerMenuPourAffichage(menuData) {
  const { menu, metadata } = menuData
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  
  const semaine = jours.map((jour, index) => {
    const jourData = menu[jour]
    const date = new Date()
    date.setDate(date.getDate() + index)
    
    return {
      jour,
      date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
      jeune: false,
      menu: {
        petitDejeuner: transformerRepasPourAffichage(jourData.repas.find(r => r.type === 'petit_dejeuner')),
        dejeuner: transformerRepasPourAffichage(jourData.repas.find(r => r.type === 'dejeuner')),
        diner: transformerRepasPourAffichage(jourData.repas.find(r => r.type === 'diner'))
      },
      totaux: jourData.totaux
    }
  })
  
  return {
    semaine,
    nutritionNeeds: {
      bmr: metadata.besoins.bmr,
      tdee: metadata.besoins.tdee,
      dailyCalories: metadata.besoins.caloriesJournalieres,
      macros: {
        proteines: Math.round(metadata.besoins.caloriesJournalieres * 0.25 / 4),
        lipides: Math.round(metadata.besoins.caloriesJournalieres * 0.30 / 9),
        glucides: Math.round(metadata.besoins.caloriesJournalieres * 0.45 / 4)
      },
      macroRatio: {
        proteines: 25,
        lipides: 30,
        glucides: 45
      }
    },
    conseils: [
      '🥗 Tous les aliments utilisés proviennent de votre liste autorisée',
      '💧 N\'oubliez pas de boire 1,5 à 2L d\'eau par jour',
      '🏃 Combinez votre alimentation avec une activité physique régulière',
      '😴 Privilégiez un sommeil de qualité (7-8h par nuit)'
    ],
    rawMenu: menu, // Garder le menu brut pour les régénérations
    metadata
  }
}

function transformerRepasPourAffichage(repas) {
  if (!repas) return null
  
  const momentLabels = {
    'petit_dejeuner': '🌅 Petit-déjeuner',
    'dejeuner': '☀️ Déjeuner',
    'diner': '🌙 Dîner'
  }
  
  return {
    nom: repas.nom,
    moment: momentLabels[repas.type] || repas.type,
    calories: repas.nutrition.calories,
    proteines: repas.nutrition.proteines,
    glucides: repas.nutrition.glucides,
    lipides: repas.nutrition.lipides,
    ingredients: repas.ingredients,
    preparation: repas.preparation,
    tags: repas.tags || []
  }
}

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

    // Générer le menu avec le système strict (aliments autorisés uniquement)
    const loadAndGenerateMenu = async () => {
      try {
        console.log('🎯 Génération du menu avec ALIMENTS AUTORISÉS uniquement...')
        
        // Utiliser le générateur strict qui utilise uniquement les aliments autorisés de l'Excel
        const menuData = await genererMenuHebdomadaire(userProfile)
        
        console.log('📊 [WeeklyMenu] Menu strict généré:', menuData)
        
        // Transformer le format pour être compatible avec l'interface
        const formattedMenu = transformerMenuPourAffichage(menuData)
        
        setWeeklyMenu(formattedMenu)
        console.log('✅ [WeeklyMenu] Menu sauvegardé')
        
        // Sauvegarder automatiquement
        saveMenu(formattedMenu, userProfile)
        
        // Notifier le parent
        if (onMenuGenerated) {
          onMenuGenerated(formattedMenu)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ Erreur lors de la génération du menu strict:', error)
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
      console.log(`🔄 Régénération du repas avec ALIMENTS AUTORISÉS: Jour ${dayIndex}, Type ${mealType}`)
      
      // Marquer le repas en cours de régénération
      setRegeneratingMeal({ dayIndex, mealType })
      
      // Obtenir le jour correspondant
      const jourNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
      const jourName = jourNames[dayIndex]
      
      // Utiliser le générateur strict pour régénérer le repas
      const menuActuel = weeklyMenu.rawMenu // Menu brut du générateur
      const newMeal = await regenererRepas(jourName, mealType, menuActuel, userProfile)
      
      console.log('✅ Nouveau repas généré:', newMeal)
      
      // Transformer le repas pour l'affichage
      const formattedMeal = transformerRepasPourAffichage(newMeal)
      
      // Mettre à jour le menu
      const updatedMenu = { ...weeklyMenu }
      updatedMenu.semaine[dayIndex].menu[mealType] = formattedMeal
      
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
            title="Proposez-moi autre chose"
          >
            {isRegenerating ? '⏳ Recherche...' : '🔄 Autre proposition'}
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
