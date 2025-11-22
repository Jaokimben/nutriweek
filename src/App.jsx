import { useState } from 'react'
import Questionnaire from './components/Questionnaire'
import WeeklyMenu from './components/WeeklyMenu'
import './App.css'

function App() {
  const [userProfile, setUserProfile] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  const handleProfileComplete = (profile) => {
    setUserProfile(profile)
    setShowMenu(true)
  }

  const handleBack = () => {
    setShowMenu(false)
  }

  return (
    <div className="app">
      {!showMenu ? (
        <Questionnaire onComplete={handleProfileComplete} />
      ) : (
        <WeeklyMenu userProfile={userProfile} onBack={handleBack} />
      )}
    </div>
  )
}

export default App
