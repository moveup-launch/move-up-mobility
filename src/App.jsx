import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useIsDesktop } from './hooks/useIsDesktop';
import { supabase } from './lib/supabase';
import TopBar from './components/TopBar';
import StepIndicator from './components/StepIndicator';
import BottomNav from './components/BottomNav';
import BottomSheet from './components/BottomSheet';
import Modal from './components/Modal';
import SidebarNav from './components/SidebarNav';
import LiveVolumePanel from './components/LiveVolumePanel';
import DemoBanner from './components/DemoBanner';
import Step1Client from './pages/Step1Client';
import Step2Housing from './pages/Step2Housing';
import Step4Inventory from './pages/Step4Inventory';
import Step5Summary from './pages/Step5Summary';
import Step6PDF from './pages/Step6PDF';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';
import AgendaPage from './pages/AgendaPage';
import QuickVisitPage from './pages/QuickVisitPage';
import SettingsPage from './pages/SettingsPage';
import PricingPage from './pages/PricingPage';
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage';
import OfflineBanner from './components/OfflineBanner';

const STEPS = [Step1Client, Step2Housing, Step4Inventory, Step5Summary, Step6PDF];

function DesktopBottomNav() {
  const { currentStep, nextStep, prevStep, t } = useApp();
  return (
    <div className="desktop-nav-btns">
      {currentStep > 0 && (
        <button className="btn btn-secondary" onClick={prevStep}>← {t('back')}</button>
      )}
      {currentStep < 4 && (
        <button className="btn btn-primary" onClick={nextStep}>{t('next')} →</button>
      )}
    </div>
  );
}

function DesktopLayout() {
  const { currentStep, mainScrollRef, viewMode } = useApp();
  const StepComponent = STEPS[currentStep];

  return (
    <div id="app-desktop">
      <DemoBanner />
      <TopBar />
      <div className="desktop-body">
        <SidebarNav />
        <div className="desktop-main">
          {viewMode === 'dashboard' && (
            <div className="desktop-content-full" ref={mainScrollRef}><DashboardPage /></div>
          )}
          {viewMode === 'history' && (
            <div className="desktop-content-full" ref={mainScrollRef}><HistoryPage /></div>
          )}
          {viewMode === 'agenda' && (
            <div className="desktop-content-full" ref={mainScrollRef}><AgendaPage /></div>
          )}
          {viewMode === 'quickvisit' && (
            <div className="desktop-content-full" ref={mainScrollRef}><QuickVisitPage /></div>
          )}
          {viewMode === 'settings' && (
            <div className="desktop-content-full" ref={mainScrollRef}><SettingsPage /></div>
          )}
          {viewMode === 'pricing' && (
            <div className="desktop-content-full" ref={mainScrollRef}><PricingPage /></div>
          )}
          {viewMode === 'admin' && (
            <div className="desktop-content-full" ref={mainScrollRef}><AdminPage /></div>
          )}
          {viewMode === 'wizard' && (
            <>
              <div className="desktop-form" ref={mainScrollRef}>
                <StepComponent />
                <DesktopBottomNav />
              </div>
              <div className="desktop-panel-wrap">
                <LiveVolumePanel />
              </div>
            </>
          )}
        </div>
      </div>
      <BottomSheet />
      <Modal />
    </div>
  );
}

function MobileLayout() {
  const { currentStep, mainScrollRef, viewMode } = useApp();

  const shell = (children, nopad = false) => (
    <div id="app">
      <DemoBanner />
      <TopBar />
      <div className={`main-scroll${nopad ? ' main-scroll-nopad' : ''}`} ref={mainScrollRef}>
        {children}
      </div>
    </div>
  );

  if (viewMode === 'dashboard') return shell(<DashboardPage />, true);
  if (viewMode === 'history')   return shell(<HistoryPage />, true);
  if (viewMode === 'agenda')    return shell(<AgendaPage />, true);
  if (viewMode === 'quickvisit') return shell(<QuickVisitPage />);
  if (viewMode === 'settings')  return shell(<SettingsPage />);
  if (viewMode === 'pricing')   return shell(<PricingPage />);
  if (viewMode === 'admin')     return shell(<AdminPage />, true);

  const StepComponent = STEPS[currentStep];
  return (
    <div id="app">
      <DemoBanner />
      <TopBar />
      <StepIndicator />
      <div className="main-scroll" ref={mainScrollRef}>
        <StepComponent />
      </div>
      <BottomNav />
      <BottomSheet />
      <Modal />
    </div>
  );
}

function AppContent() {
  const { user, authLoading } = useApp();
  const isDesktop = useIsDesktop();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [demoLoading, setDemoLoading] = useState(false);

  const goSignIn = () => { setAuthMode('login'); setShowAuth(true); };
  const goSignUp = () => { setAuthMode('signup'); setShowAuth(true); };

  // Après déconnexion démo → ouvrir directement l'inscription
  useEffect(() => {
    if (!user && !authLoading) {
      const next = sessionStorage.getItem('moveup_after_signout');
      if (next === 'signup') {
        sessionStorage.removeItem('moveup_after_signout');
        setAuthMode('signup');
        setShowAuth(true);
      }
    }
  }, [user, authLoading]);

  const handleDemo = async () => {
    setDemoLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@moveupapp.com',
      password: 'Demo1234!',
    });
    if (error) alert('Compte démo non disponible. Veuillez réessayer.');
    setDemoLoading(false);
  };

  let content;
  if (authLoading) {
    content = (
      <div id="app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 40 }}>📦</div>
      </div>
    );
  } else if (!user) {
    content = showAuth
      ? <AuthPage initialMode={authMode} onBack={() => setShowAuth(false)} />
      : <LandingPage onSignIn={goSignIn} onSignUp={goSignUp} onDemo={handleDemo} demoLoading={demoLoading} />;
  } else {
    content = isDesktop ? <DesktopLayout /> : <MobileLayout />;
  }

  return (
    <>
      {content}
      <OfflineBanner />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
