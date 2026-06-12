import { useApp } from '../context/AppContext';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function TopBar() {
  const { lang, setLang, user, profile, signOut, viewMode, setViewMode, openPlanVisit } = useApp();
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
          <button className="topbar-icon-btn" onClick={openPlanVisit} title={isFr ? 'Nouvelle visite' : 'New visit'}>
            ➕
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
        <div className="lang-toggle">
          <button className={`lang-btn ${lang === 'fr' ? 'active' : ''}`} onClick={() => setLang('fr')}>FR</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
        </div>
        {!isDesktop && user && (
          <button className="topbar-icon-btn" onClick={() => setViewMode('settings')}
            title={isFr ? 'Paramètres' : 'Settings'}
            style={{ opacity: viewMode === 'settings' ? 1 : 0.7 }}>
            ⚙️
          </button>
        )}
        {!isDesktop && user && profile?.is_admin && (
          <button className="topbar-icon-btn" onClick={() => setViewMode('admin')}
            title="Admin" style={{ opacity: viewMode === 'admin' ? 1 : 0.7 }}>
            🛡️
          </button>
        )}
        {!isDesktop && user && (
          <button className="topbar-icon-btn" onClick={signOut} title={isFr ? 'Déconnexion' : 'Log out'}>
            🚪
          </button>
        )}
      </div>
    </div>
  );
}
