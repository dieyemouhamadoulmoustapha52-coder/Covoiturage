import { useEffect, useState } from 'react'
import {
  createRating,
  createReport,
  fetchLatestLocation,
  fetchPayments,
  fetchReservations,
  fetchUserRating,
  finishTrip,
  shareLocation,
  startTrip,
  updateReservation,
} from '../api'
import Navbar from '../components/Navbar'
import { formatDate } from '../regions'

const STATUS_LABELS = {
  pending: '⏳ En attente',
  accepted: '✅ Acceptée',
  refused: '❌ Refusée',
  cancelled: '🚫 Annulée',
}

const METHOD_LABELS = {
  wave: 'Wave',
  orange: 'Orange Money',
}

const REPORT_REASONS = [
  { value: 'dangerous_driving', label: '🚗 Conduite dangereuse' },
  { value: 'harassment', label: '🛑 Harcèlement' },
  { value: 'fraud', label: '💳 Fraude' },
  { value: 'other', label: '📝 Autre' },
]

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= (hover || value) ? 'star on' : 'star'}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function DashboardPage({ user, token, onLogout, onNavigate }) {
  const [reservations, setReservations] = useState([])
  const [payments, setPayments] = useState([])
  const [myRating, setMyRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [locationForm, setLocationForm] = useState({ latitude: '', longitude: '' })
  const [ratingForm, setRatingForm] = useState(null)
  const [reportForm, setReportForm] = useState(null)
  const [reportedTripIds, setReportedTripIds] = useState([])

  async function loadAll() {
    setLoading(true)
    setMessage(null)
    try {
      const [res, pays, rating] = await Promise.all([
        fetchReservations(token),
        fetchPayments(token),
        fetchUserRating(user.id, token),
      ])
      setReservations(res)
      setPayments(pays)
      setMyRating(rating)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function changeStatus(reservation, status) {
    setMessage(null)
    try {
      await updateReservation(reservation.id, status, token)
      const labels = { accepted: 'acceptée', refused: 'refusée', cancelled: 'annulée' }
      setMessage({ type: 'success', text: `Réservation ${labels[status]} !` })
      await loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function handleStart(tripId) {
    setMessage(null)
    try {
      await startTrip(tripId, token)
      setMessage({ type: 'success', text: 'Trajet démarré ! Le partage GPS est maintenant actif.' })
      await loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function handleFinish(tripId) {
    setMessage(null)
    try {
      await finishTrip(tripId, token)
      setMessage({ type: 'success', text: 'Trajet terminé. Le passager peut maintenant payer.' })
      await loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function handleShare(tripId) {
    setMessage(null)
    const latitude = Number(locationForm.latitude)
    const longitude = Number(locationForm.longitude)
    if (!latitude || !longitude) {
      setMessage({ type: 'error', text: 'Renseignez la latitude et la longitude.' })
      return
    }
    try {
      await shareLocation(tripId, latitude, longitude, token)
      setMessage({ type: 'success', text: `Position ${latitude}, ${longitude} partagée !` })
      setLocationForm({ latitude: '', longitude: '' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function handleTrack(tripId) {
    setMessage(null)
    try {
      const loc = await fetchLatestLocation(tripId, token)
      setMessage({
        type: 'success',
        text: `📍 Le conducteur est à : ${loc.latitude}, ${loc.longitude}`,
      })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function handleRate() {
    setMessage(null)
    if (!ratingForm.rating) {
      setMessage({ type: 'error', text: 'Choisissez une note (1 à 5 étoiles).' })
      return
    }
    try {
      await createRating(ratingForm.reservation.id, ratingForm.rating, ratingForm.comment, token)
      setMessage({
        type: 'success',
        text: `Note ${ratingForm.rating}/5 envoyée, merci !`,
      })
      setRatingForm(null)
      await loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function handleReport() {
    setMessage(null)
    if (!reportForm.reason) {
      setMessage({ type: 'error', text: 'Choisissez un motif de signalement.' })
      return
    }
    try {
      await createReport(
        reportForm.reservation.trip,
        reportForm.reason,
        reportForm.description,
        token,
      )
      setMessage({
        type: 'success',
        text: 'Signalement envoyé. Un modérateur va l’examiner.',
      })
      setReportedTripIds((ids) => [...ids, reportForm.reservation.trip])
      setReportForm(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  function isDriver(reservation) {
    return reservation.driver_username === user.username
  }

  function renderActions(reservation) {
    const buttons = []
    if (reservation.status === 'pending') {
      if (isDriver(reservation)) {
        buttons.push(
          <button key="a" className="accept" onClick={() => changeStatus(reservation, 'accepted')}>
            Accepter
          </button>,
          <button key="r" className="refuse" onClick={() => changeStatus(reservation, 'refused')}>
            Refuser
          </button>,
        )
      } else {
        buttons.push(
          <button key="c" className="refuse" onClick={() => changeStatus(reservation, 'cancelled')}>
            Annuler ma demande
          </button>,
        )
      }
    }
    if (reservation.status === 'accepted' && isDriver(reservation)) {
      if (reservation.trip_status === 'scheduled') {
        buttons.push(
          <button key="s" className="accept" onClick={() => handleStart(reservation.trip)}>
            ▶ Démarrer le trajet
          </button>,
        )
      }
      if (reservation.trip_status === 'ongoing') {
        buttons.push(
          <div key="gps" className="gps-box">
            <div className="gps-inputs">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={locationForm.latitude}
                onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={locationForm.longitude}
                onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
              />
              <button className="accept small" onClick={() => handleShare(reservation.trip)}>
                📡 Partager ma position
              </button>
            </div>
            <button className="refuse" onClick={() => handleFinish(reservation.trip)}>
              ⏹ Terminer le trajet
            </button>
          </div>,
        )
      }
    }
    if (reservation.status === 'accepted' && !isDriver(reservation) && reservation.trip_status === 'ongoing') {
      buttons.push(
        <button key="t" className="accept" onClick={() => handleTrack(reservation.trip)}>
          📍 Voir la position du conducteur
        </button>,
      )
    }
    if (reservation.status === 'accepted' && reservation.trip_status === 'finished') {
      if (ratingForm && ratingForm.reservation.id === reservation.id) {
        buttons.push(
          <div key="stars" className="note-box">
            <StarPicker
              value={ratingForm.rating}
              onChange={(n) => setRatingForm({ ...ratingForm, rating: n })}
            />
            <textarea
              placeholder="Un petit commentaire (optionnel)"
              value={ratingForm.comment}
              onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
            />
            <div className="note-actions">
              <button className="accept" onClick={handleRate}>
                Envoyer la note
              </button>
              <button className="refuse" onClick={() => setRatingForm(null)}>
                Annuler
              </button>
            </div>
          </div>,
        )
      } else if (!reservation.rated_by_me) {
        buttons.push(
          <button
            key="rate"
            className="accept"
            onClick={() => setRatingForm({ reservation, rating: 0, comment: '' })}
          >
            ⭐ Noter
          </button>,
        )
      }
    }
    if (
      !isDriver(reservation) &&
      reservation.status === 'accepted' &&
      (reservation.trip_status === 'ongoing' || reservation.trip_status === 'finished')
    ) {
      if (reportForm && reportForm.reservation.id === reservation.id) {
        buttons.push(
          <div key="report" className="note-box">
            <div className="report-reasons">
              {REPORT_REASONS.map((r) => (
                <label key={r.value} className="radio-label">
                  <input
                    type="radio"
                    name={`reason-${reservation.id}`}
                    value={r.value}
                    checked={reportForm.reason === r.value}
                    onChange={() => setReportForm({ ...reportForm, reason: r.value })}
                  />
                  {r.label}
                </label>
              ))}
            </div>
            <textarea
              placeholder="Décrivez l'incident (optionnel)"
              value={reportForm.description}
              onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
            />
            <div className="note-actions">
              <button className="refuse" onClick={handleReport}>
                Envoyer le signalement
              </button>
              <button className="accept" onClick={() => setReportForm(null)}>
                Annuler
              </button>
            </div>
          </div>,
        )
      } else if (!reportedTripIds.includes(reservation.trip)) {
        buttons.push(
          <button
            key="report"
            className="refuse"
            onClick={() => setReportForm({ reservation, reason: '', description: '' })}
          >
            ⚠️ Signaler un incident
          </button>,
        )
      } else {
        buttons.push(
          <span key="reported" className="reported">
            🛡️ Incident signalé — le modérateur va examiner.
          </span>,
        )
      }
    }
    return buttons
  }

  const totalReceived = payments
    .filter((p) => p.driver_username === user.username)
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = payments
    .filter((p) => p.passenger_username === user.username)
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="home-page dash-bg">
      <Navbar user={user} active="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      <main>
        <h2 className="page-title">🎛️ Mon tableau de bord</h2>

        {myRating && (
          <p className="my-rating">
            {myRating.average
              ? `⭐ Ma note moyenne : ${myRating.average}/5 (${myRating.count} avis)`
              : '⭐ Pas encore d’avis sur mon compte.'}
          </p>
        )}

        {message && <p className={`message ${message.type}`}>{message.text}</p>}

        <h3 className="section-title">Mes réservations ({reservations.length})</h3>
        {loading ? (
          <p className="empty">Chargement...</p>
        ) : reservations.length === 0 ? (
          <p className="empty">Aucune réservation pour le moment.</p>
        ) : (
          <div className="res-list">
            {reservations.map((res) => (
              <div key={res.id} className="card res-card">
                <div className="res-head">
                  <span className="route">
                    {res.trip_departure} → {res.trip_arrival}
                  </span>
                  <span className={`res-status ${res.status}`}>{STATUS_LABELS[res.status]}</span>
                </div>
                <div className="res-details">
                  <span>
                    {isDriver(res)
                      ? `Passager : ${res.passenger_username}`
                      : `Conducteur : ${res.driver_username}`}
                  </span>
                  <span>🕒 {formatDate(res.trip_time)}</span>
                </div>
                {renderActions(res)}
              </div>
            ))}
          </div>
        )}

        <h3 className="section-title">Mes paiements ({payments.length})</h3>
        {payments.length === 0 ? (
          <p className="empty">Aucun paiement pour le moment.</p>
        ) : (
          <div className="res-list">
            {payments.map((p) => (
              <div key={p.id} className="card pay-card">
                <div className="res-head">
                  <span className="pay-method">{METHOD_LABELS[p.method] || p.method}</span>
                  <span className="price">{p.amount} FCFA</span>
                </div>
                <div className="res-details">
                  <span>
                    {p.driver_username === user.username
                      ? `Reçu de ${p.passenger_username}`
                      : `Payé à ${p.driver_username}`}
                  </span>
                  <span>#{p.reference}</span>
                </div>
              </div>
            ))}
            {totalReceived > 0 && (
              <p className="total">
                Total reçu : <strong>{totalReceived} FCFA</strong>
              </p>
            )}
            {totalPaid > 0 && (
              <p className="total">
                Total payé : <strong>{totalPaid} FCFA</strong>
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
