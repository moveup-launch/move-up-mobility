import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sendConfirmationEmail } from '../lib/resend';

const MOVE_TYPE_OPTIONS_FR = [
  { val: 'local', label: 'Local / National' },
  { val: 'road', label: 'International routier' },
  { val: 'sea', label: 'Maritime' },
  { val: 'air', label: 'Aerien' },
  { val: 'storage', label: 'Stockage' },
];
const MOVE_TYPE_OPTIONS_EN = [
  { val: 'local', label: 'Local / National' },
  { val: 'road', label: 'International road' },
  { val: 'sea', label: 'Sea freight' },
  { val: 'air', label: 'Air freight' },
  { val: 'storage', label: 'Storage' },
];

const TRANSPORT_OVERRIDE_OPTIONS_FR = [
  { val: 'Route / National', label: 'Route / National' },
  { val: 'Maritime LCL - groupage', label: 'Maritime LCL - groupage' },
  { val: 'Conteneur 20 pieds', label: 'Conteneur 20 pieds' },
  { val: 'Conteneur 40 pieds', label: 'Conteneur 40 pieds' },
  { val: 'Aerien', label: 'Aerien / Groupage aerien' },
];
const TRANSPORT_OVERRIDE_OPTIONS_EN = [
  { val: 'Road / National', label: 'Road / National' },
  { val: 'Sea LCL - groupage', label: 'Sea LCL - groupage' },
  { val: '20ft container', label: '20ft container' },
  { val: '40ft container', label: '40ft container' },
  { val: 'Air freight', label: 'Air freight / groupage' },
];

function MoveSegmentRow({ seg }) {
  const { lang, updateMoveSegment, removeMoveSegment, getSegmentSolution } = useApp();
  const isFr = lang === 'fr';
  const opts = isFr ? MOVE_TYPE_OPTIONS_FR : MOVE_TYPE_OPTIONS_EN;
  const solution = getSegmentSolution(seg.type, seg.volume);

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
      padding: '12px', marginBottom: '8px', background: 'var(--surface)',
    }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
        <select
          value={seg.type}
          onChange={e => updateMoveSegment(seg.id, 'type', e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg)' }}
        >
          {opts.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="number" min="0" step="0.5"
            value={seg.volume || ''}
            onChange={e => updateMoveSegment(seg.id, 'volume', parseFloat(e.target.value) || 0)}
            placeholder="m³"
            style={{ width: '64px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', textAlign: 'center', background: 'var(--bg)' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>m³</span>
        </div>
        <button
          onClick={() => removeMoveSegment(seg.id)}
          style={{
            background: 'var(--danger-light)', color: 'var(--danger)',
            border: 'none', borderRadius: '8px', padding: '8px 10px',
            cursor: 'pointer', fontSize: '16px', lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', marginBottom: '8px' }}>
        → {solution}
      </div>
      <input
        type="text"
        value={seg.comment || ''}
        onChange={e => updateMoveSegment(seg.id, 'comment', e.target.value)}
        placeholder={isFr ? 'Commentaire (ex: effets urgents)...' : 'Comment (e.g. urgent items)...'}
        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg)' }}
      />
    </div>
  );
}

export default function Step5Summary() {
  const {
    t, lang, state,
    getTotalVolume, getRecommendedTruck, getRecommendedTeam, getEquipment,
    getAllFragile, getAllHeavy, getAllDisassembly, getAllCrateItems, getCheckPoints,
    getTotalBoxes, getBoxVolume, getRoomVolume, getRoomIcon,
    saveVisit, setViewMode, addMoveSegment, setTransportOverride,
  } = useApp();

  const [saveStatus, setSaveStatus] = useState('idle');
  const [transportPickerOpen, setTransportPickerOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState('idle');

  const vol = getTotalVolume();
  const truckAuto = getRecommendedTruck(vol);
  const truck = state.transportOverride || truckAuto;
  const team = getRecommendedTeam(vol);
  const equip = getEquipment();
  const fragile = getAllFragile();
  const heavy = getAllHeavy();
  const disassembly = getAllDisassembly();
  const crateItems = getAllCrateItems();
  const checkPoints = getCheckPoints();
  const boxesDoneCount = getTotalBoxes(state.boxesDone);
  const boxesRemCount = getTotalBoxes(state.boxesRemaining);
  const isFr = lang === 'fr';
  const isEditing = !!state.editingVisitId;
  const mt = state.moveType || 'local';
  const segments = state.moveSegments || [];
  const transportLabel = t('recommendedTransport');
  const transportOpts = isFr ? TRANSPORT_OVERRIDE_OPTIONS_FR : TRANSPORT_OVERRIDE_OPTIONS_EN;

  const handleSave = async () => {
    setSaveStatus('saving');
    const { error } = await saveVisit();
    if (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('saved');
      setEmailStatus('idle');
    }
  };

  const handleSendEmail = async () => {
    if (!state.client.email) return;
    setEmailStatus('sending');
    const { error } = await sendConfirmationEmail({
      to: state.client.email,
      clientName: state.client.name,
      visitDate: state.client.visitDate,
      visitTime: state.client.visitTime,
      commercialName: state.client.surveyor,
      originAddress: [state.origin.address, state.origin.postalCode, state.origin.city].filter(Boolean).join(', '),
      lang,
    });
    if (error) {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 4000);
    } else {
      setEmailStatus('sent');
    }
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">{t('summary')}</div>
        {isEditing && (
          <div className="section-subtitle" style={{ color: 'var(--accent)' }}>
            {isFr ? 'Modification en cours' : 'Editing visit'}
          </div>
        )}
      </div>

      <div className="summary-big">
        <div className="big-num">{vol.toFixed(1)}</div>
        <div className="big-unit">m³</div>
        <div className="big-label">{t('totalVolumeLabel')}</div>
      </div>

      {/* Points à vérifier */}
      {checkPoints.length > 0 && (
        <div className="card" style={{ borderLeft: '3px solid var(--warn)' }}>
          <div className="card-title" style={{ color: 'var(--warn)' }}>
            {t('checkPoints')} ({checkPoints.length})
          </div>
          {checkPoints.map((pt, i) => (
            <div key={i} style={{ fontSize: '13px', color: 'var(--text2)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
              {pt}
            </div>
          ))}
        </div>
      )}

      {/* Répartition du déménagement */}
      <div className="card">
        <div className="card-title">{t('moveBreakdown')}</div>
        {segments.length === 0 && (
          <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '10px' }}>
            {isFr
              ? 'Ajoutez une ligne pour détailler la répartition (maritime, aérien, stockage...)'
              : 'Add a line to detail the breakdown (sea, air, storage...)'}
          </div>
        )}
        {segments.map(seg => <MoveSegmentRow key={seg.id} seg={seg} />)}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '10px', fontSize: '13px', borderStyle: 'dashed' }}
          onClick={addMoveSegment}
        >
          + {t('addSegment')}
        </button>
      </div>

      {/* Transport global — modifiable */}
      <div className="summary-stat">
        <div className="stat-icon">🚛</div>
        <div className="stat-info" style={{ flex: 1 }}>
          <div className="stat-label">{transportLabel}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="stat-value">{truck}</div>
            {state.transportOverride && (
              <button
                onClick={() => { setTransportOverride(null); setTransportPickerOpen(false); }}
                style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '12px',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  cursor: 'pointer', color: 'var(--text3)',
                }}
              >
                {t('resetAuto')}
              </button>
            )}
            <button
              onClick={() => setTransportPickerOpen(o => !o)}
              style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '12px',
                background: 'var(--accent-light)', border: '1px solid var(--accent)',
                cursor: 'pointer', color: 'var(--accent)', fontWeight: '600',
              }}
            >
              ✏️ {t('modifyTransport')}
            </button>
          </div>
          {/* Picker de transport */}
          {transportPickerOpen && (
            <div style={{
              marginTop: '8px', background: 'var(--surface2)',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              {transportOpts.map(opt => (
                <div
                  key={opt.val}
                  onClick={() => { setTransportOverride(opt.val); setTransportPickerOpen(false); }}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', fontSize: '13px',
                    background: truck === opt.val ? 'var(--accent-light)' : 'transparent',
                    color: truck === opt.val ? 'var(--accent)' : 'var(--text)',
                    fontWeight: truck === opt.val ? '700' : '400',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {truck === opt.val ? '→ ' : ''}{opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Équipe — ratio intelligent */}
      {(mt === 'local' || mt === 'road') && (
        <div className="summary-stat">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-label">{t('recommendedTeam')}</div>
            <div className="stat-value">{team.label}</div>
            {team.reasons.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                {team.reasons.map((r, i) => (
                  <div key={i} style={{ fontSize: '11px', color: 'var(--text3)', lineHeight: '1.5' }}>
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="summary-stat">
        <div className="stat-icon">🛠️</div>
        <div className="stat-info">
          <div className="stat-label">{t('requiredEquipment')}</div>
          <div className="stat-value" style={{ fontSize: '13px', lineHeight: '1.7' }}>
            {equip.map((e, i) => <span key={i} style={{ display: 'block' }}>- {e}</span>)}
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

      {/* Caisse bois */}
      {crateItems.length > 0 && (
        <div className="card" style={{ borderLeft: '3px solid var(--warn)' }}>
          <div className="card-title" style={{ color: 'var(--warn)' }}>
            🗃️ {t('crateItems')} ({crateItems.length})
          </div>
          <ul className="item-list-summary">
            {crateItems.map((item, i) => (
              <li key={i}>
                <span>{item.icon} {item.name} <em style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.roomName}</em></span>
                <strong>x{item.qty}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fragile.length > 0 && (
        <div className="card">
          <div className="card-title">{t('fragileItems')} ({fragile.length})</div>
          <ul className="item-list-summary">
            {fragile.map((item, i) => (
              <li key={i}>
                <span>{item.icon} {item.name} <em style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.roomName}</em></span>
                <strong>x{item.qty}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {heavy.length > 0 && (
        <div className="card">
          <div className="card-title">{t('heavyItems')} ({heavy.length})</div>
          <ul className="item-list-summary">
            {heavy.map((item, i) => (
              <li key={i}>
                <span>{item.icon} {item.name} <em style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.roomName}</em></span>
                <strong>x{item.qty}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {disassembly.length > 0 && (
        <div className="card">
          <div className="card-title">{t('disassemblyItems')} ({disassembly.length})</div>
          <ul className="item-list-summary">
            {disassembly.map((item, i) => (
              <li key={i}>
                <span>{item.icon} {item.name} <em style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.roomName}</em></span>
                <strong>x{item.qty}</strong>
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
          <li><span>{isFr ? 'Volume faits' : 'Packed vol.'}</span><strong>{getBoxVolume(state.boxesDone).toFixed(2)} m³</strong></li>
          <li><span>{isFr ? 'Volume restants' : 'Remaining vol.'}</span><strong>{getBoxVolume(state.boxesRemaining).toFixed(2)} m³</strong></li>
        </ul>
      </div>

      <div style={{ marginTop: 8, marginBottom: 8 }}>
        {saveStatus === 'saved' ? (
          <div>
            <div className="save-success-banner">
              <span>✅ {isEditing
                ? (isFr ? 'Visite mise à jour !' : 'Visit updated!')
                : (isFr ? 'Visite enregistrée !' : 'Visit saved!')
              }</span>
              <button className="save-history-link" onClick={() => setViewMode('history')}>
                {isFr ? "Voir l'historique →" : 'View history →'}
              </button>
            </div>
            {/* Bouton email confirmation */}
            {state.client.email ? (
              emailStatus === 'sent' ? (
                <div style={{
                  marginTop: '8px', padding: '12px 14px', background: '#F0FDF4',
                  border: '1px solid #BBF7D0', borderRadius: '10px',
                  textAlign: 'center', color: '#16A34A', fontWeight: '700', fontSize: '14px',
                }}>
                  ✅ {t('confirmEmailSent')} — {state.client.email}
                </div>
              ) : (
                <button
                  onClick={handleSendEmail}
                  disabled={emailStatus === 'sending'}
                  style={{
                    width: '100%', marginTop: '8px', padding: '12px 14px',
                    borderRadius: '10px', border: '2px solid var(--accent)',
                    background: 'var(--accent-light)', color: 'var(--accent)',
                    fontWeight: '700', fontSize: '14px',
                    cursor: emailStatus === 'sending' ? 'default' : 'pointer',
                    opacity: emailStatus === 'sending' ? 0.7 : 1,
                  }}
                >
                  {emailStatus === 'sending'
                    ? (isFr ? '⏳ Envoi…' : '⏳ Sending…')
                    : emailStatus === 'error'
                      ? `❌ ${t('confirmEmailError')} — ${isFr ? 'réessayer' : 'retry'}`
                      : `✉️ ${t('sendConfirmEmail')}`}
                </button>
              )
            ) : null}
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
                ? (isFr ? 'Erreur — réessayer' : 'Error — retry')
                : isEditing
                  ? (isFr ? '💾 Mettre à jour' : '💾 Update visit')
                  : (isFr ? '💾 Enregistrer la visite' : '💾 Save visit')}
          </button>
        )}
      </div>
    </>
  );
}
