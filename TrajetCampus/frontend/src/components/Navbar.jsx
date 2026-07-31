export default function Navbar({ user, active, onNavigate, onLogout }) {
  return (
    <header className="navbar">
      <span className="brand">🚗 TrajetCampus</span>
      <nav className="nav-tabs">
        <button
          className={active === 'trips' ? 'tab active' : 'tab'}
          onClick={() => onNavigate('trips')}
        >
          🔍 Rechercher
        </button>
        <button
          className={active === 'dashboard' ? 'tab active' : 'tab'}
          onClick={() => onNavigate('dashboard')}
        >
          🎛️ Mon tableau de bord
        </button>
        <button
          className={active === 'profile' ? 'tab active' : 'tab'}
          onClick={() => onNavigate('profile')}
        >
          👤 Mon profil
        </button>
        {user.is_moderator && (
          <button
            className={active === 'moderation' ? 'tab active' : 'tab'}
            onClick={() => onNavigate('moderation')}
          >
            🛡️ Modération
          </button>
        )}
      </nav>
      <div className="nav-right">
        <span className="nav-user">
          {user.username} · <span className={`badge ${user.role}`}>{user.role_display}</span>
        </span>
        <button className="logout" onClick={onLogout}>
          Se déconnecter
        </button>
      </div>
    </header>
  )
}
