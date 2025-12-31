import './BottomNav.css'

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'questionnaire', icon: '📋', label: 'Questionnaire' },
    { id: 'menu', icon: '🍽️', label: 'Mon Menu' },
    { id: 'hydration', icon: '💧', label: 'Hydratation' },
    { id: 'favorites', icon: '❤️', label: 'Favoris' },
    { id: 'history', icon: '📚', label: 'Historique' },
    { id: 'profile', icon: '👤', label: 'Profil' }
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomNav
