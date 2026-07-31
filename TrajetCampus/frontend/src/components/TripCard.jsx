import { formatDate } from '../regions'

export default function TripCard({ trip, onReserve, reserved }) {
  return (
    <div className="trip-card">
      <div className="trip-route">
        <div className="route-points">
          <span className="point">{trip.departure_region}</span>
          <span className="arrow">→</span>
          <span className="point">{trip.arrival_region}</span>
        </div>
        <div className="trip-time">{formatDate(trip.departure_time)}</div>
      </div>
      <div className="trip-details">
        <span>
          🚗 {trip.driver_username}{' '}
          <span className="rating-badge">
            {trip.driver_rating && trip.driver_rating.average
              ? `⭐ ${trip.driver_rating.average} (${trip.driver_rating.count})`
              : '⭐ nouveau'}
          </span>
        </span>
        <span>🪑 {trip.available_seats} place(s)</span>
        <span className="price">{trip.price_per_seat} FCFA</span>
      </div>
      <button
        className="reserve"
        onClick={() => onReserve(trip)}
        disabled={reserved}
      >
        {reserved ? 'Demande envoyée ✓' : 'Réserver'}
      </button>
    </div>
  )
}
