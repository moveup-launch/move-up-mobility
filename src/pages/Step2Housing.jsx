import { useApp } from '../context/AppContext';

function AccessBlock({ prefix, label }) {
  const { t, lang, state, updateOrigin, updateDestination } = useApp();
  const d = state[prefix];
  const update = prefix === 'origin' ? updateOrigin : updateDestination;

  const truckOpts = [
    { val: 'front', key: 'truckDistanceFront', icon: '🏠' },
    { val: 'lt10', key: 'truckDistanceLess10', icon: '📏' },
    { val: '10_30', key: 'truckDistance10_30', icon: '📏' },
    { val: '30_50', key: 'truckDistance30_50', icon: '⚠️' },
    { val: 'gt50', key: 'truckDistanceMore50', icon: '🚨' },
    { val: 'unknown', key: 'truckDistanceUnknown', icon: '❓' },
  ];

  let alert = null;
  if (d.truckDistance === '30_50') alert = <div className="alert alert-warn">{t('alertLong30')}</div>;
  else if (d.truckDistance === 'gt50') alert = <div className="alert alert-danger">{t('alertLong50')}</div>;
  else if (d.truckDistance === 'unknown') alert = <div className="alert alert-info">{t('alertUnknown')}</div>;

  return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div className="field">
        <label>{t('originAddress')}</label>
        <input type="text" value={d.address} onChange={e => update('address', e.target.value)} placeholder={lang === 'fr' ? 'Rue, numéro...' : 'Street, number...'} />
      </div>
      <div className="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label>{t('city')}</label>
          <input type="text" value={d.city} onChange={e => update('city', e.target.value)} />
        </div>
        <div>
          <label>{t('postalCode')}</label>
          <input type="text" value={d.postalCode} onChange={e => update('postalCode', e.target.value)} />
        </div>
      </div>
      <div className="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label>{t('floor')}</label>
          <input type="text" value={d.floor} onChange={e => update('floor', e.target.value)} placeholder="RDC / 2 / ..." />
        </div>
        <div>
          <label>{t('elevator')}</label>
          <select value={d.elevator} onChange={e => update('elevator', e.target.value)}>
            <option value="no">{t('elevatorNo')}</option>
            <option value="yes">{t('elevatorYes')}</option>
            <option value="small">{t('elevatorSmall')}</option>
          </select>
        </div>
      </div>
      <div className="toggle-row">
        <span className="toggle-label">{t('furnitureLift')}</span>
        <button className={`toggle ${d.furnitureLift ? 'on' : ''}`} onClick={() => update('furnitureLift', !d.furnitureLift)} />
      </div>
      <div className="field" style={{ marginTop: '14px' }}>
        <label>{t('truckDistance')}</label>
        <div className="radio-list">
          {truckOpts.map(o => (
            <div key={o.val} className={`radio-option ${d.truckDistance === o.val ? 'selected' : ''}`} onClick={() => update('truckDistance', o.val)}>
              <span className="radio-icon">{o.icon}</span>
              <span className="radio-label">{t(o.key)}</span>
              <span className="radio-check" />
            </div>
          ))}
        </div>
        {alert}
      </div>
      <div className="field">
        <label>{t('accessNotes')}</label>
        <textarea value={d.accessNotes} onChange={e => update('accessNotes', e.target.value)} placeholder={lang === 'fr' ? 'Remarques accès...' : 'Access notes...'} />
      </div>
    </div>
  );
}

export default function Step2Housing() {
  const { t, state, setHousingType } = useApp();

  const htypes = [
    { val: 'apartment', key: 'apartment', icon: '🏢' },
    { val: 'house', key: 'house', icon: '🏠' },
    { val: 'studio', key: 'studio', icon: '🏨' },
    { val: 'loft', key: 'loft', icon: '🏭' },
    { val: 'villa', key: 'villa', icon: '🏡' },
    { val: 'other', key: 'other', icon: '📦' },
  ];

  return (
    <>
      <div className="section-header">
        <div className="section-title">{t('housingAccess')}</div>
      </div>
      <div className="card">
        <div className="card-title">{t('housingType')}</div>
        <div className="radio-grid">
          {htypes.map(h => (
            <div key={h.val} className={`radio-option ${state.housingType === h.val ? 'selected' : ''}`} onClick={() => setHousingType(h.val)}>
              <span className="radio-icon">{h.icon}</span>
              <span className="radio-label">{t(h.key)}</span>
            </div>
          ))}
        </div>
      </div>
      <AccessBlock prefix="origin" label={t('origin')} />
      <AccessBlock prefix="destination" label={t('destination')} />
    </>
  );
}
