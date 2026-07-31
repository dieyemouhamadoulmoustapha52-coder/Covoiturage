const BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  let body = options.body
  if (body && !(body instanceof FormData)) {
    if (typeof body !== 'string') body = JSON.stringify(body)
    headers['Content-Type'] = 'application/json'
  }
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers, body })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message =
      data.detail || Object.values(data).flat().join(' ') || 'Une erreur est survenue.'
    throw new Error(message)
  }
  return data
}

export function login(username, password) {
  return request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function register(payload) {
  return request('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchTrips(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/trips/${query ? `?${query}` : ''}`)
}

export function createTrip(payload, token) {
  return request('/trips/', {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
    body: JSON.stringify(payload),
  })
}

export function createReservation(tripId, token) {
  return request(`/trips/${tripId}/reservations/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
  })
}

export function fetchReservations(token) {
  return request('/reservations/', {
    headers: { Authorization: `Token ${token}` },
  })
}

export function updateReservation(reservationId, status, token) {
  return request(`/reservations/${reservationId}/`, {
    method: 'PATCH',
    headers: { Authorization: `Token ${token}` },
    body: JSON.stringify({ status }),
  })
}

export function startTrip(tripId, token) {
  return request(`/trips/${tripId}/start/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
  })
}

export function finishTrip(tripId, token) {
  return request(`/trips/${tripId}/finish/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
  })
}

export function shareLocation(tripId, latitude, longitude, token) {
  return request(`/trips/${tripId}/locations/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
    body: JSON.stringify({ latitude, longitude }),
  })
}

export function fetchLatestLocation(tripId, token) {
  return request(`/trips/${tripId}/locations/latest/`, {
    headers: { Authorization: `Token ${token}` },
  })
}

export function fetchPayments(token) {
  return request('/payments/', {
    headers: { Authorization: `Token ${token}` },
  })
}

export function createRating(reservationId, rating, comment, token) {
  return request(`/reservations/${reservationId}/rating/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
    body: JSON.stringify({ rating, comment }),
  })
}

export function fetchUserRating(userId, token) {
  return request(`/users/${userId}/rating/`, {
    headers: { Authorization: `Token ${token}` },
  })
}

export function createReport(tripId, reason, description, token) {
  return request(`/trips/${tripId}/reports/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
    body: JSON.stringify({ reason, description }),
  })
}

export function fetchAlerts(token) {
  return request('/moderation/alerts/', {
    headers: { Authorization: `Token ${token}` },
  })
}

export function fetchReport(reportId, token) {
  return request(`/moderation/reports/${reportId}/`, {
    headers: { Authorization: `Token ${token}` },
  })
}

export function resolveReport(reportId, token) {
  return request(`/moderation/reports/${reportId}/resolve/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
  })
}

export function suspendUser(userId, token) {
  return request(`/moderation/users/${userId}/suspend/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
  })
}

export function reinstateUser(userId, token) {
  return request(`/moderation/users/${userId}/reinstate/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
  })
}

export function fetchProfile(token) {
  return request('/auth/profile/', {
    headers: { Authorization: `Token ${token}` },
  })
}

export function updateProfile(formData, token) {
  return request('/auth/profile/', {
    method: 'PATCH',
    headers: { Authorization: `Token ${token}` },
    body: formData,
  })
}

export function fetchModerationUsers(token) {
  return request('/moderation/users/', {
    headers: { Authorization: `Token ${token}` },
  })
}

export function toggleVerify(userId, token) {
  return request(`/moderation/users/${userId}/verify/`, {
    method: 'POST',
    headers: { Authorization: `Token ${token}` },
  })
}
