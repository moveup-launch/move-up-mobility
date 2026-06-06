import { useApp } from '../context/AppContext';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function TopBar() {
  const { lang, setLang, user, signOut, viewMode, setViewMode, startNewVisit } = useApp();
  const isDesktop = useIsDesktop();
  const isFr = lang === 'fr';

  return (
    <div className={`topbar${isDesktop ? ' topbar-desktop' : ''}`}>
      <div className="topbar-brand">
        <div className="topbar-logo">📦</div>
        <div className="topbar-brand-text">
          <span className="topbar-title">Move Up</span>
          <span className="topbar-title-suffix"> Mobility</span>
        </div>
      </div>
      <div className="topbar-actions">
        {!isDesktop && user && viewMode !== 'dashboard' && (
          <button className="topbar-icon-btn" onClick={() => setViewMode('dashboard')} title={isFr ? 'Accueil' : 'Home'}>
            🏠
          </button>
        )}
        {!isDesktop && user && (
          <button className="topbar-icon-btn" onClick={() => setViewMode('agenda')} title={isFr ? 'Agenda' : 'Agenda'}
            style={{ opacity: viewMode === 'agenda' ? 1 : 0.7 }}>
            📅
          </button>
        )}
        {!isDesktop && user && (
          <button className="topbar-icon-btn" onClick={() => setViewMode('history')} title={isFr ? 'Historique' : 'History'}
            style={{ opacity: viewMode === 'history' ? 1 : 0.7 }}>
            🕓
          </button>
        )}
        {!isDesktop && user && (
          <button className="topbar-icon-btn" onClick={startNewVisit} title={isFr ? 'Nouvelle visite' : 'New visit'}>
            ✏️
          </button>
        )}
        <div className="lang-toggle">
          <button className={`lang-btn ${lang === 'fr' ? 'active' : ''}`} onClick={() => setLang('fr')}>FR</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
        </div>
        {!isDesktop && user && (
          <button className="topbar-icon-btn" onClick={signOut} title={isFr ? 'Déconnexion' : 'Log out'}>
            🚪
          </button>
        )}
      </div>
    </div>
  );
}
