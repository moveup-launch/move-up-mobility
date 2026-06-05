import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const { lang, user, setViewMode, startNewVisit } = useApp();
  const isFr = lang === 'fr';

  const [monthStats, setMonthStats] = useState({ count: 0, avgVolume: 0, topCity: null, nextVisit: null });
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const firstOfMonthStr = firstOfMonth.toISOString().split('T')[0];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: allMonth }, { data: visits }] = await Promise.all([
      supabase.from('visits')
        .select('total_volume, origin_data, visit_date')
        .gte('visit_date', firstOfMonthStr),
      supabase.from('visits')
        .select('id, client_name, visit_date, total_volume, recommended_truck')
        .order('visit_date', { ascending: false }),
    ]);

    if (allMonth) {
      const count = allMonth.length;
      const avgVolume = count > 0
        ? allMonth.reduce((s, v) => s + (v.total_volume || 0), 0) / count
        : 0;

      // Ville la plus fréquente (origine)
      const cityCounts = {};
      allMonth.forEach(v => {
        const city = v.origin_data?.city;
        if (city && city.trim()) {
          const c = city.trim();
          cityCounts[c] = (cityCounts[c] || 0) + 1;
        }
      });
      const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      // Prochaine visite
      const nextVisit = (visits || [])
        .filter(v => v.visit_date && v.visit_date >= today)
        .sort((a, b) => (a.visit_date > b.visit_date ? 1 : -1))[0] || null;

      setMonthStats({ count, avgVolume, topCity, nextVisit });
    }

    if (visits) {
      const up = visits.filter(v => v.visit_date && v.visit_date >= today)
        .sort((a, b) => (a.visit_date > b.visit_date ? 1 : -1));
      const pa = visits.filter(v => !v.visit_date || v.visit_date < today);
      setUpcoming(up);
      setPast(pa);
    }

    setLoading(false);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB'); } catch { return d; }
  };

  const formatDateShort = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short' });
    } catch { return d; }
  };

  const emailName = user?.email?.split('@')[0] || '';

  const VisitRow = ({ v }) => (
    <div className="dashboard-visit-row">
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
  );

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
          {/* Stats ce mois */}
          <div style={{ padding: '0 16px 4px', fontSize: '12px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em' }}>
            {isFr ? `CE MOIS` : `THIS MONTH`}
          </div>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-card-num">{monthStats.count}</div>
              <div className="stat-card-label">
                {isFr ? `visite${monthStats.count !== 1 ? 's' : ''}` : `visit${monthStats.count !== 1 ? 's' : ''}`}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num">{monthStats.avgVolume.toFixed(1)}</div>
              <div className="stat-card-label">{isFr ? 'vol. moy. m³' : 'avg vol. m³'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num stat-card-truck-text" style={{ fontSize: monthStats.topCity ? '14px' : '20px' }}>
                {monthStats.topCity || '—'}
              </div>
              <div className="stat-card-label">{isFr ? 'ville fréquente' : 'top city'}</div>
            </div>
          </div>

          {/* Prochaine visite */}
          {monthStats.nextVisit && (
            <div style={{
              margin: '0 0 12px', padding: '12px 16px',
              background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ fontSize: '22px' }}>📅</div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isFr ? 'Prochaine visite' : 'Next visit'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                  {monthStats.nextVisit.client_name || (isFr ? 'Client sans nom' : 'Unnamed')}
                  <span style={{ fontWeight: '400', color: 'var(--text2)', marginLeft: '8px' }}>
                    — {formatDateShort(monthStats.nextVisit.visit_date)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="dashboard-recent">
              <div className="dashboard-section-title">
                <span>{isFr ? 'Visites à venir' : 'Upcoming visits'}</span>
                <button className="dashboard-see-all" onClick={() => setViewMode('history')}>
                  {isFr ? 'Voir tout →' : 'See all →'}
                </button>
              </div>
              {upcoming.map(v => <VisitRow key={v.id} v={v} />)}
            </div>
          )}

          {past.length > 0 && (
            <div className="dashboard-recent">
              <div className="dashboard-section-title">
                <span>{isFr ? 'Visites passées' : 'Past visits'}</span>
                {upcoming.length === 0 && (
                  <button className="dashboard-see-all" onClick={() => setViewMode('history')}>
                    {isFr ? 'Voir tout →' : 'See all →'}
                  </button>
                )}
              </div>
              {past.slice(0, 5).map(v => <VisitRow key={v.id} v={v} />)}
              {past.length > 5 && (
                <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                  <button className="dashboard-see-all" onClick={() => setViewMode('history')}>
                    {isFr ? `+${past.length - 5} autres →` : `+${past.length - 5} more →`}
                  </button>
                </div>
              )}
            </div>
          )}

          {monthStats.count === 0 && upcoming.length === 0 && past.length === 0 && (
            <div className="empty-state" style={{ paddingTop: 16 }}>
              <div className="empty-icon">📋</div>
              <div className="empty-title">{isFr ? 'Aucune visite enregistrée' : 'No saved visits'}</div>
              <div className="empty-sub">
                {isFr
                  ? "Démarrez une visite et enregistrez-la depuis l'étape Synthèse."
                  : 'Start a visit and save it from the Summary step.'}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
