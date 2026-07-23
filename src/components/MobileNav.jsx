import { useApp } from '../context/AppContext';
import { Home, Calendar, Plus, FileText, Clock } from 'lucide-react';

export default function MobileNav() {
  const { lang, user, viewMode, setViewMode, openPlanVisit, currentStep, nextStep, prevStep, t, sheet, modal, state, selectRoom } = useApp();
  if (!user) return null;
  const isFr = lang === 'fr';

  if (viewMode === 'wizard') {
    if (sheet?.isOpen || modal?.isOpen) return null;

    // Étape inventaire : navigation entre pièces
    if (currentStep === 2) {
      const rooms = state?.rooms || [];
      const curId = state?.currentRoomId || rooms[0]?.id;
      const idx = rooms.findIndex(r => r.id === curId);
      const isFirst = idx <= 0;
      const isLast  = idx >= rooms.length - 1 || rooms.length === 0;
      return (
        <div className="mobile-bottom-nav mobile-bottom-nav-wizard">
          <button
            className="btn btn-secondary"
            onClick={() => selectRoom(rooms[idx - 1]?.id)}
            style={{ visibility: isFirst ? 'hidden' : 'visible' }}
          >
            ← {isFr ? 'Pièce préc.' : 'Prev room'}
          </button>
          <button
            className={`btn ${isLast ? 'btn-finish-inventory' : 'btn-primary'}`}
            onClick={isLast ? nextStep : () => selectRoom(rooms[idx + 1]?.id)}
          >
            {isLast
              ? (isFr ? '✅ Voir la synthèse' : '✅ View summary')
              : (isFr ? 'Pièce suiv. →' : 'Next room →')}
          </button>
        </div>
      );
    }

    return (
      <div className="mobile-bottom-nav mobile-bottom-nav-wizard">
        <button
          className="btn btn-secondary"
          onClick={prevStep}
          style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
        >
          ← {t('back')}
        </button>
        <button
          className="btn btn-primary"
          onClick={nextStep}
          style={{ visibility: currentStep >= 3 ? 'hidden' : 'visible' }}
        >
          {t('next')} →
        </button>
      </div>
    );
  }

  const tabs = [
    { icon: Home,     label: isFr ? 'Accueil' : 'Home',      action: () => setViewMode('dashboard'), active: viewMode === 'dashboard' },
    { icon: Calendar, label: 'Agenda',                         action: () => setViewMode('agenda'),    active: viewMode === 'agenda' },
    { icon: Plus,     label: isFr ? 'Nouveau' : 'New',         action: openPlanVisit,                  active: false },
    { icon: FileText, label: isFr ? 'Devis' : 'Quotes',       action: () => setViewMode('quotes'),    active: viewMode === 'quotes' || viewMode === 'quote-editor' },
    { icon: Clock,    label: isFr ? 'Historique' : 'History', action: () => setViewMode('history'),   active: viewMode === 'history' },
  ];

  return (
    <div className="mobile-bottom-nav">
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        return (
          <button key={i} className={`mobile-nav-tab${tab.active ? ' active' : ''}`} onClick={tab.action}>
            <span className="mobile-nav-icon"><Icon size={23} strokeWidth={2} /></span>
            <span className="mobile-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
