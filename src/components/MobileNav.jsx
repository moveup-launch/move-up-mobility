import { useApp } from '../context/AppContext';

export default function MobileNav() {
  const { lang, user, viewMode, setViewMode, openPlanVisit, currentStep, nextStep, prevStep, t } = useApp();
  if (!user) return null;
  const isFr = lang === 'fr';

  if (viewMode === 'wizard') {
    return (
      <div className="mobile-bottom-nav mobile-bottom-nav-wizard">
        <button
          className="btn btn-secondary"
          onClick={prevStep}
          style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
        >
          ← {t('back')}
        </button>
        {currentStep !== 2 && (
          <button
            className="btn btn-primary"
            onClick={nextStep}
            style={{ visibility: currentStep >= 3 ? 'hidden' : 'visible' }}
          >
            {`${t('next')} →`}
          </button>
        )}
      </div>
    );
  }

  const tabs = [
    { icon: '🏠', label: isFr ? 'Accueil' : 'Home',      action: () => setViewMode('dashboard'), active: viewMode === 'dashboard' },
    { icon: '📅', label: 'Agenda',                         action: () => setViewMode('agenda'),    active: viewMode === 'agenda' },
    { icon: '➕', label: isFr ? 'Nouveau' : 'New',         action: openPlanVisit,                  active: false },
    { icon: '📋', label: isFr ? 'Devis' : 'Quotes',       action: () => setViewMode('quotes'),    active: viewMode === 'quotes' || viewMode === 'quote-editor' },
    { icon: '🕓', label: isFr ? 'Historique' : 'History', action: () => setViewMode('history'),   active: viewMode === 'history' },
  ];

  return (
    <div className="mobile-bottom-nav">
      {tabs.map((tab, i) => (
        <button key={i} className={`mobile-nav-tab${tab.active ? ' active' : ''}`} onClick={tab.action}>
          <span className="mobile-nav-icon">{tab.icon}</span>
          <span className="mobile-nav-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
