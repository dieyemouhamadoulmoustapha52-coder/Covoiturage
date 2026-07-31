import { useState } from 'react'
import { login } from '../api'

export default function LoginPage({ onAuth, onGoRegister }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(username, password)
      onAuth(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page login-bg">
      <form className="card" onSubmit={handleSubmit}>
        <h1>🚗 TrajetCampus</h1>
        <p className="subtitle">Covoiturage ISEP — Connexion</p>
        <label htmlFor="username">Nom d'utilisateur</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <p className="switch">
          Pas encore de compte ?{' '}
          <button type="button" className="link" onClick={onGoRegister}>
            Créer un compte
          </button>
        </p>
      </form>
    </div>
  )
}
