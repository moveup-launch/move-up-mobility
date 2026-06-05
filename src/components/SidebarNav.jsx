import { useApp } from '../context/AppContext';

const STEP_ICONS = ['👤', '🏠', '📦', '📊', '📄'];

export default function SidebarNav() {
  const { currentStep, goToStep, t, lang, user, signOut, viewMode, setViewMode, startNewVisit } = useApp();

  const steps = [t('step1'), t('step2'), t('step3'), t('step4'), t('step5')];
  const isFr = lang === 'fr';

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <button
          className={`sidebar-nav-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
          onClick={() => setViewMode('dashboard')}
        >
          <span>🏠</span> {isFr ? 'Accueil' : 'Dashboard'}
        </button>
        <button
          className={`sidebar-nav-btn ${viewMode === 'history' ? 'active' : ''}`}
          onClick={() => setViewMode('history')}
        >
          <span>🕓</span> {isFr ? 'Historique' : 'History'}
        </button>
        <button
          className="sidebar-nav-btn sidebar-new-visit"
          onClick={startNewVisit}
        >
          <span>✏️</span> {isFr ? 'Nouvelle visite' : 'New visit'}
        </button>
      </div>

      {viewMode === 'wizard' && (
        <div className="sidebar-section sidebar-steps-section">
          <div className="sidebar-label">{isFr ? 'Étapes' : 'Steps'}</div>
          <nav className="sidebar-steps">
            {steps.map((label, i) => (
              <button
                key={i}
                className={`sidebar-step ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}
                onClick={() => goToStep(i)}
              >
                <span className="sidebar-step-num">
                  {i < currentStep ? '✓' : i + 1}
                </span>
                <span className="sidebar-step-icon">{STEP_ICONS[i]}</span>
                <span className="sidebar-step-label">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="sidebar-user">{user?.email}</div>
        <button className="sidebar-logout" onClick={signOut}>
          🚪 {isFr ? 'Déconnexion' : 'Log out'}
        </button>
      </div>
    </aside>
  );
}
