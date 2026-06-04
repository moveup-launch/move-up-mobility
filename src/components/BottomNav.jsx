import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { currentStep, nextStep, prevStep, t } = useApp();

  return (
    <div className="bottom-nav">
      {currentStep > 0 && (
        <button className="btn btn-secondary" onClick={prevStep}>← {t('back')}</button>
      )}
      {currentStep < 5 && (
        <button className="btn btn-primary" onClick={nextStep}>{t('next')} →</button>
      )}
    </div>
  );
}
