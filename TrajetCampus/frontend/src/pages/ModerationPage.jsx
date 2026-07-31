import { useEffect, useState } from 'react'
import {
  fetchAlerts,
  fetchModerationUsers,
  fetchReport,
  reinstateUser,
  resolveReport,
  suspendUser,
  toggleVerify,
} from '../api'
import Navbar from '../components/Navbar'
import { formatDate } from '../regions'

export default function ModerationPage({ user, token, onLogout, onNavigate }) {
  const [alerts, setAlerts] = useState([])
  const [users, setUsers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  async function loadAlerts() {
    setLoading(true)
    try {
      setAlerts(await fetchAlerts(token))
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    try {
      setUsers(await fetchModerationUsers(token))
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  useEffect(() => {
    loadAlerts()
    loadUsers()
  }, [])

  async function openAlert(alert) {
    setMessage(null)
    setSelectedId(alert.id)
    setDetail(null)
    try {
      setDetail(await fetchReport(alert.report_id, token))
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function doAction(action, successText) {
    setMessage(null)
    try {
      await action()
      setMessage({ type: 'success', text: successText })
      setDetail(await fetchReport(detail.report_id, token))
      await loadAlerts()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function handleToggleVerify(target) {
    setMessage(null)
    try {
      const result = await toggleVerify(target.id, token)
      setMessage({
        type: 'success',
        text: result.is_verified
          ? `${result.username} est maintenant vérifié(e).`
          : `Vérification retirée pour ${result.username}.`,
      })
      await loadUsers()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const unread = alerts.filter((a) => !a.is_read).length
  const sorted = [...alerts].sort((a, b) => Number(a.is_read) - Number(b.is_read))

  return (
    <div className="home-page mod-bg">
      <Navbar user={user} active="moderation" onNavigate={onNavigate} onLogout={onLogout} />
      <main>
        <h2 className="page-title">🛡️ Modération</h2>

        {message && <p className={`message ${message.type}`}>{message.text}</p>}

        <h3 className="section-title">
          Alertes ({alerts.length}{unread ? ` — ${unread} non lue(s)` : ''})
        </h3>
        {loading ? (
          <p className="empty">Chargement...</p>
        ) : alerts.length === 0 ? (
          <p className="empty">Aucune alerte pour le moment.</p>
        ) : (
          <div className="mod-layout">
            <div className="mod-list">
              {sorted.map((a) => (
                <button
                  key={a.id}
                  className={selectedId === a.id ? 'alert-item selected' : 'alert-item'}
                  onClick={() => openAlert(a)}
                >
                  <span className="alert-title">
                    {!a.is_read && <span className="dot" />} {a.reason_display}
                  </span>
                  <span className="alert-meta">
                    {a.trip_label} · {a.reporter_username} · {formatDate(a.created_at)}
                  </span>
                </button>
              ))}
            </div>
            <div className="mod-detail">
              {!detail ? (
                <p className="empty">Cliquez sur une alerte pour l'examiner.</p>
              ) : (
                <>
                  <div className="detail-head">
                    <h4>{detail.reason_display}</h4>
                    {detail.resolved ? (
                      <span className="res-status resolved">✔ Signalement clôturé</span>
                    ) : (
                      <span className="res-status open">En cours</span>
                    )}
                  </div>
                  <div className="res-details">
                    <span>Signalé par : {detail.reporter_username}</span>
                    <span>Trajet : {detail.trip_label}</span>
                  </div>
                  <div className="res-details">
                    <span>Conducteur : {detail.driver_username}</span>
                    <span>Le {formatDate(detail.created_at)}</span>
                  </div>
                  {detail.description && <p className="report-desc">{detail.description}</p>}
                  <div className="note-actions">
                    {!detail.resolved && (
                      <button
                        className="accept"
                        onClick={() =>
                          doAction(
                            () => resolveReport(detail.report_id, token),
                            'Signalement clôturé.',
                          )
                        }
                      >
                        ✔ Clôturer le signalement
                      </button>
                    )}
                    {detail.reporter_suspended ? (
                      <button
                        className="accept"
                        onClick={() =>
                          doAction(
                            () => reinstateUser(detail.reporter_id, token),
                            `${detail.reporter_username} réactivé.`,
                          )
                        }
                      >
                        ✅ Réactiver le compte ({detail.reporter_username})
                      </button>
                    ) : (
                      <button
                        className="refuse"
                        onClick={() =>
                          doAction(
                            () => suspendUser(detail.reporter_id, token),
                            `${detail.reporter_username} suspendu 7 jours.`,
                          )
                        }
                      >
                        ⛔ Suspendre le compte ({detail.reporter_username})
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <h3 className="section-title">
          Cartes étudiant ({users.length} utilisateurs)
        </h3>
        <div className="mod-list">
          {users.map((u) => (
            <div key={u.id} className="user-card-row">
              <div className="user-card-thumb">
                {u.student_card ? (
                  <a href={u.student_card} target="_blank" rel="noreferrer">
                    <img src={u.student_card} alt={`Carte de ${u.username}`} />
                  </a>
                ) : (
                  <span className="no-card">Aucune carte</span>
                )}
              </div>
              <div className="user-card-info">
                <span className="user-card-name">
                  {u.username} <span className={`badge ${u.role}`}>{u.role_display}</span>
                </span>
                <span className="alert-meta">
                  {u.student_card_number} · inscrit le {formatDate(u.date_joined)}
                </span>
              </div>
              <div className="user-card-actions">
                {u.is_verified ? (
                  <span className="verified-badge">✅ Vérifiée</span>
                ) : (
                  <span className="pending-badge">⏳ Non vérifiée</span>
                )}
                {u.student_card && (
                  <button
                    className={u.is_verified ? 'refuse small' : 'accept small'}
                    onClick={() => handleToggleVerify(u)}
                  >
                    {u.is_verified ? 'Retirer la vérification' : 'Vérifier'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
