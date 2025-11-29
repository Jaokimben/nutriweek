import { useState, useEffect } from 'react'
import './UserManager.css'

const UserManager = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, inactive
  const [sortBy, setSortBy] = useState('recent') // recent, name, menus, logins
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetail, setShowUserDetail] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterAndSortUsers()
  }, [users, searchTerm, filterStatus, sortBy])

  const loadUsers = () => {
    try {
      // Charger tous les utilisateurs depuis localStorage
      const allUsers = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        
        // Récupérer les utilisateurs (clés qui commencent par 'user_')
        if (key && key.startsWith('user_')) {
          const userData = JSON.parse(localStorage.getItem(key))
          const userId = key.replace('user_', '')
          
          // Récupérer l'historique des connexions
          const loginHistory = getLoginHistory(userId)
          
          // Récupérer les menus de l'utilisateur
          const userMenus = getUserMenus(userId)
          
          allUsers.push({
            id: userId,
            ...userData,
            loginHistory,
            menusCount: userMenus.length,
            lastLogin: loginHistory.length > 0 ? loginHistory[0].timestamp : null,
            isActive: isUserActive(loginHistory)
          })
        }
      }
      
      setUsers(allUsers)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    }
  }

  const getLoginHistory = (userId) => {
    try {
      const history = localStorage.getItem(`login_history_${userId}`)
      return history ? JSON.parse(history) : []
    } catch {
      return []
    }
  }

  const getUserMenus = (userId) => {
    try {
      const menus = localStorage.getItem(`menu_history_${userId}`)
      return menus ? JSON.parse(menus) : []
    } catch {
      return []
    }
  }

  const isUserActive = (loginHistory) => {
    if (loginHistory.length === 0) return false
    const lastLogin = new Date(loginHistory[0].timestamp)
    const now = new Date()
    const daysSinceLastLogin = (now - lastLogin) / (1000 * 60 * 60 * 24)
    return daysSinceLastLogin <= 7 // Actif si connecté dans les 7 derniers jours
  }

  const filterAndSortUsers = () => {
    let filtered = [...users]

    // Filtrage par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(term) ||
        user.displayName?.toLowerCase().includes(term) ||
        user.profile?.objectif?.toLowerCase().includes(term)
      )
    }

    // Filtrage par statut
    if (filterStatus === 'active') {
      filtered = filtered.filter(user => user.isActive)
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(user => !user.isActive)
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        case 'name':
          return (a.displayName || a.email).localeCompare(b.displayName || b.email)
        case 'menus':
          return b.menusCount - a.menusCount
        case 'logins':
          return b.loginHistory.length - a.loginHistory.length
        default:
          return 0
      }
    })

    setFilteredUsers(filtered)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getObjectifEmoji = (objectif) => {
    const emojis = {
      'perte': '📉',
      'confort digestif': '🌿',
      'maintien': '⚖️',
      'prise de masse': '💪'
    }
    return emojis[objectif] || '🎯'
  }

  const handleUserClick = (user) => {
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  const handleDeleteUser = (userId, email) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${email} ?`)) {
      try {
        // Supprimer toutes les données de l'utilisateur
        localStorage.removeItem(`user_${userId}`)
        localStorage.removeItem(`login_history_${userId}`)
        localStorage.removeItem(`menu_history_${userId}`)
        
        // Recharger la liste
        loadUsers()
        setShowUserDetail(false)
        alert('Utilisateur supprimé avec succès')
      } catch (error) {
        alert('Erreur lors de la suppression')
      }
    }
  }

  const exportUserData = (user) => {
    const data = JSON.stringify(user, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user_${user.email}_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      totalMenus: users.reduce((sum, u) => sum + u.menusCount, 0),
      totalLogins: users.reduce((sum, u) => sum + u.loginHistory.length, 0)
    }
  }

  const stats = getStats()

  return (
    <div className="user-manager">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Utilisateurs</div>
          </div>
        </div>
        
        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Actifs (7j)</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalMenus}</div>
            <div className="stat-label">Menus générés</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔑</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalLogins}</div>
            <div className="stat-label">Connexions</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="user-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par email, nom, objectif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs uniquement</option>
            <option value="inactive">Inactifs uniquement</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Plus récents</option>
            <option value="name">Par nom</option>
            <option value="menus">Plus de menus</option>
            <option value="logins">Plus de connexions</option>
          </select>
        </div>

        <button className="btn-refresh" onClick={loadUsers}>
          🔄 Actualiser
        </button>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Statut</th>
              <th>Utilisateur</th>
              <th>Objectif</th>
              <th>Profil</th>
              <th>Menus</th>
              <th>Connexions</th>
              <th>Dernière connexion</th>
              <th>Inscrit le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} onClick={() => handleUserClick(user)}>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? '✅' : '⭕'}
                    </span>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{user.displayName || 'Sans nom'}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className="objectif-badge">
                      {getObjectifEmoji(user.profile?.objectif)} {user.profile?.objectif || 'Non défini'}
                    </span>
                  </td>
                  <td>
                    <div className="profile-summary">
                      {user.profile?.age && <span>👤 {user.profile.age}ans</span>}
                      {user.profile?.poids && <span>⚖️ {user.profile.poids}kg</span>}
                      {user.profile?.taille && <span>📏 {user.profile.taille}cm</span>}
                    </div>
                  </td>
                  <td className="centered">
                    <span className="badge">{user.menusCount}</span>
                  </td>
                  <td className="centered">
                    <span className="badge">{user.loginHistory.length}</span>
                  </td>
                  <td>{formatDate(user.lastLogin)}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="actions">
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUserClick(user)
                      }}
                      title="Voir détails"
                    >
                      👁️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        exportUserData(user)
                      }}
                      title="Exporter"
                    >
                      💾
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteUser(user.id, user.email)
                      }}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserDetail(false)}>
          <div className="user-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Détails de l'utilisateur</h2>
              <button className="btn-close" onClick={() => setShowUserDetail(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* User Info */}
              <section className="detail-section">
                <h3>Informations générales</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Email:</strong> {selectedUser.email}
                  </div>
                  <div className="detail-item">
                    <strong>Nom:</strong> {selectedUser.displayName || 'Non défini'}
                  </div>
                  <div className="detail-item">
                    <strong>ID:</strong> <code>{selectedUser.id}</code>
                  </div>
                  <div className="detail-item">
                    <strong>Statut:</strong>
                    <span className={`status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                      {selectedUser.isActive ? '✅ Actif' : '⭕ Inactif'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Inscrit le:</strong> {formatDate(selectedUser.createdAt)}
                  </div>
                  <div className="detail-item">
                    <strong>Dernière connexion:</strong> {formatDate(selectedUser.lastLogin)}
                  </div>
                </div>
              </section>

              {/* Profile */}
              <section className="detail-section">
                <h3>🥗 Profil nutritionnel</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Objectif:</strong> {getObjectifEmoji(selectedUser.profile?.objectif)} {selectedUser.profile?.objectif || 'Non défini'}
                  </div>
                  <div className="detail-item">
                    <strong>Âge:</strong> {selectedUser.profile?.age || '-'} ans
                  </div>
                  <div className="detail-item">
                    <strong>Sexe:</strong> {selectedUser.profile?.genre === 'homme' ? '👨 Homme' : selectedUser.profile?.genre === 'femme' ? '👩 Femme' : '-'}
                  </div>
                  <div className="detail-item">
                    <strong>Taille:</strong> {selectedUser.profile?.taille || '-'} cm
                  </div>
                  <div className="detail-item">
                    <strong>Poids:</strong> {selectedUser.profile?.poids || '-'} kg
                  </div>
                  <div className="detail-item">
                    <strong>Tour de taille:</strong> {selectedUser.profile?.tourDeTaille || '-'} cm
                  </div>
                  <div className="detail-item">
                    <strong>Morphotype:</strong> {selectedUser.profile?.morphotype || '-'}
                  </div>
                  <div className="detail-item">
                    <strong>Activité physique:</strong> {selectedUser.profile?.activitePhysique || '-'}
                  </div>
                  <div className="detail-item full-width">
                    <strong>Intolérances:</strong> {selectedUser.profile?.intolerances?.length > 0 ? selectedUser.profile.intolerances.join(', ') : 'Aucune'}
                  </div>
                </div>
              </section>

              {/* Statistics */}
              <section className="detail-section">
                <h3>📊 Statistiques</h3>
                <div className="stats-row">
                  <div className="stat-box">
                    <div className="stat-number">{selectedUser.menusCount}</div>
                    <div className="stat-text">Menus générés</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number">{selectedUser.loginHistory.length}</div>
                    <div className="stat-text">Connexions</div>
                  </div>
                </div>
              </section>

              {/* Login History */}
              <section className="detail-section">
                <h3>🔑 Historique des connexions ({selectedUser.loginHistory.length})</h3>
                <div className="login-history">
                  {selectedUser.loginHistory.length === 0 ? (
                    <p className="no-data">Aucune connexion enregistrée</p>
                  ) : (
                    <div className="history-list">
                      {selectedUser.loginHistory.slice(0, 10).map((login, index) => (
                        <div key={index} className="history-item">
                          <span className="history-date">{formatDate(login.timestamp)}</span>
                          <span className="history-method">{login.method === 'google' ? '🔵 Google' : '📧 Email'}</span>
                          {login.ip && <span className="history-ip">IP: {login.ip}</span>}
                        </div>
                      ))}
                      {selectedUser.loginHistory.length > 10 && (
                        <div className="history-more">
                          +{selectedUser.loginHistory.length - 10} connexions plus anciennes
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => exportUserData(selectedUser)}>
                💾 Exporter les données
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteUser(selectedUser.id, selectedUser.email)}>
                🗑️ Supprimer l'utilisateur
              </button>
              <button className="btn btn-secondary" onClick={() => setShowUserDetail(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManager
