import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TripsPage from './pages/TripsPage'
import DashboardPage from './pages/DashboardPage'
import ModerationPage from './pages/ModerationPage'
import ProfilePage from './pages/ProfilePage'

const TOKEN_KEY = 'trajetcampus_token'
const USER_KEY = 'trajetcampus_user'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY)
    return saved ? JSON.parse(saved) : null
  })
  const [page, setPage] = useState('login')
  const [view, setView] = useState('trips')

  function handleAuth(data) {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setPage('login')
    setView('trips')
  }

  function handleUserUpdate(updatedUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  if (token && user) {
    if (view === 'moderation' && user.is_moderator) {
      return (
        <ModerationPage user={user} token={token} onLogout={handleLogout} onNavigate={setView} />
      )
    }
    if (view === 'dashboard') {
      return <DashboardPage user={user} token={token} onLogout={handleLogout} onNavigate={setView} />
    }
    if (view === 'profile') {
      return (
        <ProfilePage
          user={user}
          token={token}
          onLogout={handleLogout}
          onNavigate={setView}
          onUserUpdate={handleUserUpdate}
        />
      )
    }
    return <TripsPage user={user} token={token} onLogout={handleLogout} onNavigate={setView} />
  }

  if (page === 'login') {
    return <LoginPage onAuth={handleAuth} onGoRegister={() => setPage('register')} />
  }
  return <RegisterPage onAuth={handleAuth} onGoLogin={() => setPage('login')} />
}
