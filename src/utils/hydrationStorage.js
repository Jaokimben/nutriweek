/**
 * Gestion du stockage de l'hydratation avec LocalStorage
 * 
 * Structure de données:
 * - nutriweek_hydration: { [userId]: { [date]: { entries: [], total: 0, goal: 2000 } } }
 * - nutriweek_hydration_settings: { [userId]: { goal: 2000, reminders: true, reminderFrequency: 2 } }
 */

const HYDRATION_KEY = 'nutriweek_hydration'
const SETTINGS_KEY = 'nutriweek_hydration_settings'

/**
 * Obtenir la date du jour au format YYYY-MM-DD
 */
const getTodayKey = () => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Calculer l'objectif d'hydratation recommandé basé sur le poids
 * @param {number} poids - Poids en kg
 * @returns {number} Objectif en ml
 */
export const calculateWaterGoal = (poids) => {
  if (!poids || poids < 30 || poids > 200) {
    return 2000 // Valeur par défaut 2L
  }
  // Formule: poids (kg) × 33ml
  return Math.round(poids * 33)
}

/**
 * Obtenir les paramètres d'hydratation de l'utilisateur
 */
export const getHydrationSettings = () => {
  try {
    const allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    const userSettings = allSettings['current'] || {}
    
    return {
      goal: userSettings.goal || 2000,
      reminders: userSettings.reminders !== false, // true par défaut
      reminderFrequency: userSettings.reminderFrequency || 2, // toutes les 2h par défaut
      startHour: userSettings.startHour || 8,
      endHour: userSettings.endHour || 20
    }
  } catch (error) {
    console.error('Erreur chargement settings hydratation:', error)
    return {
      goal: 2000,
      reminders: true,
      reminderFrequency: 2,
      startHour: 8,
      endHour: 20
    }
  }
}

/**
 * Sauvegarder les paramètres d'hydratation
 */
export const saveHydrationSettings = (settings) => {
  try {
    const allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    
    allSettings['current'] = {
      goal: settings.goal || 2000,
      reminders: settings.reminders !== false,
      reminderFrequency: settings.reminderFrequency || 2,
      startHour: settings.startHour || 8,
      endHour: settings.endHour || 20,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(allSettings))
    
    console.log('✅ Paramètres hydratation sauvegardés:', allSettings['current'])
    return { success: true }
  } catch (error) {
    console.error('Erreur sauvegarde settings:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtenir les données d'hydratation du jour
 */
export const getTodayHydration = () => {
  try {
    const allHydration = JSON.parse(localStorage.getItem(HYDRATION_KEY) || '{}')
    const userData = allHydration['current'] || {}
    const today = getTodayKey()
    
    if (!userData[today]) {
      return {
        date: today,
        entries: [],
        total: 0,
        goal: getHydrationSettings().goal
      }
    }
    
    return userData[today]
  } catch (error) {
    console.error('Erreur chargement hydratation du jour:', error)
    return {
      date: getTodayKey(),
      entries: [],
      total: 0,
      goal: 2000
    }
  }
}

/**
 * Ajouter de l'eau consommée
 * @param {number} amount - Quantité en ml
 */
export const addWaterIntake = (amount) => {
  try {
    if (!amount || amount <= 0) {
      return { success: false, error: 'Quantité invalide' }
    }
    
    const allHydration = JSON.parse(localStorage.getItem(HYDRATION_KEY) || '{}')
    
    if (!allHydration['current']) {
      allHydration['current'] = {}
    }
    
    const today = getTodayKey()
    
    if (!allHydration['current'][today]) {
      allHydration['current'][today] = {
        date: today,
        entries: [],
        total: 0,
        goal: getHydrationSettings().goal
      }
    }
    
    const entry = {
      amount: amount,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
    
    allHydration['current'][today].entries.push(entry)
    allHydration['current'][today].total += amount
    
    localStorage.setItem(HYDRATION_KEY, JSON.stringify(allHydration))
    
    const newTotal = allHydration['current'][today].total
    const goal = allHydration['current'][today].goal
    const percentage = Math.round((newTotal / goal) * 100)
    
    console.log(`✅ Eau ajoutée: +${amount}ml → Total: ${newTotal}ml (${percentage}%)`)
    
    return {
      success: true,
      newTotal,
      percentage,
      goalReached: newTotal >= goal
    }
  } catch (error) {
    console.error('Erreur ajout eau:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Supprimer une entrée d'eau
 * @param {string} timestamp - Timestamp de l'entrée à supprimer
 */
export const removeWaterIntake = (timestamp) => {
  try {
    const allHydration = JSON.parse(localStorage.getItem(HYDRATION_KEY) || '{}')
    const today = getTodayKey()
    
    if (!allHydration['current'] || !allHydration['current'][today]) {
      return { success: false, error: 'Aucune donnée' }
    }
    
    const dayData = allHydration['current'][today]
    const entryIndex = dayData.entries.findIndex(e => e.timestamp === timestamp)
    
    if (entryIndex === -1) {
      return { success: false, error: 'Entrée non trouvée' }
    }
    
    const removedEntry = dayData.entries[entryIndex]
    dayData.entries.splice(entryIndex, 1)
    dayData.total -= removedEntry.amount
    
    localStorage.setItem(HYDRATION_KEY, JSON.stringify(allHydration))
    
    console.log(`✅ Entrée supprimée: -${removedEntry.amount}ml`)
    
    return {
      success: true,
      newTotal: dayData.total,
      percentage: Math.round((dayData.total / dayData.goal) * 100)
    }
  } catch (error) {
    console.error('Erreur suppression entrée:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtenir l'historique des 7 derniers jours
 */
export const getWeekHistory = () => {
  try {
    const allHydration = JSON.parse(localStorage.getItem(HYDRATION_KEY) || '{}')
    const userData = allHydration['current'] || {}
    
    const history = []
    const today = new Date()
    
    // Générer les 7 derniers jours
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      
      const dayData = userData[dateKey] || {
        date: dateKey,
        entries: [],
        total: 0,
        goal: getHydrationSettings().goal
      }
      
      history.push({
        date: dateKey,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        total: dayData.total,
        goal: dayData.goal,
        percentage: Math.round((dayData.total / dayData.goal) * 100),
        goalReached: dayData.total >= dayData.goal
      })
    }
    
    return history
  } catch (error) {
    console.error('Erreur chargement historique:', error)
    return []
  }
}

/**
 * Obtenir les statistiques de la semaine
 */
export const getWeekStats = () => {
  try {
    const history = getWeekHistory()
    
    if (history.length === 0) {
      return {
        average: 0,
        totalWeek: 0,
        daysGoalReached: 0,
        currentStreak: 0,
        bestDay: null
      }
    }
    
    const totalWeek = history.reduce((sum, day) => sum + day.total, 0)
    const average = Math.round(totalWeek / history.length)
    const daysGoalReached = history.filter(day => day.goalReached).length
    
    // Calculer le streak (jours consécutifs avec objectif atteint)
    let currentStreak = 0
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].goalReached) {
        currentStreak++
      } else {
        break
      }
    }
    
    // Trouver le meilleur jour
    const bestDay = history.reduce((best, day) => {
      if (!best || day.total > best.total) {
        return day
      }
      return best
    }, null)
    
    return {
      average,
      totalWeek,
      daysGoalReached,
      currentStreak,
      bestDay,
      percentageAverage: Math.round((average / getHydrationSettings().goal) * 100)
    }
  } catch (error) {
    console.error('Erreur calcul stats:', error)
    return {
      average: 0,
      totalWeek: 0,
      daysGoalReached: 0,
      currentStreak: 0,
      bestDay: null,
      percentageAverage: 0
    }
  }
}

/**
 * Réinitialiser les données (pour test ou nouvelle journée)
 */
export const resetToday = () => {
  try {
    const allHydration = JSON.parse(localStorage.getItem(HYDRATION_KEY) || '{}')
    const today = getTodayKey()
    
    if (allHydration['current'] && allHydration['current'][today]) {
      delete allHydration['current'][today]
      localStorage.setItem(HYDRATION_KEY, JSON.stringify(allHydration))
      console.log('✅ Données du jour réinitialisées')
    }
    
    return { success: true }
  } catch (error) {
    console.error('Erreur réinitialisation:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Nettoyer les anciennes données (> 30 jours)
 */
export const cleanOldData = () => {
  try {
    const allHydration = JSON.parse(localStorage.getItem(HYDRATION_KEY) || '{}')
    const userData = allHydration['current'] || {}
    
    const today = new Date()
    const cutoffDate = new Date(today)
    cutoffDate.setDate(cutoffDate.getDate() - 30)
    const cutoffKey = cutoffDate.toISOString().split('T')[0]
    
    let cleaned = 0
    
    Object.keys(userData).forEach(dateKey => {
      if (dateKey < cutoffKey) {
        delete userData[dateKey]
        cleaned++
      }
    })
    
    if (cleaned > 0) {
      allHydration['current'] = userData
      localStorage.setItem(HYDRATION_KEY, JSON.stringify(allHydration))
      console.log(`✅ ${cleaned} jours de données nettoyés`)
    }
    
    return { success: true, cleaned }
  } catch (error) {
    console.error('Erreur nettoyage:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Vérifier si c'est un nouveau jour et réinitialiser si nécessaire
 */
export const checkNewDay = () => {
  try {
    const lastCheck = localStorage.getItem('nutriweek_last_hydration_check')
    const today = getTodayKey()
    
    if (lastCheck !== today) {
      // Nouveau jour détecté
      localStorage.setItem('nutriweek_last_hydration_check', today)
      
      // Nettoyer les vieilles données
      cleanOldData()
      
      console.log('📅 Nouveau jour détecté:', today)
      return { newDay: true, date: today }
    }
    
    return { newDay: false, date: today }
  } catch (error) {
    console.error('Erreur vérification nouveau jour:', error)
    return { newDay: false, date: getTodayKey() }
  }
}
