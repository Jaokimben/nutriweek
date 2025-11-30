import { useState } from 'react'
import { register, loginWithGoogle } from '../../utils/authService'
import './Auth.css'

const Register = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('') // Clear error on input change
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Tous les champs sont requis')
      return false
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    const result = register(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    )
    
    if (result.success) {
      onSuccess(result.user)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleGoogleRegister = async () => {
    setError('')
    setLoading(true)

    const result = await loginWithGoogle()
    
    if (result.success) {
      onSuccess(result.user)
    } else {
      setError(result.error || 'Erreur connexion Google')
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🍽️ NutriWeek</h1>
          <h2>Inscription</h2>
          <p>Créez votre compte pour commencer</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Jean"
                autoComplete="given-name"
                style={{ color: '#2c3e50' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Dupont"
                autoComplete="family-name"
                style={{ color: '#2c3e50' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="votre@email.com"
              required
              autoFocus
              autoComplete="email"
              style={{ color: '#2c3e50' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              style={{ color: '#2c3e50' }}
            />
            <span className="input-hint">Minimum 6 caractères</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              style={{ color: '#2c3e50' }}
            />
          </div>

          {error && (
            <div className="auth-error">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-auth btn-primary"
            disabled={loading}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OU</span>
        </div>

        <button 
          className="btn-auth btn-google"
          onClick={handleGoogleRegister}
          disabled={loading}
        >
          <span className="google-icon">🔵</span>
          S'inscrire avec Google
        </button>

        <div className="auth-footer">
          <p>
            Vous avez déjà un compte ?{' '}
            <button 
              className="link-button"
              onClick={onSwitchToLogin}
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
