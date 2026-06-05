import { AppProvider, useApp } from './context/AppContext';
import { useIsDesktop } from './hooks/useIsDesktop';
import TopBar from './components/TopBar';
import StepIndicator from './components/StepIndicator';
import BottomNav from './components/BottomNav';
import BottomSheet from './components/BottomSheet';
import Modal from './components/Modal';
import SidebarNav from './components/SidebarNav';
import LiveVolumePanel from './components/LiveVolumePanel';
import Step1Client from './pages/Step1Client';
import Step2Housing from './pages/Step2Housing';
import Step4Inventory from './pages/Step4Inventory';
import Step5Summary from './pages/Step5Summary';
import Step6PDF from './pages/Step6PDF';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';

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
      <TopBar />
      <div className="desktop-body">
        <SidebarNav />
        <div className="desktop-main">
          {viewMode === 'dashboard' && (
            <div className="desktop-content-full" ref={mainScrollRef}>
              <DashboardPage />
            </div>
          )}
          {viewMode === 'history' && (
            <div className="desktop-content-full" ref={mainScrollRef}>
              <HistoryPage />
            </div>
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

  if (viewMode === 'dashboard') {
    return (
      <div id="app">
        <TopBar />
        <div className="main-scroll main-scroll-nopad" ref={mainScrollRef}>
          <DashboardPage />
        </div>
      </div>
    );
  }

  if (viewMode === 'history') {
    return (
      <div id="app">
        <TopBar />
        <div className="main-scroll main-scroll-nopad" ref={mainScrollRef}>
          <HistoryPage />
        </div>
      </div>
    );
  }

  const StepComponent = STEPS[currentStep];
  return (
    <div id="app">
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

  if (authLoading) {
    return (
      <div id="app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 40 }}>📦</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return isDesktop ? <DesktopLayout /> : <MobileLayout />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
