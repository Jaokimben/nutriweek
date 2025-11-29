import { useState } from 'react'

const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    maxHistorySize: 5,
    autoSave: true,
    debugMode: false,
    defaultMealCount: 3,
    cacheExpiration: 24, // heures
    enableAnalytics: false
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    localStorage.setItem('admin_settings', JSON.stringify(settings))
    alert('✅ Paramètres sauvegardés avec succès')
  }

  const handleResetSettings = () => {
    if (confirm('Voulez-vous réinitialiser tous les paramètres par défaut ?')) {
      setSettings({
        maxHistorySize: 5,
        autoSave: true,
        debugMode: false,
        defaultMealCount: 3,
        cacheExpiration: 24,
        enableAnalytics: false
      })
    }
  }

  return (
    <div className="settings-panel">
      {/* Section Général */}
      <div className="settings-section">
        <h3>⚙️ Paramètres généraux</h3>
        
        <div className="setting-item">
          <div className="setting-label">
            <label htmlFor="maxHistory">Taille maximale de l'historique</label>
            <span className="setting-description">Nombre maximum de menus conservés</span>
          </div>
          <input
            id="maxHistory"
            type="number"
            min="1"
            max="10"
            value={settings.maxHistorySize}
            onChange={(e) => handleSettingChange('maxHistorySize', parseInt(e.target.value))}
            className="setting-input"
          />
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <label htmlFor="defaultMeals">Nombre de repas par défaut</label>
            <span className="setting-description">Valeur par défaut dans le questionnaire</span>
          </div>
          <select
            id="defaultMeals"
            value={settings.defaultMealCount}
            onChange={(e) => handleSettingChange('defaultMealCount', parseInt(e.target.value))}
            className="setting-select"
          >
            <option value={2}>2 repas</option>
            <option value={3}>3 repas</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <label htmlFor="cacheExpiration">Expiration du cache (heures)</label>
            <span className="setting-description">Durée de validité des données en cache</span>
          </div>
          <input
            id="cacheExpiration"
            type="number"
            min="1"
            max="168"
            value={settings.cacheExpiration}
            onChange={(e) => handleSettingChange('cacheExpiration', parseInt(e.target.value))}
            className="setting-input"
          />
        </div>
      </div>

      {/* Section Fonctionnalités */}
      <div className="settings-section">
        <h3>🔧 Fonctionnalités</h3>
        
        <div className="setting-item">
          <div className="setting-label">
            <label>Sauvegarde automatique</label>
            <span className="setting-description">Sauvegarder automatiquement les menus générés</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <label>Mode debug</label>
            <span className="setting-description">Afficher les logs détaillés dans la console</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.debugMode}
              onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <label>Analytics</label>
            <span className="setting-description">Collecter des statistiques d'utilisation (anonymes)</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.enableAnalytics}
              onChange={(e) => handleSettingChange('enableAnalytics', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Section Bases de données */}
      <div className="settings-section">
        <h3>🗄️ Bases de données</h3>
        
        <div className="db-info">
          <div className="db-card">
            <h4>CIQUAL Lite</h4>
            <p className="db-desc">Version optimisée (2.7 MB)</p>
            <div className="db-stats">
              <span>546 codes alimentaires</span>
              <span>33,853 lignes</span>
            </div>
            <button className="btn-sm">📊 Voir détails</button>
          </div>

          <div className="db-card">
            <h4>Mappings manuels</h4>
            <p className="db-desc">Correspondances précises</p>
            <div className="db-stats">
              <span>264 mappings</span>
              <span>100% précision</span>
            </div>
            <button className="btn-sm">🗺️ Voir mappings</button>
          </div>

          <div className="db-card">
            <h4>Moyennes nutritionnelles</h4>
            <p className="db-desc">Valeurs de fallback</p>
            <div className="db-stats">
              <span>40+ ingrédients</span>
              <span>Fallback niveau 3</span>
            </div>
            <button className="btn-sm">📋 Voir liste</button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="settings-actions">
        <button className="btn-primary" onClick={handleSaveSettings}>
          💾 Sauvegarder les paramètres
        </button>
        <button className="btn-secondary" onClick={handleResetSettings}>
          🔄 Réinitialiser
        </button>
      </div>

      {/* Informations système */}
      <div className="system-info">
        <h3>ℹ️ Informations système</h3>
        <div className="info-grid">
          <div className="info-row">
            <span>Navigateur:</span>
            <span>{navigator.userAgent.split(' ').pop()}</span>
          </div>
          <div className="info-row">
            <span>Storage disponible:</span>
            <span>~5 MB (LocalStorage)</span>
          </div>
          <div className="info-row">
            <span>Version app:</span>
            <span>1.0.0</span>
          </div>
          <div className="info-row">
            <span>Dernière MAJ:</span>
            <span>{new Date().toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
