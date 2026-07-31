import { useState } from 'react'
import { login } from '../api'

const TEST_ACCOUNTS = [
  { label: 'Admin — superuser', username: 'admin', password: 'Admin123!' },
  { label: 'modo — modérateur', username: 'modo', password: 'Modo12345!' },
  { label: 'Fatou — conductrice vérifiée', username: 'Fatou', password: 'Secret12345' },
  { label: 'Moustapha — étudiant, carte à vérifier', username: 'Moustapha', password: 'Test12345!' },
  { label: 'Ali — enseignant', username: 'Ali', password: 'Test12345!' },
  { label: 'Astou — compte suspendu', username: 'Astou', password: 'Test12345!', hint: '⛔ Connexion refusée (403)' },
  { label: 'Bintou — compte bloqué', username: 'Bintou', password: 'Test12345!', hint: '⛔ Connexion refusée (401)' },
]

export default function LoginPage({ onAuth, onGoRegister }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function quickFill(account) {
    setUsername(account.username)
    setPassword(account.password)
    setError('')
  }

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
      {import.meta.env.DEV && (
        <aside className="test-help">
          <h2>🧪 Comptes de test (seed_demo)</h2>
          <p className="test-help-note">
            Un clic sur un compte remplit le formulaire.
          </p>
          {TEST_ACCOUNTS.map((account) => (
            <button
              key={account.username}
              type="button"
              className="test-help-row"
              onClick={() => quickFill(account)}
            >
              <span className="test-help-name">{account.label}</span>
              <code className="test-help-creds">
                {account.username} / {account.password}
              </code>
              {account.hint && (
                <span className="test-help-hint">{account.hint}</span>
              )}
            </button>
          ))}
        </aside>
      )}
    </div>
  )
}
