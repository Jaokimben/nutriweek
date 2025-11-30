import { useState, useEffect } from 'react'
import Questionnaire from './components/Questionnaire'
import WeeklyMenu from './components/WeeklyMenu'
import AdminPortal from './components/AdminPortal'
import Welcome from './components/Welcome'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Profile from './components/Profile'
import History from './components/History'
import BottomNav from './components/BottomNav'
import { getCurrentUser, isAuthenticated, initializeDemoAccount, updateUserProfile, saveUserMenu } from './utils/authService'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [guestMode, setGuestMode] = useState(false)
  const [authMode, setAuthMode] = useState('welcome') // 'welcome', 'login' or 'register'
  const [activeTab, setActiveTab] = useState('questionnaire')
  const [weeklyMenu, setWeeklyMenu] = useState(null)
  const [showAdmin, setShowAdmin] = useState(false)

  // Initialiser au chargement
  useEffect(() => {
    // Créer le compte démo si nécessaire
    initializeDemoAccount()

    // Vérifier si l'URL contient /admin
    const path = window.location.pathname
    if (path === '/admin' || path.includes('/admin')) {
      setShowAdmin(true)
      return
    }

    // Charger l'utilisateur connecté
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      // Déterminer l'onglet à afficher selon le profil
      if (currentUser.profile) {
        setActiveTab('menu')
      } else {
        setActiveTab('questionnaire')
      }
    }
  }, [])

  // Gestion de la connexion réussie
  const handleAuthSuccess = (userData) => {
    setUser(userData)
    // Si l'utilisateur a déjà un profil, aller au menu
    if (userData.profile) {
      setActiveTab('menu')
    } else {
      setActiveTab('questionnaire')
    }
  }

  // Gestion de la déconnexion
  const handleLogout = () => {
    setUser(null)
    setGuestMode(false)
    setWeeklyMenu(null)
    setActiveTab('questionnaire')
    setAuthMode('welcome')
  }

  // Gestion de la completion du questionnaire
  const handleProfileComplete = (profile) => {
    // Sauvegarder le profil (sauf en mode invité)
    if (!user.isGuest) {
      updateUserProfile(profile)
      // Mettre à jour l'utilisateur
      setUser(getCurrentUser())
    } else {
      // En mode invité, juste mettre à jour localement
      setUser({ ...user, profile })
    }
    // Aller au menu avec le profil
    setActiveTab('menu')
  }

  // Gestion du menu généré
  const handleMenuGenerated = (menu) => {
    setWeeklyMenu(menu)
    // Sauvegarder le menu pour l'utilisateur (sauf en mode invité)
    if (user && !user.isGuest) {
      saveUserMenu(menu)
    }
  }

  // Chargement d'un menu depuis l'historique
  const handleLoadMenuFromHistory = (menu) => {
    setWeeklyMenu(menu)
    setActiveTab('menu')
  }

  // Changement d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleBackFromAdmin = () => {
    setShowAdmin(false)
    window.history.pushState({}, '', '/')
  }

  // Si mode admin activé
  if (showAdmin) {
    return <AdminPortal onBack={handleBackFromAdmin} />
  }

  // Gestion du mode invité
  const handleContinueAsGuest = () => {
    setGuestMode(true)
    setUser({
      id: 'guest',
      email: 'guest@nutriweek.app',
      displayName: 'Utilisateur Invité',
      profile: null,
      isGuest: true
    })
    setActiveTab('questionnaire')
  }

  // Si l'utilisateur n'est pas connecté et pas en mode invité, afficher l'authentification
  if (!user && !guestMode) {
    return (
      <div className="app">
        {authMode === 'welcome' ? (
          <Welcome 
            onLogin={() => setAuthMode('login')}
            onRegister={() => setAuthMode('register')}
            onContinueAsGuest={handleContinueAsGuest}
          />
        ) : authMode === 'login' ? (
          <Login 
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <Register 
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    )
  }

  // Déterminer le contenu à afficher selon l'onglet actif
  const renderContent = () => {
    switch(activeTab) {
      case 'questionnaire':
        return (
          <Questionnaire 
            onComplete={handleProfileComplete}
            initialData={user.profile}
          />
        )
      
      case 'menu':
        if (weeklyMenu) {
          return (
            <WeeklyMenu 
              userProfile={user.profile}
              initialMenu={weeklyMenu}
              onMenuGenerated={handleMenuGenerated}
              onBack={() => setActiveTab('questionnaire')}
            />
          )
        } else if (user.profile) {
          // Générer automatiquement le menu
          return (
            <WeeklyMenu 
              userProfile={user.profile}
              onMenuGenerated={handleMenuGenerated}
              onBack={() => setActiveTab('questionnaire')}
            />
          )
        } else {
          // Pas de profil, rediriger vers questionnaire
          setActiveTab('questionnaire')
          return null
        }
      
      case 'history':
        return <History onLoadMenu={handleLoadMenuFromHistory} />
      
      case 'profile':
        return <Profile onLogout={handleLogout} />
      
      default:
        return null
    }
  }

  return (
    <div className="app">
      {/* Bouton d'accès admin (visible seulement sur questionnaire) */}
      {activeTab === 'questionnaire' && (
        <button 
          className="admin-access-btn"
          onClick={() => {
            setShowAdmin(true)
            window.history.pushState({}, '', '/admin')
          }}
          title="Accéder au backoffice"
        >
          ⚙️
        </button>
      )}

      {/* Contenu principal */}
      <div className="app-content">
        {renderContent()}
      </div>

      {/* Menu de navigation en bas */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}

export default App
