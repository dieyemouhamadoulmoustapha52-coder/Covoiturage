import { useState } from 'react'
import { updateProfile } from '../api'
import Navbar from '../components/Navbar'

export default function ProfilePage({ user, token, onLogout, onNavigate, onUserUpdate }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [message, setMessage] = useState(null)
  const [uploading, setUploading] = useState(false)

  function handleFileChange(event) {
    const file = event.target.files[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setMessage(null)
  }

  async function handleUpload(event) {
    event.preventDefault()
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Choisissez d’abord une image de carte étudiant.' })
      return
    }
    setUploading(true)
    setMessage(null)
    try {
      const formData = new FormData()
      formData.append('student_card', selectedFile)
      const data = await updateProfile(formData, token)
      onUserUpdate(data)
      setSelectedFile(null)
      setPreview(null)
      setMessage({
        type: 'success',
        text: 'Carte téléversée ! Un modérateur doit maintenant la vérifier.',
      })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="home-page profile-bg">
      <Navbar user={user} active="profile" onNavigate={onNavigate} onLogout={onLogout} />
      <main>
        <h2 className="page-title">👤 Mon profil</h2>

        <div className="card profile-card">
          <div className="profile-row">
            <span className="profile-label">Nom d'utilisateur</span>
            <span>{user.username}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span>{user.email || '—'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Rôle</span>
            <span>
              <span className={`badge ${user.role}`}>{user.role_display}</span>
            </span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Numéro de carte</span>
            <span>{user.student_card_number}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Téléphone</span>
            <span>{user.phone_number || '—'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Vérification</span>
            {user.is_verified ? (
              <span className="verified-badge">✅ Carte vérifiée</span>
            ) : (
              <span className="pending-badge">⏳ En attente de vérification</span>
            )}
          </div>
        </div>

        <h3 className="section-title">Carte étudiant</h3>
        <form className="card profile-card" onSubmit={handleUpload}>
          {user.student_card ? (
            <div className="card-preview">
              <p className="card-current">Photo actuelle :</p>
              <a href={user.student_card} target="_blank" rel="noreferrer">
                <img src={user.student_card} alt="Carte étudiant actuelle" />
              </a>
            </div>
          ) : (
            <p className="empty">Aucune carte téléversée pour le moment.</p>
          )}

          <label htmlFor="card-file">
            {user.student_card ? 'Remplacer la carte' : 'Téléverser ma carte étudiant'}
          </label>
          <input
            id="card-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {preview && (
            <div className="card-preview">
              <img src={preview} alt="Aperçu de la carte" />
            </div>
          )}
          {!user.is_verified && (
            <p className="hint">
              ℹ️ Après le téléversement, un modérateur vérifiera votre carte. Vous ne pourrez
              publier de trajet qu'une fois celle-ci vérifiée.
            </p>
          )}
          {message && <p className={`message ${message.type}`}>{message.text}</p>}
          <button type="submit" disabled={uploading}>
            {uploading ? 'Envoi...' : 'Enregistrer la carte'}
          </button>
        </form>
      </main>
    </div>
  )
}
