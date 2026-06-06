import { useApp } from '../context/AppContext';

export default function LiveVolumePanel() {
  const {
    lang, t,
    getTotalVolume, getRecommendedTruck, getRecommendedTeam, getCheckPoints, getSegmentSolution,
    getTotalBoxes, getRoomVolume, getRoomIcon, state,
  } = useApp();

  const vol = getTotalVolume();
  const isFr = lang === 'fr';
  const segments = state.moveSegments || [];

  const totalItems = state.rooms.reduce((sum, r) =>
    sum + (r.items || []).reduce((s, i) => s + i.qty, 0), 0);
  const totalBoxes = getTotalBoxes(state.boxesDone) + getTotalBoxes(state.boxesRemaining);
  const fragileCount = state.rooms.reduce((sum, r) =>
    sum + (r.items || []).filter(i => i.fragile && i.qty > 0).reduce((s, i) => s + i.qty, 0), 0);
  const heavyCount = state.rooms.reduce((sum, r) =>
    sum + (r.items || []).filter(i => i.heavy && i.qty > 0).reduce((s, i) => s + i.qty, 0), 0);
  const checkPoints = getCheckPoints();

  const Stat = ({ label, value, color }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '5px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: '700', color: color || 'var(--text)' }}>{value}</span>
    </div>
  );

  const moveTypeLabel = {
    local: isFr ? 'Local / National' : 'Local / National',
    road: isFr ? 'Routier international' : 'International road',
    sea: isFr ? 'Maritime' : 'Sea freight',
    air: isFr ? 'Aerien' : 'Air freight',
    storage: isFr ? 'Stockage' : 'Storage',
  };

  const mt = state.moveType || 'local';
  const transportRec = getRecommendedTruck(vol);

  const transportOptions = [
    { label: isFr ? 'Route / National' : 'Road / National', match: 'Route / National' },
    { label: isFr ? 'Maritime LCL - groupage' : 'Sea LCL - groupage', match: 'LCL' },
    { label: isFr ? 'Conteneur 20 pieds' : '20ft container', match: '20 pieds' },
    { label: isFr ? 'Conteneur 40 pieds' : '40ft container', match: '40 pieds' },
    { label: isFr ? 'Aerien' : 'Air freight', match: 'aerien' },
    { label: isFr ? 'Stockage' : 'Storage', match: 'Garde-meuble' },
  ];

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

      {/* Solution logistique — liste des modes + recommandation */}
      <div style={{ marginBottom: '12px' }}>
        <div className="live-rooms-title" style={{ marginBottom: '6px' }}>{t('recommendedTransport')}</div>
        {segments.length > 0 ? (
          segments.map(seg => (
            <div key={seg.id} style={{
              fontSize: '12px', padding: '5px 8px', marginBottom: '4px',
              background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)',
              color: 'var(--accent)', fontWeight: '500',
            }}>
              <span style={{ color: 'var(--text2)', marginRight: '4px' }}>
                {moveTypeLabel[seg.type] || seg.type} {seg.volume ? `${seg.volume}m³` : ''}
              </span>
              → {getSegmentSolution(seg.type, seg.volume)}
            </div>
          ))
        ) : (
          transportOptions.map(opt => {
            const isRec = transportRec.toLowerCase().includes(opt.match.toLowerCase()) ||
              (opt.match === 'Route / National' && (mt === 'local' || mt === 'road'));
            return (
              <div key={opt.match} style={{
                fontSize: '12px', padding: '5px 8px', marginBottom: '3px',
                borderRadius: 'var(--radius-sm)',
                background: isRec ? 'var(--accent)' : 'var(--surface2)',
                color: isRec ? 'white' : 'var(--text3)',
                fontWeight: isRec ? '700' : '400',
              }}>
                {isRec ? '→ ' : ''}{opt.label}
                {isRec && vol > 0 && (mt === 'local' || mt === 'road') && (
                  <span style={{ marginLeft: '6px', fontWeight: '400', opacity: 0.85 }}>
                    — {getRecommendedTeam(vol).label}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

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

      {/* Points à vérifier */}
      {checkPoints.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div className="live-rooms-title" style={{ color: 'var(--warn)' }}>{t('liveCheckPoints')}</div>
          {checkPoints.map((pt, i) => (
            <div key={i} style={{ fontSize: '11px', color: 'var(--text2)', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
              {pt}
            </div>
          ))}
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
