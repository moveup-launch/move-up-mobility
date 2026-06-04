import { useApp } from '../context/AppContext';
import { useIsDesktop } from '../hooks/useIsDesktop';

export default function TopBar() {
  const { lang, setLang, user, signOut, viewMode, setViewMode, startNewVisit } = useApp();
  const isDesktop = useIsDesktop();
  const isFr = lang === 'fr';

  const getMobileAction = () => {
    if (viewMode === 'wizard') return { icon: '🕓', label: isFr ? 'Historique' : 'History', onClick: () => setViewMode('history') };
    return { icon: '✏️', label: isFr ? 'Nouvelle visite' : 'New visit', onClick: startNewVisit };
  };

  const mobileAction = getMobileAction();

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
        {!isDesktop && user && (
          <button className="topbar-icon-btn" onClick={mobileAction.onClick} title={mobileAction.label}>
            {mobileAction.icon}
          </button>
        )}
        {!isDesktop && user && viewMode === 'wizard' && (
          <button className="topbar-icon-btn" onClick={() => setViewMode('dashboard')} title={isFr ? 'Accueil' : 'Home'}>
            🏠
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
