import { useState, useEffect } from 'react'
import {
  getTodayHydration,
  addWaterIntake,
  removeWaterIntake,
  getHydrationSettings,
  saveHydrationSettings,
  getWeekHistory,
  getWeekStats,
  calculateWaterGoal,
  checkNewDay
} from '../utils/hydrationStorage'
import { getCurrentUser } from '../utils/authService'
import './HydrationTracker.css'

const HydrationTracker = () => {
  const [hydration, setHydration] = useState(null)
  const [settings, setSettings] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [weekHistory, setWeekHistory] = useState([])
  const [weekStats, setWeekStats] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [editGoal, setEditGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')

  const user = getCurrentUser()

  useEffect(() => {
    loadData()
    // Vérifier nouveau jour
    checkNewDay()
    
    // Nettoyer les données tous les jours à minuit
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const timeUntilMidnight = tomorrow - now
    const midnightTimer = setTimeout(() => {
      checkNewDay()
      loadData()
    }, timeUntilMidnight)
    
    return () => clearTimeout(midnightTimer)
  }, [])

  const loadData = () => {
    const todayData = getTodayHydration()
    const userSettings = getHydrationSettings()
    const history = getWeekHistory()
    const stats = getWeekStats()
    
    setHydration(todayData)
    setSettings(userSettings)
    setWeekHistory(history)
    setWeekStats(stats)
    setGoalInput(userSettings.goal)
  }

  const handleAddWater = (amount) => {
    const result = addWaterIntake(amount)
    
    if (result.success) {
      loadData()
      
      // Célébration si objectif atteint
      if (result.goalReached && result.percentage >= 100 && result.percentage < 105) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }
    } else {
      alert('Erreur: ' + result.error)
    }
  }

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount)
    if (amount && amount > 0 && amount <= 5000) {
      handleAddWater(amount)
      setCustomAmount('')
    } else {
      alert('Veuillez entrer une quantité valide (1-5000 ml)')
    }
  }

  const handleRemoveEntry = (timestamp) => {
    if (window.confirm('Supprimer cette entrée ?')) {
      const result = removeWaterIntake(timestamp)
      if (result.success) {
        loadData()
      }
    }
  }

  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInput)
    if (newGoal && newGoal >= 500 && newGoal <= 10000) {
      saveHydrationSettings({ ...settings, goal: newGoal })
      loadData()
      setEditGoal(false)
    } else {
      alert('Objectif invalide (500-10000 ml)')
    }
  }

  const handleToggleReminders = () => {
    const newSettings = { ...settings, reminders: !settings.reminders }
    saveHydrationSettings(newSettings)
    setSettings(newSettings)
  }

  const getProgressColor = (percentage) => {
    if (percentage < 30) return '#ff4444'
    if (percentage < 70) return '#ffaa00'
    if (percentage < 100) return '#4CAF50'
    return '#2196F3'
  }

  const getMotivationMessage = (percentage) => {
    if (percentage === 0) return '💧 Commencez votre hydratation !'
    if (percentage < 30) return '🚰 Pensez à boire plus d\'eau'
    if (percentage < 50) return '💪 Continuez, vous y êtes presque !'
    if (percentage < 70) return '👍 Bon rythme, continuez !'
    if (percentage < 100) return '🎯 Vous approchez de l\'objectif !'
    return '🎉 Objectif atteint ! Bravo !'
  }

  if (!user) {
    return (
      <div className="hydration-container">
        <div className="no-user-message">
          <h2>💧 Tracker d'Hydratation</h2>
          <p>Connectez-vous pour suivre votre consommation d'eau quotidienne</p>
        </div>
      </div>
    )
  }

  if (!hydration || !settings) {
    return (
      <div className="hydration-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  const percentage = Math.round((hydration.total / hydration.goal) * 100)
  const remaining = Math.max(0, hydration.goal - hydration.total)
  const progressColor = getProgressColor(percentage)

  return (
    <div className="hydration-container">
      {/* Célébration */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="confetti">🎉</div>
            <h2>🎉 Objectif Atteint ! 🎉</h2>
            <p>Félicitations ! Vous avez bu {hydration.total}ml aujourd'hui</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="hydration-header">
        <h1>💧 Hydratation</h1>
        <button 
          className="btn-settings"
          onClick={() => setShowSettings(!showSettings)}
          title="Paramètres"
        >
          ⚙️
        </button>
      </div>

      {/* Paramètres */}
      {showSettings && (
        <div className="settings-panel">
          <h3>⚙️ Paramètres</h3>
          
          <div className="setting-item">
            <label>Objectif quotidien:</label>
            {editGoal ? (
              <div className="goal-edit">
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  min="500"
                  max="10000"
                  step="100"
                />
                <span>ml</span>
                <button onClick={handleSaveGoal} className="btn-save">✓</button>
                <button onClick={() => setEditGoal(false)} className="btn-cancel">✕</button>
              </div>
            ) : (
              <div className="goal-display">
                <span>{settings.goal}ml ({(settings.goal / 1000).toFixed(1)}L)</span>
                <button onClick={() => setEditGoal(true)} className="btn-edit">✏️</button>
              </div>
            )}
          </div>

          <div className="setting-item">
            <label>Rappels:</label>
            <button 
              className={`toggle-btn ${settings.reminders ? 'active' : ''}`}
              onClick={handleToggleReminders}
            >
              {settings.reminders ? '🔔 Activés' : '🔕 Désactivés'}
            </button>
          </div>

          {user.profile?.poids && (
            <div className="setting-info">
              <p>💡 Recommandation basée sur votre poids ({user.profile.poids}kg): {calculateWaterGoal(user.profile.poids)}ml</p>
            </div>
          )}
        </div>
      )}

      {/* Progression du jour */}
      <div className="today-progress">
        <div className="progress-header">
          <h2>Aujourd'hui</h2>
          <p className="motivation-message">{getMotivationMessage(percentage)}</p>
        </div>

        {/* Jauge circulaire */}
        <div className="circular-progress">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="15"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={progressColor}
              strokeWidth="15"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - Math.min(percentage, 100) / 100)}`}
              transform="rotate(-90 100 100)"
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="progress-label">
            <div className="percentage">{percentage}%</div>
            <div className="amount">{hydration.total}ml</div>
            <div className="goal">/ {hydration.goal}ml</div>
          </div>
        </div>

        {/* Reste à boire */}
        {remaining > 0 && (
          <div className="remaining">
            <p>Reste: <strong>{remaining}ml</strong> ({Math.ceil(remaining / 250)} verre{Math.ceil(remaining / 250) > 1 ? 's' : ''})</p>
          </div>
        )}

        {percentage >= 100 && (
          <div className="goal-reached">
            ✅ Objectif atteint !
            {weekStats?.currentStreak > 0 && (
              <span className="streak">🔥 {weekStats.currentStreak} jour{weekStats.currentStreak > 1 ? 's' : ''} consécutif{weekStats.currentStreak > 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>

      {/* Boutons rapides */}
      <div className="quick-actions">
        <h3>Ajouter de l'eau</h3>
        <div className="quick-buttons">
          <button className="btn-quick" onClick={() => handleAddWater(250)}>
            <span className="icon">🥤</span>
            <span className="label">+250ml</span>
            <span className="sublabel">Verre</span>
          </button>
          <button className="btn-quick" onClick={() => handleAddWater(500)}>
            <span className="icon">💧</span>
            <span className="label">+500ml</span>
            <span className="sublabel">Bouteille</span>
          </button>
          <button className="btn-quick" onClick={() => handleAddWater(1000)}>
            <span className="icon">🍶</span>
            <span className="label">+1L</span>
            <span className="sublabel">Grande bouteille</span>
          </button>
        </div>

        <div className="custom-amount">
          <input
            type="number"
            placeholder="Quantité (ml)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomAdd()}
            min="1"
            max="5000"
          />
          <button className="btn-add" onClick={handleCustomAdd}>
            ➕ Ajouter
          </button>
        </div>
      </div>

      {/* Historique du jour */}
      {hydration.entries.length > 0 && (
        <div className="today-entries">
          <h3>📝 Aujourd'hui ({hydration.entries.length} entrée{hydration.entries.length > 1 ? 's' : ''})</h3>
          <div className="entries-list">
            {hydration.entries.slice().reverse().map((entry, index) => (
              <div key={entry.timestamp} className="entry-item">
                <span className="entry-time">{entry.time}</span>
                <span className="entry-amount">+{entry.amount}ml</span>
                <button 
                  className="btn-remove-entry"
                  onClick={() => handleRemoveEntry(entry.timestamp)}
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique 7 jours */}
      {weekHistory.length > 0 && (
        <div className="week-history">
          <h3>📊 Historique (7 derniers jours)</h3>
          <div className="history-chart">
            {weekHistory.map((day) => (
              <div key={day.date} className="history-day">
                <div className="day-name">{day.dayName}</div>
                <div className="day-bar-container">
                  <div 
                    className="day-bar"
                    style={{ 
                      height: `${Math.min(day.percentage, 100)}%`,
                      backgroundColor: getProgressColor(day.percentage)
                    }}
                  />
                  {day.goalReached && <span className="day-badge">✅</span>}
                </div>
                <div className="day-percentage">{day.percentage}%</div>
                <div className="day-amount">{(day.total / 1000).toFixed(1)}L</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques */}
      {weekStats && (
        <div className="week-stats">
          <h3>📈 Statistiques de la semaine</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💧</div>
              <div className="stat-label">Moyenne</div>
              <div className="stat-value">{(weekStats.average / 1000).toFixed(1)}L</div>
              <div className="stat-sub">{weekStats.percentageAverage}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-label">Objectifs atteints</div>
              <div className="stat-value">{weekStats.daysGoalReached}/7</div>
              <div className="stat-sub">jours</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-label">Série actuelle</div>
              <div className="stat-value">{weekStats.currentStreak}</div>
              <div className="stat-sub">jour{weekStats.currentStreak > 1 ? 's' : ''}</div>
            </div>
            {weekStats.bestDay && (
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-label">Meilleur jour</div>
                <div className="stat-value">{(weekStats.bestDay.total / 1000).toFixed(1)}L</div>
                <div className="stat-sub">{weekStats.bestDay.dayName}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conseils */}
      <div className="hydration-tips">
        <h3>💡 Conseils</h3>
        <ul>
          <li>💧 Buvez un verre d'eau au réveil</li>
          <li>🍽️ Un verre 30min avant chaque repas aide la digestion</li>
          <li>🏃 Hydratez-vous avant, pendant et après l'exercice</li>
          <li>🌡️ Augmentez votre consommation par temps chaud</li>
          <li>☕ Le café et le thé comptent aussi dans l'hydratation</li>
        </ul>
      </div>
    </div>
  )
}

export default HydrationTracker
