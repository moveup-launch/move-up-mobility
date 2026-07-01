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

function isUpperFloor(floor) {
  const f = (floor || '').toString().trim().toLowerCase();
  return !(f === '0' || f === 'rdc' || f.startsWith('rez-de-chaussee') || f.startsWith('rez-de-chaussée'));
}

const HT_OPTIONS = [
  { val: 'apartment', icon: '🏢' },
  { val: 'house', icon: '🏠' },
  { val: 'storage', icon: '🗄️' },
  { val: 'office_pro', icon: '🏢' },
  { val: 'other', icon: '📦' },
];

function AccessBlock({ prefix, label }) {
  const { t, lang, state, updateOrigin, updateDestination, setHousingTypeOrigin, setHousingTypeDestination } = useApp();
  const d = state[prefix];
  const update = prefix === 'origin' ? updateOrigin : updateDestination;
  const isFr = lang === 'fr';
  const housingType = prefix === 'origin' ? state.housingTypeOrigin : state.housingTypeDestination;
  const setHT = prefix === 'origin' ? setHousingTypeOrigin : setHousingTypeDestination;
  const showElevator = ['apartment', 'office_pro'].includes(housingType) && isUpperFloor(d.floor);

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
    { val: 'other', key: 'locationOther' },
  ];

  const alerts = [];
  if (showElevator && d.elevator === 'no') alerts.push(t('alertElevatorNo'));
  if (showElevator && d.elevatorUsable === 'no') alerts.push(isFr ? 'Ascenseur inutilisable' : 'Elevator unusable');
  if (d.parkingAvailable === 'no') alerts.push(t('alertParkingNo'));
  if (d.accessDifficult === 'yes') alerts.push(isFr ? 'Acces difficile signale' : 'Difficult access flagged');
  if (d.furnitureLiftNeeded === 'yes' && d.furnitureLiftFeasible === 'toCheck') alerts.push(t('alertLiftCheck'));
  if (d.truckDistance === '30_50') alerts.push(t('alertLong30'));
  if (d.truckDistance === 'gt50') alerts.push(t('alertLong50'));

  return (
    <div className="card">
      <div className="card-title">{label}</div>

      {/* Type de logement */}
      <div className="field" style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '12px' }}>{t('housingType')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {HT_OPTIONS.map(h => (
            <div
              key={h.val}
              className={`radio-option ${housingType === h.val ? 'selected' : ''}`}
              style={{ padding: '6px 10px', flex: '1 1 80px', justifyContent: 'center' }}
              onClick={() => setHT(h.val)}
            >
              <span className="radio-icon" style={{ fontSize: '16px' }}>{h.icon}</span>
              <span className="radio-label" style={{ fontSize: '11px' }}>{t(h.val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Option sans logement fixe — destination uniquement */}
      {prefix === 'destination' && (
        <div
          className={`radio-option ${d.noFixedAddress ? 'selected' : ''}`}
          style={{ padding: '10px 12px', marginBottom: '8px', cursor: 'pointer' }}
          onClick={() => update('noFixedAddress', !d.noFixedAddress)}
        >
          <span className="radio-label" style={{ fontSize: '12px' }}>
            {isFr ? 'Client sans logement fixe — ville de destination uniquement' : 'No fixed address — destination city only'}
          </span>
        </div>
      )}

      {/* Adresse */}
      {!d.noFixedAddress && (
        <div className="field">
          <label><span className="field-icon">📍</span>{t('originAddress')}</label>
          <input type="text" value={d.address} onChange={e => update('address', e.target.value)}
            placeholder={isFr ? 'Rue, numéro...' : 'Street, number...'} />
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: d.noFixedAddress ? '1fr' : '1fr 1fr', gap: '8px' }}>
        <div className="field">
          <label><span className="field-icon">🏙️</span>{t('city')}</label>
          <input type="text" value={d.city} onChange={e => update('city', e.target.value)} />
        </div>
        {!d.noFixedAddress && (
          <div className="field">
            <label><span className="field-icon">📮</span>{t('postalCode')}</label>
            <input type="text" value={d.postalCode} onChange={e => update('postalCode', e.target.value)} />
          </div>
        )}
      </div>
      {!d.noFixedAddress && (
        <div className="field">
          <label><span className="field-icon">🔼</span>{t('floor')}</label>
          <input type="text" value={d.floor} onChange={e => update('floor', e.target.value)} placeholder="RDC / 2 / ..." />
        </div>
      )}

      {!d.noFixedAddress && (
        <>
          {/* Ascenseur — uniquement pour appartement / bureau */}
          {showElevator && (
            <>
              <div className="field">
                <label><span className="field-icon">🛗</span>{t('elevator')}</label>
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
            <label><span className="field-icon">🅿️</span>{t('parkingTruck')}</label>
            <YesNoCheck value={d.parkingAvailable} onChange={v => update('parkingAvailable', v)} isFr={isFr} />
          </div>
          <div className="field">
            <label style={{ fontSize: '12px' }}>{t('accessDifficult')}</label>
            <YesNoCheck value={d.accessDifficult} onChange={v => update('accessDifficult', v)} isFr={isFr} />
          </div>
          <div className="field">
            <label style={{ fontSize: '12px' }}><span className="field-icon">📏</span>{t('truckDistance')}</label>
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

          {/* Monte-meubles — question séparée, visible pour tous les logements */}
          <div className="field" style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700' }}>
              🏗️ {isFr ? 'Monte-meubles nécessaire ?' : 'Furniture lift needed?'}
            </label>
            <YesNoCheck value={d.furnitureLiftNeeded} onChange={v => update('furnitureLiftNeeded', v)} isFr={isFr} />
          </div>
          {d.furnitureLiftNeeded === 'yes' && (
            <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '12px', marginTop: '4px' }}>
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
                <label style={{ fontSize: '12px' }}><span className="field-icon">💬</span>{isFr ? 'Commentaire monte-meubles' : 'Furniture lift comment'}</label>
                <input
                  type="text"
                  value={d.furnitureLiftComment || ''}
                  onChange={e => update('furnitureLiftComment', e.target.value)}
                  placeholder={isFr ? 'Remarques, contraintes...' : 'Notes, constraints...'}
                />
              </div>
            </div>
          )}

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
            <label><span className="field-icon">📝</span>{t('accessNotes')}</label>
            <textarea value={d.accessNotes} onChange={e => update('accessNotes', e.target.value)}
              placeholder={isFr ? 'Remarques accès, digicode, gardien...' : 'Access notes, code, caretaker...'} />
          </div>
        </>
      )}
    </div>
  );
}

export default function Step2Housing() {
  const { t } = useApp();

  return (
    <>
      <div className="section-header">
        <div className="section-title">{t('housingAccess')}</div>
      </div>
      <AccessBlock prefix="origin" label={t('origin')} />
      <AccessBlock prefix="destination" label={t('destination')} />
    </>
  );
}
