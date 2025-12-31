import { useState, useEffect } from 'react'
import {
  getTodayHydration,
  addWaterIntake
} from '../utils/hydrationStorage'
import './HydrationWidget.css'

const HydrationWidget = ({ onNavigate }) => {
  const [hydration, setHydration] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    loadData()
    
    // Rafraîchir toutes les minutes
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    const data = getTodayHydration()
    setHydration(data)
  }

  const handleAddWater = (amount) => {
    const result = addWaterIntake(amount)
    
    if (result.success) {
      loadData()
      
      // Afficher toast
      setToastMessage(`+${amount}ml ajouté 💧`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
      
      // Célébration si objectif atteint
      if (result.goalReached && result.percentage >= 100 && result.percentage < 105) {
        setToastMessage('🎉 Objectif atteint !')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    }
  }

  if (!hydration) return null

  const percentage = Math.round((hydration.total / hydration.goal) * 100)
  const progressColor = percentage >= 100 ? '#4CAF50' : percentage >= 70 ? '#2196F3' : percentage >= 30 ? '#ffaa00' : '#ff4444'

  return (
    <>
      {/* Toast */}
      {showToast && (
        <div className="hydration-toast">
          {toastMessage}
        </div>
      )}

      {/* Widget */}
      <div className={`hydration-widget ${isExpanded ? 'expanded' : ''}`}>
        {/* Compact View */}
        <div 
          className="widget-compact"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="widget-icon">💧</div>
          <div className="widget-progress-mini">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: progressColor
              }}
            />
          </div>
          <div className="widget-percentage">{percentage}%</div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="widget-expanded">
            <div className="widget-header">
              <h4>💧 Hydratation</h4>
              <button 
                className="btn-close-widget"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(false)
                }}
              >
                ✕
              </button>
            </div>

            <div className="widget-stats">
              <div className="stat">
                <span className="stat-label">Aujourd'hui</span>
                <span className="stat-value">{hydration.total}ml</span>
              </div>
              <div className="stat">
                <span className="stat-label">Objectif</span>
                <span className="stat-value">{hydration.goal}ml</span>
              </div>
            </div>

            <div className="widget-progress-bar">
              <div 
                className="progress-bar-fill"
                style={{ 
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: progressColor
                }}
              />
              <span className="progress-label">{percentage}%</span>
            </div>

            {percentage >= 100 ? (
              <div className="widget-success">
                ✅ Objectif atteint !
              </div>
            ) : (
              <div className="widget-remaining">
                Reste: {hydration.goal - hydration.total}ml
              </div>
            )}

            <div className="widget-quick-buttons">
              <button 
                className="btn-widget-quick"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddWater(250)
                }}
              >
                +250ml
              </button>
              <button 
                className="btn-widget-quick"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddWater(500)
                }}
              >
                +500ml
              </button>
            </div>

            <button 
              className="btn-widget-full"
              onClick={(e) => {
                e.stopPropagation()
                onNavigate && onNavigate()
              }}
            >
              📊 Voir détails
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default HydrationWidget
