import { useState } from 'react'
import './Welcome.css'

const Welcome = ({ onLogin, onRegister, onContinueAsGuest }) => {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-header">
          <div className="logo-animated">🍽️</div>
          <h1>NutriWeek</h1>
          <p className="tagline">Votre coach nutrition personnalisé</p>
        </div>

        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <div>
              <h3>Objectifs personnalisés</h3>
              <p>Perte de poids, confort digestif ou maintien</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🥗</span>
            <div>
              <h3>Menus équilibrés</h3>
              <p>7 jours de repas adaptés à votre profil</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🛒</span>
            <div>
              <h3>Liste de courses</h3>
              <p>Automatique et prête à l'emploi</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💾</span>
            <div>
              <h3>Sauvegarde automatique</h3>
              <p>Retrouvez vos menus à tout moment</p>
            </div>
          </div>
        </div>

        <div className="welcome-actions">
          <button 
            className="btn-welcome btn-primary"
            onClick={onLogin}
          >
            <span className="btn-icon">🔐</span>
            <span>Se connecter</span>
          </button>

          <button 
            className="btn-welcome btn-secondary"
            onClick={onRegister}
          >
            <span className="btn-icon">✨</span>
            <span>Créer un compte</span>
          </button>

          <button 
            className="btn-welcome btn-guest"
            onClick={onContinueAsGuest}
          >
            <span className="btn-icon">👤</span>
            <span>Essayer sans compte</span>
          </button>
        </div>

        <div className="welcome-info">
          <button 
            className="info-toggle"
            onClick={() => setShowInfo(!showInfo)}
          >
            {showInfo ? '▼' : '▶'} Mode invité : qu'est-ce que c'est ?
          </button>
          {showInfo && (
            <div className="info-content">
              <p>
                <strong>✅ Vous pouvez :</strong> Générer des menus personnalisés, 
                voir les recettes, créer des listes de courses.
              </p>
              <p>
                <strong>⚠️ Sans compte :</strong> Vos données ne sont pas sauvegardées. 
                Si vous fermez l'application, tout sera perdu.
              </p>
              <p>
                <strong>💡 Astuce :</strong> Créez un compte gratuit pour sauvegarder 
                votre historique et accéder à vos menus depuis n'importe quel appareil.
              </p>
            </div>
          )}
        </div>

        <div className="welcome-demo">
          <div className="demo-badge">🎓 Compte démo</div>
          <p>Email : <code>demo@test.com</code> | Mot de passe : <code>demo123</code></p>
        </div>

        <div className="welcome-footer">
          <p>© 2025 NutriWeek - Votre santé, notre priorité</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="welcome-background">
        <div className="bubble bubble-1">🥑</div>
        <div className="bubble bubble-2">🥕</div>
        <div className="bubble bubble-3">🍎</div>
        <div className="bubble bubble-4">🥦</div>
        <div className="bubble bubble-5">🍊</div>
        <div className="bubble bubble-6">🍇</div>
      </div>
    </div>
  )
}

export default Welcome
