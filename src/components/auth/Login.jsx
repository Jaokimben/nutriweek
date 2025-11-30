import { useState } from 'react'
import { login, loginWithGoogle } from '../../utils/authService'
import './Auth.css'

const Login = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = login(email, password)
    
    if (result.success) {
      onSuccess(result.user)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
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
          <h2>Connexion</h2>
          <p>Bienvenue ! Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
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
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OU</span>
        </div>

        <button 
          className="btn-auth btn-google"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span className="google-icon">🔵</span>
          Continuer avec Google
        </button>

        <div className="auth-footer">
          <p>
            Pas encore de compte ?{' '}
            <button 
              className="link-button"
              onClick={onSwitchToRegister}
            >
              S'inscrire
            </button>
          </p>
        </div>

        <div className="demo-hint">
          💡 <strong>Démo:</strong> email: demo@test.com | mot de passe: demo123
        </div>
      </div>
    </div>
  )
}

export default Login
