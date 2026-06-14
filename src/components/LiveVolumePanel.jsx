import { useApp } from '../context/AppContext';
import { CATALOG } from '../data/catalog';

export default function LiveVolumePanel() {
  const {
    lang, t,
    getTotalVolume, getSegmentSolution,
    getRoomVolume, getRoomIcon, getItemsByTransportMode, state,
  } = useApp();

  const vol = getTotalVolume();
  const isFr = lang === 'fr';

  const totalItems = state.rooms.reduce((sum, r) =>
    sum + (r.items || []).reduce((s, i) => s + i.qty, 0), 0);
  const boxCatIds = new Set(CATALOG.boxes.map(b => b.id));
  const totalBoxes = state.rooms.reduce((s, r) =>
    s + (r.items || []).filter(i => i.qty > 0 && boxCatIds.has(i.catalogId)).reduce((ss, i) => ss + i.qty, 0), 0);
  const fragileCount = state.rooms.reduce((sum, r) =>
    sum + (r.items || []).filter(i => i.fragile && i.qty > 0).reduce((s, i) => s + i.qty, 0), 0);
  const heavyCount = state.rooms.reduce((sum, r) =>
    sum + (r.items || []).filter(i => i.heavy && i.qty > 0).reduce((s, i) => s + i.qty, 0), 0);
  const modeMap = getItemsByTransportMode();
  const ORDERED_MODES = ['road', 'sea', 'air', 'storage'];
  const definedModes = ORDERED_MODES.filter(m => modeMap[m]);
  const modeInfo = {
    road:    { fr: '🚛 Route',    en: '🚛 Road'    },
    sea:     { fr: '🚢 Maritime', en: '🚢 Sea'     },
    air:     { fr: '✈️ Aérien',  en: '✈️ Air'    },
    storage: { fr: '📦 Stockage', en: '📦 Storage' },
  };

  const Stat = ({ label, value, color }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '5px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: '700', color: color || 'var(--text)' }}>{value}</span>
    </div>
  );

  return (
    <div className="live-panel">
      <div className="live-panel-title">{t('liveVolume')}</div>

      {/* Volume principal */}
      <div className="live-vol-block">
        <div className="live-vol-row">
          <span className="live-vol-num">{vol.toFixed(1)}</span>
          <span className="live-vol-unit">m³</span>
        </div>
      </div>

      {/* Stats clés */}
      <div style={{ marginBottom: '12px' }}>
        <Stat label={t('liveRooms')} value={state.rooms.length} />
        <Stat label={t('liveItems')} value={totalItems} />
        <Stat label={t('liveBoxes')} value={totalBoxes} />
        <Stat label={t('liveFragile')} value={fragileCount} color={fragileCount > 0 ? 'var(--danger)' : undefined} />
        <Stat label={t('liveHeavy')} value={heavyCount} color={heavyCount > 0 ? 'var(--warn)' : undefined} />
      </div>

      {/* Récap modes de transport — uniquement si modes assignés */}
      {definedModes.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div className="live-rooms-title" style={{ marginBottom: '6px' }}>
            {isFr ? 'Modes de transport' : 'Transport modes'}
          </div>
          {definedModes.map(mode => {
            const g = modeMap[mode];
            const label = modeInfo[mode][isFr ? 'fr' : 'en'];
            const containerReco = mode === 'sea' ? getSegmentSolution('sea', g.volume) : null;
            return (
              <div key={mode} style={{
                fontSize: '12px', padding: '5px 8px', marginBottom: '4px',
                background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)', fontWeight: '600',
              }}>
                {label} — {g.volume.toFixed(2)} m³
                {containerReco && (
                  <span style={{ fontWeight: '400', opacity: 0.85 }}> ({containerReco})</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Par pièce */}
      {state.rooms.length > 0 && (
        <div className="live-rooms">
          <div className="live-rooms-title">{t('perRoom')}</div>
          {state.rooms.map(r => {
            const rv = getRoomVolume(r);
            const rpct = vol > 0 ? (rv / vol) * 100 : 0;
            return (
              <div key={r.id} className="live-room-row">
                <div className="live-room-left">
                  <span className="live-room-icon">{getRoomIcon(r.type)}</span>
                  <span className="live-room-name">{r.name}</span>
                </div>
                <div className="live-room-right">
                  <div className="live-room-bar-wrap">
                    <div className="live-room-bar" style={{ width: `${rpct}%` }} />
                  </div>
                  <span className="live-room-vol">{rv.toFixed(2)} m³</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {state.rooms.length === 0 && (
        <div className="live-empty">
          {isFr ? 'Ajoutez des pièces pour voir le volume.' : 'Add rooms to see the volume.'}
        </div>
      )}
    </div>
  );
}
