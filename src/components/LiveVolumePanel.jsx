import { useApp } from '../context/AppContext';

export default function LiveVolumePanel() {
  const {
    lang, t,
    getTotalVolume, getRecommendedTruck, getRecommendedTeam,
    getRoomVolume, getRoomIcon, state,
  } = useApp();

  const vol = getTotalVolume();
  const truck = getRecommendedTruck(vol);
  const team = getRecommendedTeam(vol);
  const isFr = lang === 'fr';
  const pct = Math.min(100, (vol / 60) * 100);

  const getBarColor = () => {
    if (pct < 40) return 'var(--success)';
    if (pct < 75) return 'var(--warn)';
    return 'var(--danger)';
  };

  return (
    <div className="live-panel">
      <div className="live-panel-title">
        {isFr ? 'Volume en temps réel' : 'Live volume'}
      </div>

      <div className="live-vol-block">
        <div className="live-vol-row">
          <span className="live-vol-num">{vol.toFixed(1)}</span>
          <span className="live-vol-unit">m³</span>
        </div>
        <div className="live-vol-bar-wrap">
          <div
            className="live-vol-bar"
            style={{ width: `${pct}%`, background: getBarColor() }}
          />
        </div>
        <div className="live-vol-caption">
          {isFr ? `${pct.toFixed(0)} % d'un camion 60 m³` : `${pct.toFixed(0)} % of a 60 m³ truck`}
        </div>
      </div>

      <div className="live-stat">
        <span className="live-stat-icon">🚛</span>
        <div className="live-stat-info">
          <div className="live-stat-label">{t('recommendedTruck')}</div>
          <div className="live-stat-value">{truck || '—'}</div>
        </div>
      </div>

      <div className="live-stat">
        <span className="live-stat-icon">👥</span>
        <div className="live-stat-info">
          <div className="live-stat-label">{t('recommendedTeam')}</div>
          <div className="live-stat-value">{team || '—'}</div>
        </div>
      </div>

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
