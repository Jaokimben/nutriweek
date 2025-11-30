import { useState, useEffect } from 'react'
import {
  getCurrentUser,
  updateUserProfile,
  updatePersonalInfo,
  changePassword,
  deleteAccount,
  logout,
  getUserStats
} from '../utils/authService'
import './Profile.css'

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: '',
    lastName: '',
    
    // Profil nutritionnel
    objectif: 'perte',
    taille: '170',
    poids: '75',
    age: '30',
    genre: 'homme',
    tourDeTaille: '85',
    nombreRepas: '3',
    morphotype: 'mesomorphe',
    activitePhysique: 'moderee',
    capaciteDigestive: [],
    intolerances: []
  })

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = () => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      
      // Ne charger les stats que si pas en mode invité
      if (!currentUser.isGuest) {
        setStats(getUserStats())
      }
      
      // Charger les données du formulaire
      if (currentUser.profile) {
        setFormData({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          ...currentUser.profile
        })
      } else {
        setFormData(prev => ({
          ...prev,
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || ''
        }))
      }
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setMessage({ type: '', text: '' })
  }

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || []
      const newValue = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
      return { ...prev, [field]: newValue }
    })
  }

  const handleSaveProfile = () => {
    const { firstName, lastName, ...profileData } = formData
    const result = updateUserProfile(profileData)
    
    if (result.success) {
      setMessage({ type: 'success', text: '✅ Profil mis à jour avec succès' })
      setEditing(false)
      loadUserData()
    } else {
      setMessage({ type: 'error', text: '❌ ' + result.error })
    }
  }

  const handleSavePersonalInfo = () => {
    const result = updatePersonalInfo(formData.firstName, formData.lastName)
    
    if (result.success) {
      setMessage({ type: 'success', text: '✅ Informations mises à jour' })
      setEditingPersonal(false)
      loadUserData()
    } else {
      setMessage({ type: 'error', text: '❌ ' + result.error })
    }
  }

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: '❌ Les mots de passe ne correspondent pas' })
      return
    }

    if (passwordData.new.length < 6) {
      setMessage({ type: 'error', text: '❌ Le mot de passe doit contenir au moins 6 caractères' })
      return
    }

    const result = changePassword(passwordData.current, passwordData.new)
    
    if (result.success) {
      setMessage({ type: 'success', text: '✅ Mot de passe changé avec succès' })
      setChangingPassword(false)
      setPasswordData({ current: '', new: '', confirm: '' })
    } else {
      setMessage({ type: 'error', text: '❌ ' + result.error })
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      const result = deleteAccount()
      if (result.success) {
        onLogout()
      } else {
        setMessage({ type: 'error', text: '❌ ' + result.error })
      }
    }
  }

  const handleLogout = () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      logout()
      onLogout()
    }
  }

  if (!user) {
    return (
      <div className="profile-container">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 Mon Profil</h1>
        <button className="btn-logout" onClick={handleLogout}>
          🚪 {user.isGuest ? 'Quitter' : 'Déconnexion'}
        </button>
      </div>

      {user.isGuest && (
        <div className="guest-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <h3>Mode Invité</h3>
            <p>
              Vous utilisez NutriWeek en mode invité. Vos données ne sont pas sauvegardées 
              et seront perdues si vous fermez l'application.
            </p>
            <p>
              <strong>💡 Conseil :</strong> Créez un compte gratuit pour sauvegarder vos menus 
              et accéder à votre historique depuis n'importe quel appareil.
            </p>
            <div className="warning-actions">
              <button className="btn-create-account" onClick={() => {
                if (confirm('Vous allez être redirigé vers la page de création de compte. Vos données actuelles seront perdues. Continuer ?')) {
                  logout()
                  onLogout()
                }
              }}>
                ✨ Créer un compte maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Informations personnelles */}
      <div className="profile-section">
        <div className="section-header">
          <h2>📝 Informations personnelles</h2>
          <button 
            className="btn-edit"
            onClick={() => setEditingPersonal(!editingPersonal)}
          >
            {editingPersonal ? '✖ Annuler' : '✏️ Modifier'}
          </button>
        </div>

        {editingPersonal ? (
          <div className="form-grid">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Prénom"
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Nom"
              />
            </div>
            <div className="form-group full-width">
              <label>Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="disabled-input"
              />
              <span className="input-hint">L'email ne peut pas être modifié</span>
            </div>
            <div className="form-actions full-width">
              <button className="btn-save" onClick={handleSavePersonalInfo}>
                💾 Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <div className="info-display">
            <div className="info-item">
              <span className="info-label">Nom complet:</span>
              <span className="info-value">
                {user.firstName || user.lastName 
                  ? `${user.firstName} ${user.lastName}`.trim() 
                  : 'Non renseigné'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type de compte:</span>
              <span className="info-value">
                {user.provider === 'google' ? '🔵 Google' : '📧 Email'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Profil nutritionnel */}
      <div className="profile-section">
        <div className="section-header">
          <h2>🎯 Profil nutritionnel</h2>
          <button 
            className="btn-edit"
            onClick={() => setEditing(!editing)}
          >
            {editing ? '✖ Annuler' : '✏️ Modifier'}
          </button>
        </div>

        {editing ? (
          <div className="form-grid">
            <div className="form-group">
              <label>Objectif</label>
              <select
                value={formData.objectif}
                onChange={(e) => handleChange('objectif', e.target.value)}
              >
                <option value="perte">🎯 Perte de poids</option>
                <option value="confort">💚 Confort digestif</option>
                <option value="vitalite">⚡ Vitalité</option>
              </select>
            </div>

            <div className="form-group">
              <label>Taille (cm)</label>
              <input
                type="number"
                value={formData.taille}
                onChange={(e) => handleChange('taille', e.target.value)}
                min="100"
                max="250"
              />
            </div>

            <div className="form-group">
              <label>Poids (kg)</label>
              <input
                type="number"
                value={formData.poids}
                onChange={(e) => handleChange('poids', e.target.value)}
                min="30"
                max="300"
              />
            </div>

            <div className="form-group">
              <label>Âge</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                min="10"
                max="120"
              />
            </div>

            <div className="form-group">
              <label>Genre</label>
              <select
                value={formData.genre}
                onChange={(e) => handleChange('genre', e.target.value)}
              >
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tour de taille (cm)</label>
              <input
                type="number"
                value={formData.tourDeTaille}
                onChange={(e) => handleChange('tourDeTaille', e.target.value)}
                min="50"
                max="200"
              />
            </div>

            <div className="form-group">
              <label>Nombre de repas/jour</label>
              <select
                value={formData.nombreRepas}
                onChange={(e) => handleChange('nombreRepas', e.target.value)}
              >
                <option value="2">2 repas</option>
                <option value="3">3 repas</option>
              </select>
            </div>

            <div className="form-group">
              <label>Morphotype</label>
              <select
                value={formData.morphotype}
                onChange={(e) => handleChange('morphotype', e.target.value)}
              >
                <option value="ectomorphe">Ectomorphe (mince)</option>
                <option value="mesomorphe">Mésomorphe (équilibré)</option>
                <option value="endomorphe">Endomorphe (robuste)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Activité physique</label>
              <select
                value={formData.activitePhysique}
                onChange={(e) => handleChange('activitePhysique', e.target.value)}
              >
                <option value="sedentaire">Sédentaire</option>
                <option value="legere">Légère</option>
                <option value="moderee">Modérée</option>
                <option value="intense">Intense</option>
                <option value="tres_intense">Très intense</option>
              </select>
            </div>

            <div className="form-actions full-width">
              <button className="btn-save" onClick={handleSaveProfile}>
                💾 Enregistrer le profil
              </button>
            </div>
          </div>
        ) : (
          <div className="info-display">
            {user.profile ? (
              <>
                <div className="info-item">
                  <span className="info-label">Objectif:</span>
                  <span className="info-value">{getObjectifLabel(user.profile.objectif)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Taille / Poids:</span>
                  <span className="info-value">{user.profile.taille} cm / {user.profile.poids} kg</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Âge / Genre:</span>
                  <span className="info-value">{user.profile.age} ans / {user.profile.genre}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tour de taille:</span>
                  <span className="info-value">{user.profile.tourDeTaille} cm</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Repas par jour:</span>
                  <span className="info-value">{user.profile.nombreRepas}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Morphotype:</span>
                  <span className="info-value">{user.profile.morphotype}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Activité physique:</span>
                  <span className="info-value">{user.profile.activitePhysique}</span>
                </div>
              </>
            ) : (
              <p className="no-profile">Aucun profil nutritionnel configuré. Cliquez sur "Modifier" pour compléter votre profil.</p>
            )}
          </div>
        )}
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="profile-section">
          <h2>📊 Statistiques</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">📅</span>
              <span className="stat-label">Membre depuis</span>
              <span className="stat-value">{stats.memberSince}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔐</span>
              <span className="stat-label">Dernière connexion</span>
              <span className="stat-value">{stats.lastLogin}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📚</span>
              <span className="stat-label">Menus générés</span>
              <span className="stat-value">{stats.totalMenus}</span>
            </div>
          </div>
        </div>
      )}

      {/* Changement de mot de passe */}
      {user.provider === 'email' && (
        <div className="profile-section">
          <div className="section-header">
            <h2>🔐 Sécurité</h2>
            <button 
              className="btn-edit"
              onClick={() => setChangingPassword(!changingPassword)}
            >
              {changingPassword ? '✖ Annuler' : '🔒 Changer mot de passe'}
            </button>
          </div>

          {changingPassword && (
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Confirmer nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-actions full-width">
                <button className="btn-save" onClick={handleChangePassword}>
                  🔒 Changer le mot de passe
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zone dangereuse */}
      <div className="profile-section danger-zone">
        <h2>⚠️ Zone dangereuse</h2>
        <p>Une fois supprimé, votre compte ne pourra pas être récupéré.</p>
        <button className="btn-danger" onClick={handleDeleteAccount}>
          🗑️ Supprimer mon compte
        </button>
      </div>
    </div>
  )
}

const getObjectifLabel = (objectif) => {
  switch(objectif) {
    case 'perte': return '🎯 Perte de poids'
    case 'confort': return '💚 Confort digestif'
    case 'vitalite': return '⚡ Vitalité'
    default: return objectif
  }
}

export default Profile
