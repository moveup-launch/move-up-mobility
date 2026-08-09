import { useApp } from '../context/AppContext';
import { CATALOG } from '../data/catalog';
import { DESTINATION_PRESETS } from '../data/destinationPresets';

export default function LiveVolumePanel() {
  const {
    lang, t,
    getTotalVolume, getSegmentSolution,
    getRoomVolume, getRoomIcon, getItemsByDestination, state,
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
  const destGroups = getItemsByDestination();
  // N'affiche le récap que s'il y a un vrai dispatch (au moins une
  // destination autre que la principale) — sinon le panneau reste sobre.
  const hasDestinationSplit = Object.keys(destGroups).some(k => k !== 'main');
  const orderedDestKeys = hasDestinationSplit ? [
    ...(destGroups.main ? ['main'] : []),
    ...DESTINATION_PRESETS.map(p => `preset:${p.key}`).filter(k => destGroups[k]),
    ...Object.keys(destGroups).filter(k => k.startsWith('custom:')),
  ] : [];
  const destLabel = (key) => {
    const g = destGroups[key];
    if (g.kind === 'main') return isFr ? '📍 Destination principale' : '📍 Main destination';
    if (g.kind === 'preset') {
      const p = DESTINATION_PRESETS.find(p => p.key === g.key);
      return `${p.emoji} ${isFr ? p.fr : p.en}`;
    }
    return `📍 ${g.label}`;
  };
  // Une "solution logistique" suggérée n'a de sens que pour Maritime/Aérien
  // (getSegmentSolution n'a pas de recommandation dédiée pour la destination
  // principale, Stockage, Groupage ou une destination custom).
  const destContainerReco = (key) => {
    const g = destGroups[key];
    return (g.kind === 'preset' && (g.key === 'sea' || g.key === 'air'))
      ? getSegmentSolution(g.key, g.volume)
      : null;
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

      {/* Récap par destination — uniquement si dispatch réel */}
      {orderedDestKeys.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div className="live-rooms-title" style={{ marginBottom: '6px' }}>
            {isFr ? 'Destinations' : 'Destinations'}
          </div>
          {orderedDestKeys.map(key => {
            const g = destGroups[key];
            const containerReco = destContainerReco(key);
            return (
              <div key={key} style={{
                fontSize: '12px', padding: '5px 8px', marginBottom: '4px',
                background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)',
                color: 'var(--accent)', fontWeight: '600',
              }}>
                {destLabel(key)} — {g.volume.toFixed(2)} m³
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
