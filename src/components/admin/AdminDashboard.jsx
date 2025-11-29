import { useState, useEffect } from 'react'
import { getStorageSize, getHistory } from '../../utils/storage'
import { getMappingStats } from '../../utils/nutritionMappings'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMappings: 0,
    uniqueCodes: 0,
    storageUsed: { kb: '0', mb: '0' },
    menusInHistory: 0,
    lastMenuDate: null
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    // Statistiques des mappings
    const mappingStats = getMappingStats()
    
    // Statistiques du storage
    const storageSize = getStorageSize()
    
    // Historique des menus
    const history = getHistory()
    const lastMenu = history.length > 0 ? history[0] : null

    setStats({
      totalMappings: mappingStats.totalMappings,
      uniqueCodes: mappingStats.uniqueCiqualCodes,
      mappingsPerCode: mappingStats.mappingsPerCode,
      storageUsed: storageSize,
      menusInHistory: history.length,
      lastMenuDate: lastMenu ? new Date(lastMenu.savedAt) : null
    })
  }

  const formatDate = (date) => {
    if (!date) return 'Aucun menu'
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="admin-dashboard">
      {/* Statistiques principales */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🗺️</div>
          <div className="stat-content">
            <h3>{stats.totalMappings}</h3>
            <p>Mappings nutritionnels</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{stats.uniqueCodes}</h3>
            <p>Codes CIQUAL uniques</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <h3>{stats.storageUsed.kb} KB</h3>
            <p>Storage utilisé</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.menusInHistory}</h3>
            <p>Menus en historique</p>
          </div>
        </div>
      </div>

      {/* Informations détaillées */}
      <div className="info-section">
        <div className="info-card">
          <h3>📊 Statistiques détaillées</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Ratio mapping/code:</span>
              <span className="info-value">{stats.mappingsPerCode} mappings par code</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dernier menu généré:</span>
              <span className="info-value">{formatDate(stats.lastMenuDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Storage MB:</span>
              <span className="info-value">{stats.storageUsed.mb} MB</span>
            </div>
            <div className="info-item">
              <span className="info-label">Historique max:</span>
              <span className="info-value">5 menus</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>🚀 Actions rapides</h3>
          <div className="quick-actions">
            <button 
              className="action-btn"
              onClick={() => window.location.reload()}
            >
              🔄 Recharger les données
            </button>
            <button 
              className="action-btn"
              onClick={() => {
                if (confirm('Voulez-vous vraiment vider le cache ?')) {
                  localStorage.clear()
                  sessionStorage.clear()
                  alert('Cache vidé avec succès')
                  window.location.reload()
                }
              }}
            >
              🗑️ Vider le cache
            </button>
            <button 
              className="action-btn"
              onClick={() => {
                const data = {
                  stats,
                  timestamp: new Date().toISOString(),
                  history: getHistory()
                }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `nutriweek-stats-${Date.now()}.json`
                a.click()
              }}
            >
              📥 Exporter les stats
            </button>
          </div>
        </div>
      </div>

      {/* Alertes et notifications */}
      <div className="alerts-section">
        <h3>⚠️ Notifications système</h3>
        <div className="alert-list">
          {stats.menusInHistory >= 5 && (
            <div className="alert warning">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <strong>Historique complet</strong>
                <p>L'historique contient le maximum de 5 menus. Les anciens menus seront supprimés automatiquement.</p>
              </div>
            </div>
          )}
          
          {parseFloat(stats.storageUsed.mb) > 5 && (
            <div className="alert danger">
              <span className="alert-icon">🔴</span>
              <div className="alert-content">
                <strong>Storage élevé</strong>
                <p>Le stockage local dépasse 5 MB. Envisagez de vider le cache.</p>
              </div>
            </div>
          )}

          {stats.menusInHistory === 0 && (
            <div className="alert info">
              <span className="alert-icon">ℹ️</span>
              <div className="alert-content">
                <strong>Aucun menu en historique</strong>
                <p>Générez un menu depuis l'application pour voir les statistiques d'utilisation.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version et build info */}
      <div className="version-info">
        <p><strong>NutriWeek</strong> v1.0.0 | Build: {new Date().toISOString().split('T')[0]}</p>
        <p>Backoffice Administration • Tous droits réservés</p>
      </div>
    </div>
  )
}

export default AdminDashboard
