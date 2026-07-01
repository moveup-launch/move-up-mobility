import { Fragment } from 'react';
import { useApp } from '../context/AppContext';

export default function StepIndicator() {
  const { currentStep, goToStep, t, state } = useApp();
  const labels = [t('step1'), t('step2'), t('step3'), t('step4')];

  const roomsTotal = state.rooms.length;
  const roomsWithItems = state.rooms.filter(r => (r.items || []).some(i => i.qty > 0)).length;
  const inventorySubProgress = currentStep === 2 && roomsTotal > 0 ? roomsWithItems / roomsTotal : 0;
  const percent = Math.min(100, ((currentStep + (currentStep === 2 ? inventorySubProgress : 0)) / 3) * 100);

  return (
    <div className="step-indicator">
      <div className="step-progress-track">
        <div className="step-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="step-dots-row">
        {labels.map((label, i) => (
          <Fragment key={i}>
            <div
              className={`step-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}
              onClick={() => goToStep(i)}
            >
              <div className="step-dot-circle">{i < currentStep ? '✓' : i + 1}</div>
              <div className="step-dot-label">{label}</div>
            </div>
            {i < 3 && <div className="step-connector" />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
