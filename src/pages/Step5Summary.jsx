import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

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

function MoveSegmentRow({ seg }) {
  const { lang, updateMoveSegment, removeMoveSegment, getSegmentSolution } = useApp();
  const isFr = lang === 'fr';
  const opts = isFr ? MOVE_TYPE_OPTIONS_FR : MOVE_TYPE_OPTIONS_EN;
  const solution = seg.type ? getSegmentSolution(seg.type, seg.volume) : null;

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
          <option value="">{isFr ? '— Choisir un mode —' : '— Choose mode —'}</option>
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
      {solution && (
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', marginBottom: '8px' }}>
          → {solution}
        </div>
      )}
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
    getTotalVolume, getRecommendedTeam, getEquipment,
    getAllFragile, getAllHeavy, getAllDisassembly, getAllCrateItems, getCheckPoints,
    getRoomVolume, getRoomIcon,
    getSegmentSolution, getItemsByTransportMode,
    saveVisit, setViewMode, addMoveSegment, openNewQuote,
  } = useApp();

  const [saveStatus, setSaveStatus] = useState('idle');

  const vol = getTotalVolume();
  const team = getRecommendedTeam(vol);
  const equip = getEquipment();
  const fragile = getAllFragile();
  const heavy = getAllHeavy();
  const disassembly = getAllDisassembly();
  const crateItems = getAllCrateItems();
  const checkPoints = getCheckPoints();
  const isFr = lang === 'fr';
  const isEditing = !!state.editingVisitId;
  const mt = state.moveType || 'local';
  const segments = state.moveSegments || [];

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

  const handleSendSMS = () => {
    const phone = state.client.phone;
    if (!phone) return;
    const msg = isFr
      ? `Bonjour ${state.client.name || ''},\n\nVotre visite de déménagement du ${state.client.visitDate} a bien été enregistrée.\nVolume estimé : ${vol.toFixed(1)} m³.\n\nN'hésitez pas à nous contacter pour tout renseignement.`
      : `Hello ${state.client.name || ''},\n\nYour moving visit of ${state.client.visitDate} has been recorded.\nEstimated volume: ${vol.toFixed(1)} m³.\n\nFeel free to contact us for any questions.`;
    window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`);
  };

  const handleSendEmail = () => {
    const email = state.client.email;
    if (!email) return;
    const subject = isFr
      ? `Récapitulatif visite déménagement — ${state.client.visitDate}`
      : `Moving visit summary — ${state.client.visitDate}`;
    const origin = [state.origin.address, state.origin.postalCode, state.origin.city].filter(Boolean).join(', ');
    const dest = state.destination.noFixedAddress
      ? (isFr ? state.destination.city || 'Destination à définir' : state.destination.city || 'Destination TBD')
      : [state.destination.address, state.destination.postalCode, state.destination.city].filter(Boolean).join(', ');
    const body = isFr
      ? `Bonjour ${state.client.name || ''},\n\nVotre visite de déménagement du ${state.client.visitDate} a bien été enregistrée.\n\nDépart : ${origin}\nArrivée : ${dest}\nVolume estimé : ${vol.toFixed(1)} m³\n\nCordialement,\n${state.client.surveyor || ''}`
      : `Hello ${state.client.name || ''},\n\nYour moving visit of ${state.client.visitDate} has been recorded.\n\nOrigin: ${origin}\nDestination: ${dest}\nEstimated volume: ${vol.toFixed(1)} m³\n\nBest regards,\n${state.client.surveyor || ''}`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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

      {/* Répartition du déménagement — uniquement si plusieurs modes sur les objets */}
      {(() => {
        const modeMap = getItemsByTransportMode();
        const definedCount = ['road', 'sea', 'air', 'storage'].filter(m => modeMap[m]).length;
        if (definedCount < 2 && segments.length === 0) return null;
        return (
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
        );
      })()}

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

      {/* Répartition par mode transport */}
      {(() => {
        const modeMap = getItemsByTransportMode();
        const ORDERED_MODES = ['road', 'sea', 'air', 'storage'];
        const definedModes = ORDERED_MODES.filter(m => modeMap[m]);
        if (definedModes.length === 0) return null;
        const modeInfo = {
          road:    { fr: '🚛 Route',    en: '🚛 Road'    },
          sea:     { fr: '🚢 Maritime', en: '🚢 Sea'     },
          air:     { fr: '✈️ Aérien',  en: '✈️ Air'    },
          storage: { fr: '📦 Stockage', en: '📦 Storage' },
        };
        return (
          <div className="card">
            <div className="card-title">
              {isFr ? 'Répartition par mode de transport' : 'Breakdown by transport mode'}
            </div>
            {definedModes.map((mode, idx) => {
              const g = modeMap[mode];
              const label = modeInfo[mode][isFr ? 'fr' : 'en'];
              const containerReco = mode === 'sea' ? getSegmentSolution('sea', g.volume) : null;
              return (
                <div key={mode} style={{ marginBottom: idx < definedModes.length - 1 ? '14px' : '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                    <span>{label}</span>
                    <span>{g.volume.toFixed(2)} m³</span>
                  </div>
                  {containerReco && (
                    <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', marginBottom: '6px' }}>
                      → {containerReco}
                    </div>
                  )}
                  <ul className="item-list-summary" style={{ margin: 0 }}>
                    {g.items.map((it, i) => (
                      <li key={i} style={{ fontSize: '12px' }}>
                        <span>{it.icon} {it.name}</span>
                        <strong>×{it.qty}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {modeMap['undefined'] && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text3)' }}>
                <span>❓ {isFr ? 'Non défini' : 'Undefined'}</span>
                <span>{modeMap['undefined'].volume.toFixed(2)} m³ — {modeMap['undefined'].count} {isFr ? 'obj.' : 'item(s)'}</span>
              </div>
            )}
          </div>
        );
      })()}

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

      {(() => {
        const roomBoxData = state.rooms.map(r => {
          const merged = {};
          [...Object.entries(r.boxesDone || {}), ...Object.entries(r.boxesRemaining || {})].forEach(([id, qty]) => {
            if (qty > 0) merged[id] = (merged[id] || 0) + qty;
          });
          const total = Object.values(merged).reduce((s, v) => s + v, 0);
          const vol = Object.entries(merged).reduce((s, [id, qty]) => {
            const bt = CATALOG.boxTypes.find(b => b.id === id);
            return s + (bt ? bt.volume_m3 * qty : 0);
          }, 0);
          return { room: r, merged, total, vol };
        }).filter(x => x.total > 0);

        if (roomBoxData.length === 0) return null;

        const grandTotal = roomBoxData.reduce((s, x) => s + x.total, 0);
        const grandVol = roomBoxData.reduce((s, x) => s + x.vol, 0);

        return (
          <div className="card">
            <div className="card-title">📦 {t('boxesSummary')}</div>
            {roomBoxData.map(({ room, merged }) => (
              <div key={room.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: '700', fontSize: '13px' }}>
                  {getRoomIcon(room.type)} {room.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text2)', paddingLeft: '4px' }}>
                  {Object.entries(merged).map(([id, qty]) => {
                    const bt = CATALOG.boxTypes.find(b => b.id === id);
                    if (!bt) return null;
                    return (
                      <span key={id} style={{ marginRight: '10px' }}>
                        {qty} {t(bt.nameKey)}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', fontWeight: '700', fontSize: '13px' }}>
              <span>Total</span>
              <strong>{grandTotal} {isFr ? 'cartons' : 'boxes'} — {grandVol.toFixed(2)} m³</strong>
            </div>
          </div>
        );
      })()}

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
            {/* Boutons contact client */}
            {(state.client.phone || state.client.email) && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {state.client.phone && (
                  <button
                    onClick={handleSendSMS}
                    style={{
                      flex: 1, padding: '11px 10px', borderRadius: '10px',
                      border: '2px solid #16A34A', background: '#F0FDF4', color: '#16A34A',
                      fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    📱 {isFr ? 'SMS client' : 'SMS client'}
                  </button>
                )}
                {state.client.email && (
                  <button
                    onClick={handleSendEmail}
                    style={{
                      flex: 1, padding: '11px 10px', borderRadius: '10px',
                      border: '2px solid var(--accent)', background: 'var(--accent-light)', color: 'var(--accent)',
                      fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    📧 {isFr ? 'Email client' : 'Email client'}
                  </button>
                )}
              </div>
            )}
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
        <button
          onClick={() => openNewQuote({
            id: state.editingVisitId || null,
            client_name: state.client.name || '',
            client_email: state.client.email || '',
            client_phone: state.client.phone || '',
            client_data: state.client,
            origin_data: state.origin,
            destination_data: state.destination,
            total_volume: vol,
            rooms_data: state.rooms,
          })}
          style={{
            width: '100%', marginTop: '8px', padding: '14px', borderRadius: '10px',
            border: '2px solid #7C3AED', background: '#F5F3FF',
            color: '#7C3AED', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
          }}
        >
          📋 {isFr ? 'Générer un devis' : 'Generate a quote'}
        </button>
      </div>
    </>
  );
}
