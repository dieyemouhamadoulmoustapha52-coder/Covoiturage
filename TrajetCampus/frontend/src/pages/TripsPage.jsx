import { useEffect, useState } from 'react'
import { createReservation, createTrip, fetchTrips } from '../api'
import { REGIONS } from '../regions'
import TripCard from '../components/TripCard'
import Navbar from '../components/Navbar'

export default function TripsPage({ user, token, onLogout, onNavigate }) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [reservedIds, setReservedIds] = useState([])
  const [showForm, setShowForm] = useState(false)

  const [filters, setFilters] = useState({ departure_region: '', arrival_region: '' })
  const [form, setForm] = useState({
    departure_region: 'Dakar',
    arrival_region: 'Dakar',
    departure_time: '',
    available_seats: 1,
    price_per_seat: '',
  })

  async function loadTrips(params = {}) {
    setLoading(true)
    setMessage(null)
    try {
      const data = await fetchTrips(params)
      setTrips(data.results || data)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrips()
  }, [])

  function handleSearch(event) {
    event.preventDefault()
    const params = {}
    if (filters.departure_region) params.departure_region = filters.departure_region
    if (filters.arrival_region) params.arrival_region = filters.arrival_region
    loadTrips(params)
  }

  function handleFormChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function handleTogglePublish() {
    if (!user.is_verified) {
      setMessage({
        type: 'error',
        text: "⚠️ Votre carte étudiant doit être vérifiée par un modérateur avant de publier un trajet. Téléversez-la depuis « 👤 Mon profil ».",
      })
      setShowForm(false)
      return
    }
    setShowForm(!showForm)
  }

  async function handlePublish(event) {
    event.preventDefault()
    setMessage(null)
    try {
      await createTrip(form, token)
      setMessage({ type: 'success', text: 'Trajet publié !' })
      setShowForm(false)
      setForm({
        departure_region: 'Dakar',
        arrival_region: 'Dakar',
        departure_time: '',
        available_seats: 1,
        price_per_seat: '',
      })
      loadTrips()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  async function handleReserve(trip) {
    setMessage(null)
    try {
      await createReservation(trip.id, token)
      setReservedIds([...reservedIds, trip.id])
      setMessage({
        type: 'success',
        text: `Demande envoyée à ${trip.driver_username} pour le trajet ${trip.departure_region} → ${trip.arrival_region}.`,
      })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="home-page trips-bg">
      <Navbar user={user} active="trips" onNavigate={onNavigate} onLogout={onLogout} />

      <main>
        <div className="hero">
          <h1>🚗 TrajetCampus</h1>
          <p>Le covoiturage du campus ISEP — trouvez un trajet ou publiez le vôtre</p>
        </div>

        <form className="card search-card" onSubmit={handleSearch}>
          <h2>🔍 Trouver un trajet</h2>
          <div className="search-row">
            <div>
              <label htmlFor="dep">Départ</label>
              <select
                id="dep"
                value={filters.departure_region}
                onChange={(e) => setFilters({ ...filters, departure_region: e.target.value })}
              >
                <option value="">Toutes les régions</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="arr">Arrivée</label>
              <select
                id="arr"
                value={filters.arrival_region}
                onChange={(e) => setFilters({ ...filters, arrival_region: e.target.value })}
              >
                <option value="">Toutes les régions</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="search-btn">
              Rechercher
            </button>
          </div>
        </form>

        <div className="actions-row">
          <h2>Trajets disponibles</h2>
          <button className="toggle-publish" onClick={handleTogglePublish}>
            {showForm ? 'Fermer' : '＋ Publier un trajet'}
          </button>
        </div>

        {showForm && (
          <form className="card publish-card" onSubmit={handlePublish}>
            <h3>Publier un trajet</h3>
            <div className="search-row">
              <div>
                <label htmlFor="pdep">Départ</label>
                <select id="pdep" name="departure_region" value={form.departure_region} onChange={handleFormChange}>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="parr">Arrivée</label>
                <select id="parr" name="arrival_region" value={form.arrival_region} onChange={handleFormChange}>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="search-row">
              <div>
                <label htmlFor="ptime">Départ le</label>
                <input
                  id="ptime"
                  name="departure_time"
                  type="datetime-local"
                  value={form.departure_time}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="pseats">Places</label>
                <input
                  id="pseats"
                  name="available_seats"
                  type="number"
                  min="1"
                  value={form.available_seats}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="pprice">Prix (FCFA)</label>
                <input
                  id="pprice"
                  name="price_per_seat"
                  type="number"
                  min="0"
                  value={form.price_per_seat}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="search-btn">
              Publier
            </button>
          </form>
        )}

        {message && <p className={`message ${message.type}`}>{message.text}</p>}

        {loading ? (
          <p className="empty">Chargement des trajets...</p>
        ) : trips.length === 0 ? (
          <p className="empty">Aucun trajet trouvé pour ces critères.</p>
        ) : (
          <div className="trips-list">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onReserve={handleReserve}
                reserved={reservedIds.includes(trip.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
