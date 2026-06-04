import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const { lang, user, setViewMode, startNewVisit } = useApp();
  const isFr = lang === 'fr';

  const [stats, setStats] = useState({ count: 0, avgVolume: 0, topTruck: null });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: all }, { data: rec }] = await Promise.all([
      supabase.from('visits').select('total_volume, recommended_truck'),
      supabase.from('visits').select('id, client_name, visit_date, total_volume, recommended_truck')
        .order('created_at', { ascending: false }).limit(5),
    ]);

    if (all && all.length > 0) {
      const count = all.length;
      const avgVolume = all.reduce((s, v) => s + (v.total_volume || 0), 0) / count;
      const truckCounts = {};
      all.forEach(v => {
        if (v.recommended_truck) truckCounts[v.recommended_truck] = (truckCounts[v.recommended_truck] || 0) + 1;
      });
      const topTruck = Object.entries(truckCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      setStats({ count, avgVolume, topTruck });
    }
    if (rec) setRecent(rec);
    setLoading(false);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB'); } catch { return d; }
  };

  const emailName = user?.email?.split('@')[0] || '';

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <div className="dashboard-hi">
          {isFr ? `Bonjour, ${emailName} 👋` : `Hello, ${emailName} 👋`}
        </div>
        <div className="dashboard-sub">
          {isFr ? 'Prêt pour une nouvelle visite ?' : 'Ready for a new visit?'}
        </div>
      </div>

      <button className="dashboard-cta" onClick={startNewVisit}>
        ✏️ {isFr ? 'Nouvelle visite' : 'New visit'}
      </button>

      {loading ? (
        <div className="empty-state" style={{ paddingTop: 32 }}>
          <div className="empty-icon">⏳</div>
          <div className="empty-title">{isFr ? 'Chargement…' : 'Loading…'}</div>
        </div>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-card-num">{stats.count}</div>
              <div className="stat-card-label">
                {isFr ? `visite${stats.count !== 1 ? 's' : ''}` : `visit${stats.count !== 1 ? 's' : ''}`}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num">{stats.avgVolume.toFixed(1)}</div>
              <div className="stat-card-label">{isFr ? 'volume moyen (m³)' : 'avg volume (m³)'}</div>
            </div>
            <div className="stat-card stat-card-truck">
              <div className="stat-card-num stat-card-truck-text">{stats.topTruck || '—'}</div>
              <div className="stat-card-label">{isFr ? 'camion le + utilisé' : 'most used truck'}</div>
            </div>
          </div>

          {recent.length > 0 && (
            <div className="dashboard-recent">
              <div className="dashboard-section-title">
                <span>{isFr ? 'Visites récentes' : 'Recent visits'}</span>
                <button className="dashboard-see-all" onClick={() => setViewMode('history')}>
                  {isFr ? 'Voir tout →' : 'See all →'}
                </button>
              </div>
              {recent.map(v => (
                <div key={v.id} className="dashboard-visit-row">
                  <div className="dashboard-visit-left">
                    <div className="dashboard-visit-name">
                      {v.client_name || (isFr ? 'Client sans nom' : 'Unnamed')}
                    </div>
                    <div className="dashboard-visit-date">{formatDate(v.visit_date)}</div>
                  </div>
                  <div className="dashboard-visit-right">
                    <div className="dashboard-visit-vol">{(v.total_volume || 0).toFixed(1)} m³</div>
                    {v.recommended_truck && (
                      <div className="history-truck-badge">{v.recommended_truck}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {stats.count === 0 && (
            <div className="empty-state" style={{ paddingTop: 16 }}>
              <div className="empty-icon">📋</div>
              <div className="empty-title">{isFr ? 'Aucune visite enregistrée' : 'No saved visits'}</div>
              <div className="empty-sub">
                {isFr
                  ? 'Démarrez une visite et enregistrez-la depuis l\'étape Synthèse.'
                  : 'Start a visit and save it from the Summary step.'}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
