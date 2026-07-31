import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 560, margin: '80px auto', padding: 24, textAlign: 'center' }}>
          <h1>🚗 TrajetCampus</h1>
          <p>Une erreur est survenue pendant le chargement de l'application.</p>
          <p style={{ fontSize: 14 }}>
            {String(this.state.error)} — vérifie la console du navigateur (F12) pour le détail.
          </p>
          <button onClick={() => window.location.reload()}>Recharger la page</button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
