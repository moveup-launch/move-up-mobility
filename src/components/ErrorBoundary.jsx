import { Component } from 'react';

// Filet de sécurité racine : sans lui, une erreur de rendu React fait
// disparaître tout le DOM (écran blanc silencieux, comme lors du rejet
// Apple Guideline 2.1a) sans que rien ne s'affiche ni ne remonte à l'utilisateur.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: '32px 24px',
          textAlign: 'center', gap: 12, background: '#fff', color: '#1a1a1a',
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Un problème est survenu</div>
          <div style={{ fontSize: 14, color: '#666', maxWidth: 360 }}>
            L'application a rencontré une erreur inattendue. Veuillez réessayer.
          </div>
          <div style={{ fontSize: 12, color: '#999', maxWidth: 360, wordBreak: 'break-word' }}>
            {this.state.error?.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8, padding: '10px 20px', borderRadius: 10, border: 'none',
              background: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
