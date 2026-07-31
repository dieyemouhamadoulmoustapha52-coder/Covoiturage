import { useState } from 'react'
import { register } from '../api'

export default function RegisterPage({ onAuth, onGoLogin }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    student_card_number: '',
    phone_number: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register(form)
      onAuth(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>🚗 TrajetCampus</h1>
        <p className="subtitle">Créer un compte</p>
        <label htmlFor="username">Nom d'utilisateur</label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <label htmlFor="password">Mot de passe (8 caractères min.)</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <label htmlFor="role">Vous êtes</label>
        <select id="role" name="role" value={form.role} onChange={handleChange}>
          <option value="student">Étudiant</option>
          <option value="teacher">Enseignant</option>
        </select>
        <label htmlFor="card">Numéro de carte étudiant</label>
        <input
          id="card"
          name="student_card_number"
          value={form.student_card_number}
          onChange={handleChange}
          required
        />
        <label htmlFor="phone">Téléphone (facultatif)</label>
        <input
          id="phone"
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
        <p className="switch">
          Déjà un compte ?{' '}
          <button type="button" className="link" onClick={onGoLogin}>
            Se connecter
          </button>
        </p>
      </form>
    </div>
  )
}
