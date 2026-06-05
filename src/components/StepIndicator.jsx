import { Fragment } from 'react';
import { useApp } from '../context/AppContext';

export default function StepIndicator() {
  const { currentStep, goToStep, t } = useApp();
  const labels = [t('step1'), t('step2'), t('step3'), t('step4'), t('step5')];

  return (
    <div className="step-indicator">
      {labels.map((label, i) => (
        <Fragment key={i}>
          <div
            className={`step-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}
            onClick={() => goToStep(i)}
          >
            <div className="step-dot-circle">{i < currentStep ? '✓' : i + 1}</div>
            <div className="step-dot-label">{label}</div>
          </div>
          {i < 4 && <div className="step-connector" />}
        </Fragment>
      ))}
    </div>
  );
}
