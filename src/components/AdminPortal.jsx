import { useState, useEffect } from 'react'
import AdminDashboard from './admin/AdminDashboard'
import RecipeManager from './admin/RecipeManager'
import MappingsViewer from './admin/MappingsViewer'
import SettingsPanel from './admin/SettingsPanel'
import './AdminPortal.css'

const AdminPortal = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [currentTab, setCurrentTab] = useState('dashboard')

  // Mot de passe simple pour la démo (en production, utiliser un vrai système d'auth)
  const ADMIN_PASSWORD = 'admin123'

  useEffect(() => {
    // Vérifier si déjà authentifié dans la session
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true'
    setIsAuthenticated(isAuth)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_authenticated', 'true')
      setError('')
    } else {
      setError('Mot de passe incorrect')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_authenticated')
    setCurrentTab('dashboard')
  }

  // Écran de connexion
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <h1>🔐 Administration</h1>
            <p>Accès réservé aux administrateurs</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe"
                autoFocus
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-login">
              Se connecter
            </button>
            <button type="button" onClick={onBack} className="btn-back">
              ← Retour à l'application
            </button>
            <div className="login-hint">
              💡 Démo : utilisez "admin123"
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Interface admin authentifiée
  return (
    <div className="admin-portal">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>⚙️ Backoffice</h2>
          <p>NutriWeek Admin</p>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </button>
          
          <button
            className={`nav-item ${currentTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setCurrentTab('recipes')}
          >
            <span className="nav-icon">🍽️</span>
            <span className="nav-label">Recettes</span>
          </button>
          
          <button
            className={`nav-item ${currentTab === 'mappings' ? 'active' : ''}`}
            onClick={() => setCurrentTab('mappings')}
          >
            <span className="nav-icon">🗺️</span>
            <span className="nav-label">Mappings</span>
          </button>
          
          <button
            className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentTab('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Paramètres</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Déconnexion
          </button>
          <button className="btn-app" onClick={onBack}>
            ← Application
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-content">
        <div className="content-header">
          <h1>{getTabTitle(currentTab)}</h1>
          <div className="header-actions">
            <span className="user-badge">👤 Admin</span>
          </div>
        </div>

        <div className="content-body">
          {currentTab === 'dashboard' && <AdminDashboard />}
          {currentTab === 'recipes' && <RecipeManager />}
          {currentTab === 'mappings' && <MappingsViewer />}
          {currentTab === 'settings' && <SettingsPanel />}
        </div>
      </main>
    </div>
  )
}

const getTabTitle = (tab) => {
  const titles = {
    dashboard: '📊 Tableau de bord',
    recipes: '🍽️ Gestion des recettes',
    mappings: '🗺️ Mappings nutritionnels',
    settings: '⚙️ Paramètres'
  }
  return titles[tab] || 'Admin'
}

export default AdminPortal
