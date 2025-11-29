import { useState, useEffect } from 'react'
import Questionnaire from './components/Questionnaire'
import WeeklyMenu from './components/WeeklyMenu'
import AdminPortal from './components/AdminPortal'
import './App.css'

function App() {
  const [userProfile, setUserProfile] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  // Détecter si l'URL contient /admin pour afficher le backoffice
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/admin' || path.includes('/admin')) {
      setShowAdmin(true)
    }
  }, [])

  const handleProfileComplete = (profile) => {
    setUserProfile(profile)
    setShowMenu(true)
  }

  const handleBack = () => {
    setShowMenu(false)
  }

  const handleBackFromAdmin = () => {
    setShowAdmin(false)
    window.history.pushState({}, '', '/')
  }

  // Si mode admin activé
  if (showAdmin) {
    return <AdminPortal onBack={handleBackFromAdmin} />
  }

  return (
    <div className="app">
      {/* Bouton d'accès admin (coin en bas à droite) */}
      {!showMenu && (
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

      {!showMenu ? (
        <Questionnaire onComplete={handleProfileComplete} />
      ) : (
        <WeeklyMenu userProfile={userProfile} onBack={handleBack} />
      )}
    </div>
  )
}

export default App
