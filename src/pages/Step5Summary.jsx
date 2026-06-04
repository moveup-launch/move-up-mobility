import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Step5Summary() {
  const {
    t, lang, state,
    getTotalVolume, getRecommendedTruck, getRecommendedTeam, getEquipment,
    getAllFragile, getAllHeavy, getAllDisassembly,
    getTotalBoxes, getBoxVolume, getRoomVolume, getRoomIcon,
    saveVisit, setViewMode,
  } = useApp();

  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error

  const vol = getTotalVolume();
  const truck = getRecommendedTruck(vol);
  const team = getRecommendedTeam(vol);
  const equip = getEquipment();
  const fragile = getAllFragile();
  const heavy = getAllHeavy();
  const disassembly = getAllDisassembly();
  const boxesDoneCount = getTotalBoxes(state.boxesDone);
  const boxesRemCount = getTotalBoxes(state.boxesRemaining);
  const isFr = lang === 'fr';

  const handleSave = async () => {
    setSaveStatus('saving');
    const { error } = await saveVisit();
    if (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('saved');
    }
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">{t('summary')}</div>
      </div>

      <div className="summary-big">
        <div className="big-num">{vol.toFixed(1)}</div>
        <div className="big-unit">m³</div>
        <div className="big-label">{t('totalVolumeLabel')}</div>
      </div>

      <div className="summary-stat">
        <div className="stat-icon">🚛</div>
        <div className="stat-info">
          <div className="stat-label">{t('recommendedTruck')}</div>
          <div className="stat-value">{truck}</div>
        </div>
      </div>
      <div className="summary-stat">
        <div className="stat-icon">👥</div>
        <div className="stat-info">
          <div className="stat-label">{t('recommendedTeam')}</div>
          <div className="stat-value">{team}</div>
        </div>
      </div>
      <div className="summary-stat">
        <div className="stat-icon">🛠️</div>
        <div className="stat-info">
          <div className="stat-label">{t('requiredEquipment')}</div>
          <div className="stat-value" style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {equip.map((e, i) => <span key={i} style={{ display: 'block' }}>{e}</span>)}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-title">{t('perRoom')}</div>
        <ul className="item-list-summary">
          {state.rooms.map(r => (
            <li key={r.id}>
              <span>{getRoomIcon(r.type)} {r.name}</span>
              <strong>{getRoomVolume(r).toFixed(2)} m³</strong>
            </li>
          ))}
        </ul>
      </div>

      {fragile.length > 0 && (
        <div className="card">
          <div className="card-title">🔴 {t('fragileItems')} ({fragile.length})</div>
          <ul className="item-list-summary">
            {fragile.map((item, i) => (
              <li key={i}>
                <span>{item.icon} {item.name} <em style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.roomName}</em></span>
                <strong>×{item.qty}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {heavy.length > 0 && (
        <div className="card">
          <div className="card-title">🟠 {t('heavyItems')} ({heavy.length})</div>
          <ul className="item-list-summary">
            {heavy.map((item, i) => (
              <li key={i}>
                <span>{item.icon} {item.name} <em style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.roomName}</em></span>
                <strong>×{item.qty}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {disassembly.length > 0 && (
        <div className="card">
          <div className="card-title">🔵 {t('disassemblyItems')} ({disassembly.length})</div>
          <ul className="item-list-summary">
            {disassembly.map((item, i) => (
              <li key={i}>
                <span>{item.icon} {item.name} <em style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.roomName}</em></span>
                <strong>×{item.qty}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="card-title">📦 {t('boxesSummary')}</div>
        <ul className="item-list-summary">
          <li><span>{t('boxesPacked')}</span><strong>{boxesDoneCount} {isFr ? 'cartons' : 'boxes'}</strong></li>
          <li><span>{t('boxesEstimated')}</span><strong>{boxesRemCount} {isFr ? 'cartons' : 'boxes'}</strong></li>
          <li><span>{isFr ? 'Volume cartons faits' : 'Packed boxes vol.'}</span><strong>{getBoxVolume(state.boxesDone).toFixed(2)} m³</strong></li>
          <li><span>{isFr ? 'Volume cartons restants' : 'Remaining boxes vol.'}</span><strong>{getBoxVolume(state.boxesRemaining).toFixed(2)} m³</strong></li>
        </ul>
      </div>

      <div style={{ marginTop: 8, marginBottom: 8 }}>
        {saveStatus === 'saved' ? (
          <div className="save-success-banner">
            <span>✅ {isFr ? 'Visite enregistrée !' : 'Visit saved!'}</span>
            <button className="save-history-link" onClick={() => setViewMode('history')}>
              {isFr ? 'Voir l\'historique →' : 'View history →'}
            </button>
          </div>
        ) : (
          <button
            className={`save-visit-btn ${saveStatus === 'error' ? 'error' : ''}`}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving'
              ? (isFr ? 'Enregistrement…' : 'Saving…')
              : saveStatus === 'error'
                ? (isFr ? '❌ Erreur — réessayer' : '❌ Error — retry')
                : (isFr ? '💾 Enregistrer la visite' : '💾 Save visit')}
          </button>
        )}
      </div>
    </>
  );
}
