import { useApp } from '../context/AppContext';

function YesNoCheck({ value, onChange, isFr }) {
  const opts = [
    { val: 'yes', label: isFr ? 'Oui' : 'Yes' },
    { val: 'no', label: isFr ? 'Non' : 'No' },
    { val: 'toCheck', label: isFr ? 'A verifier' : 'To check' },
  ];
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {opts.map(o => (
        <div
          key={o.val}
          className={`radio-option ${value === o.val ? 'selected' : ''}`}
          style={{ flex: '1', padding: '8px 6px', minWidth: '70px', justifyContent: 'center' }}
          onClick={() => onChange(o.val)}
        >
          <span className="radio-label" style={{ fontSize: '12px', textAlign: 'center' }}>{o.label}</span>
        </div>
      ))}
    </div>
  );
}

function AccessBlock({ prefix, label }) {
  const { t, lang, state, updateOrigin, updateDestination } = useApp();
  const d = state[prefix];
  const update = prefix === 'origin' ? updateOrigin : updateDestination;
  const isFr = lang === 'fr';
  const showElevator = ['apartment', 'office_pro'].includes(state.housingType);

  const truckOpts = [
    { val: 'front', key: 'truckDistanceFront' },
    { val: 'lt10', key: 'truckDistanceLess10' },
    { val: '10_30', key: 'truckDistance10_30' },
    { val: '30_50', key: 'truckDistance30_50' },
    { val: 'gt50', key: 'truckDistanceMore50' },
    { val: 'unknown', key: 'truckDistanceUnknown' },
  ];

  const locationOpts = [
    { val: 'street', key: 'locationStreet' },
    { val: 'courtyard', key: 'locationCourtyard' },
    { val: 'garden', key: 'locationGarden' },
    { val: 'balcony', key: 'locationBalcony' },
    { val: 'window', key: 'locationWindow' },
  ];

  const alerts = [];
  if (d.elevator === 'no') alerts.push(t('alertElevatorNo'));
  if (d.elevatorUsable === 'no') alerts.push(isFr ? 'Ascenseur inutilisable' : 'Elevator unusable');
  if (d.parkingAvailable === 'no') alerts.push(t('alertParkingNo'));
  if (d.furnitureLiftNeeded === 'yes' && d.furnitureLiftFeasible === 'toCheck') alerts.push(t('alertLiftCheck'));
  if (d.truckDistance === '30_50') alerts.push(t('alertLong30'));
  if (d.truckDistance === 'gt50') alerts.push(t('alertLong50'));

  return (
    <div className="card">
      <div className="card-title">{label}</div>

      {/* Adresse */}
      <div className="field">
        <label>{t('originAddress')}</label>
        <input type="text" value={d.address} onChange={e => update('address', e.target.value)}
          placeholder={isFr ? 'Rue, numéro...' : 'Street, number...'} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="field">
          <label>{t('city')}</label>
          <input type="text" value={d.city} onChange={e => update('city', e.target.value)} />
        </div>
        <div className="field">
          <label>{t('postalCode')}</label>
          <input type="text" value={d.postalCode} onChange={e => update('postalCode', e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>{t('floor')}</label>
        <input type="text" value={d.floor} onChange={e => update('floor', e.target.value)} placeholder="RDC / 2 / ..." />
      </div>

      {/* Ascenseur — uniquement pour appartement / bureau */}
      {showElevator && (
        <>
          <div className="field">
            <label>{t('elevator')}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ val: 'yes', lbl: isFr ? 'Oui' : 'Yes' }, { val: 'no', lbl: isFr ? 'Non' : 'No' }].map(o => (
                <div key={o.val} className={`radio-option ${d.elevator === o.val ? 'selected' : ''}`}
                  style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                  onClick={() => update('elevator', o.val)}>
                  <span className="radio-label">{o.lbl}</span>
                </div>
              ))}
            </div>
          </div>
          {d.elevator === 'yes' && (
            <>
              <div className="field">
                <label style={{ fontSize: '12px' }}>{t('elevatorUsable')}</label>
                <YesNoCheck value={d.elevatorUsable} onChange={v => update('elevatorUsable', v)} isFr={isFr} />
              </div>
              <div className="field">
                <label style={{ fontSize: '12px' }}>{t('elevatorSize')}</label>
                <YesNoCheck value={d.elevatorSize} onChange={v => update('elevatorSize', v)} isFr={isFr} />
              </div>
            </>
          )}
        </>
      )}

      {/* Stationnement */}
      <div className="field" style={{ marginTop: '6px' }}>
        <label>{t('parkingTruck')}</label>
        <YesNoCheck value={d.parkingAvailable} onChange={v => update('parkingAvailable', v)} isFr={isFr} />
      </div>
      <div className="field">
        <label style={{ fontSize: '12px' }}>{t('truckDistance')}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {truckOpts.map(o => (
            <div key={o.val} className={`radio-option ${d.truckDistance === o.val ? 'selected' : ''}`}
              style={{ padding: '9px 12px' }}
              onClick={() => update('truckDistance', o.val)}>
              <span className="radio-label" style={{ fontSize: '13px' }}>{t(o.key)}</span>
              <span className="radio-check" />
            </div>
          ))}
        </div>
      </div>

      {/* Monte-meubles */}
      <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '12px', marginTop: '8px' }}>
        <div className="card-title" style={{ fontSize: '13px', marginBottom: '10px' }}>
          {t('furnitureLiftSection')}
        </div>
        <div className="field">
          <label style={{ fontSize: '12px' }}>{t('furnitureLiftNeeded')}</label>
          <YesNoCheck value={d.furnitureLiftNeeded} onChange={v => update('furnitureLiftNeeded', v)} isFr={isFr} />
        </div>
        {d.furnitureLiftNeeded !== 'no' && (
          <>
            <div className="field">
              <label style={{ fontSize: '12px' }}>{t('furnitureLiftFeasible')}</label>
              <YesNoCheck value={d.furnitureLiftFeasible} onChange={v => update('furnitureLiftFeasible', v)} isFr={isFr} />
            </div>
            <div className="field">
              <label style={{ fontSize: '12px' }}>{t('furnitureLiftLocation')}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {locationOpts.map(o => (
                  <div key={o.val}
                    className={`radio-option ${d.furnitureLiftLocation === o.val ? 'selected' : ''}`}
                    style={{ padding: '7px 10px' }}
                    onClick={() => update('furnitureLiftLocation', o.val)}>
                    <span className="radio-label" style={{ fontSize: '12px' }}>{t(o.key)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="field">
              <label style={{ fontSize: '12px' }}>{t('furnitureLiftPermission')}</label>
              <YesNoCheck value={d.furnitureLiftPermission} onChange={v => update('furnitureLiftPermission', v)} isFr={isFr} />
            </div>
          </>
        )}
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {alerts.map((a, i) => (
            <div key={i} className="alert alert-warn" style={{ fontSize: '12px', padding: '8px 12px' }}>
              {a}
            </div>
          ))}
        </div>
      )}

      <div className="field" style={{ marginTop: '8px' }}>
        <label>{t('accessNotes')}</label>
        <textarea value={d.accessNotes} onChange={e => update('accessNotes', e.target.value)}
          placeholder={isFr ? 'Remarques accès, digicode, gardien...' : 'Access notes, code, caretaker...'} />
      </div>
    </div>
  );
}

export default function Step2Housing() {
  const { t, state, setHousingType } = useApp();

  const htypes = [
    { val: 'apartment', key: 'apartment', icon: '🏢' },
    { val: 'house', key: 'house', icon: '🏠' },
    { val: 'storage', key: 'storage', icon: '🗄️' },
    { val: 'office_pro', key: 'office_pro', icon: '🏢' },
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
            <div key={h.val} className={`radio-option ${state.housingType === h.val ? 'selected' : ''}`}
              onClick={() => setHousingType(h.val)}>
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
