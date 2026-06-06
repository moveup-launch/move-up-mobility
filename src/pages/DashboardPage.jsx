import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

function getStatusInfo(status, isFr) {
  const map = {
    prevue:   { label: isFr ? 'Prévue' : 'Planned',     color: '#2B6BE6', bg: '#EEF4FF' },
    en_cours: { label: isFr ? 'En cours' : 'In progress', color: '#D97706', bg: '#FFFBEB' },
    terminee: { label: isFr ? 'Terminée' : 'Completed',  color: '#16A34A', bg: '#F0FDF4' },
    annulee:  { label: isFr ? 'Annulée' : 'Cancelled',   color: '#6B7280', bg: '#F3F4F6' },
  };
  return map[status || 'prevue'] || map.prevue;
}

export default function DashboardPage() {
  const { t, lang, user, setViewMode, startNewVisit, loadVisit, goToStep } = useApp();
  const isFr = lang === 'fr';

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const firstOfMonthStr = firstOfMonth.toISOString().split('T')[0];

  const startOfWeek = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
    return d.toISOString().split('T')[0];
  })();
  const endOfWeek = (() => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('visits')
      .select('id, client_name, client_phone, visit_date, visit_time, visit_status, total_volume, recommended_truck, origin_data, client_data')
      .order('visit_date', { ascending: true });
    setVisits(data || []);
    setLoading(false);
  };

  const handleStart = (v) => { loadVisit(v); };
  const handleEdit = (v) => { loadVisit(v); };
  const handlePDF = (v) => { loadVisit(v); goToStep(4); };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d + 'T12:00:00').toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { weekday: 'short', day: '2-digit', month: 'short' }); }
    catch { return d; }
  };

  const emailName = user?.email?.split('@')[0] || '';

  // Stats ce mois
  const monthVisits = visits.filter(v => v.visit_date && v.visit_date >= firstOfMonthStr && v.visit_date <= today);
  const monthCount = monthVisits.length;
  const monthAvgVol = monthCount > 0 ? monthVisits.reduce((s, v) => s + (v.total_volume || 0), 0) / monthCount : 0;
  const nextVisit = visits.filter(v => v.visit_date >= today && v.visit_status !== 'annulee')
    .sort((a, b) => (a.visit_date > b.visit_date ? 1 : -1))[0];

  // Filtrage
  const getFiltered = () => {
    switch (filter) {
      case 'today':    return visits.filter(v => v.visit_date === today);
      case 'week':     return visits.filter(v => v.visit_date >= startOfWeek && v.visit_date <= endOfWeek);
      case 'upcoming': return visits.filter(v => v.visit_date >= today).sort((a, b) => a.visit_date > b.visit_date ? 1 : -1);
      case 'past':     return visits.filter(v => v.visit_date < today).sort((a, b) => a.visit_date > b.visit_date ? -1 : 1);
      default:         return [...visits].sort((a, b) => a.visit_date > b.visit_date ? 1 : -1);
    }
  };

  const FILTERS = [
    { key: 'today',    label: t('filterToday') },
    { key: 'week',     label: t('filterWeek') },
    { key: 'upcoming', label: t('filterUpcoming') },
    { key: 'past',     label: t('filterPast') },
  ];

  const VisitCard = ({ v, isPast }) => {
    const status = getStatusInfo(v.visit_status, isFr);
    const city = v.origin_data?.city || v.client_data?.city || '';
    const phone = v.client_phone || v.client_data?.phone || '';

    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '14px',
        borderLeft: `3px solid ${status.color}`,
      }}>
        {/* Ligne 1 : date + heure + statut */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>
              {formatDate(v.visit_date)}
            </span>
            {v.visit_time && (
              <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600' }}>
                {v.visit_time}
              </span>
            )}
          </div>
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px',
            background: status.bg, color: status.color,
          }}>
            {status.label}
          </span>
        </div>

        {/* Ligne 2 : client + ville */}
        <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text)', marginBottom: '2px' }}>
          {v.client_name || (isFr ? 'Client sans nom' : 'Unnamed client')}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>
          {city && <span>📍 {city}</span>}
          {v.total_volume > 0 && <span style={{ marginLeft: city ? '10px' : 0 }}>📦 {(v.total_volume || 0).toFixed(1)} m³</span>}
        </div>

        {/* Téléphone cliquable */}
        {phone && (
          <a href={`tel:${phone}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '13px', color: 'var(--accent)', textDecoration: 'none',
            fontWeight: '600', marginBottom: '10px',
          }}>
            📞 {phone}
          </a>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: phone ? '0' : '4px' }}>
          {!isPast && (
            <button
              onClick={() => handleStart(v)}
              style={{
                flex: 2, padding: '9px 12px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: 'white', fontWeight: '700',
                fontSize: '13px', cursor: 'pointer',
              }}
            >
              ▶ {t('startVisit')}
            </button>
          )}
          <button
            onClick={() => handleEdit(v)}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'var(--surface2)',
              color: 'var(--text)', fontSize: '13px', cursor: 'pointer',
            }}
          >
            ✏️ {isFr ? 'Modifier' : 'Edit'}
          </button>
          {isPast && (
            <button
              onClick={() => handlePDF(v)}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: '8px',
                border: '1px solid var(--accent)', background: 'var(--accent-light)',
                color: 'var(--accent)', fontSize: '13px', cursor: 'pointer', fontWeight: '600',
              }}
            >
              📄 PDF
            </button>
          )}
        </div>
      </div>
    );
  };

  const filteredVisits = getFiltered();
  const isPastFilter = filter === 'past';

  return (
    <div className="dashboard">
      {/* Accueil */}
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
          <div style={{ padding: '0 0 4px', fontSize: '11px', color: 'var(--text3)', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {isFr ? 'Ce mois' : 'This month'}
          </div>
          <div className="dashboard-stats" style={{ marginBottom: '16px' }}>
            <div className="stat-card">
              <div className="stat-card-num">{monthCount}</div>
              <div className="stat-card-label">{isFr ? `visite${monthCount !== 1 ? 's' : ''}` : `visit${monthCount !== 1 ? 's' : ''}`}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num">{monthAvgVol.toFixed(1)}</div>
              <div className="stat-card-label">{isFr ? 'vol. moy. m³' : 'avg vol. m³'}</div>
            </div>
            <div className="stat-card" style={{ cursor: nextVisit ? 'pointer' : 'default' }} onClick={() => nextVisit && setFilter('upcoming')}>
              <div className="stat-card-num" style={{ fontSize: nextVisit ? '12px' : '20px', lineHeight: 1.3 }}>
                {nextVisit ? (
                  <>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--accent)' }}>
                      {nextVisit.client_name?.split(' ')[0] || '—'}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text2)' }}>
                      {formatDate(nextVisit.visit_date)}
                    </div>
                  </>
                ) : '—'}
              </div>
              <div className="stat-card-label">{isFr ? 'prochaine visite' : 'next visit'}</div>
            </div>
          </div>

          {/* Filtres rapides */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '2px' }}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '7px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none',
                  background: filter === f.key ? 'var(--accent)' : 'var(--surface2)',
                  color: filter === f.key ? 'white' : 'var(--text2)',
                  flexShrink: 0,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Visites filtrées */}
          {filteredVisits.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 16 }}>
              <div className="empty-icon">{isPastFilter ? '📁' : '📅'}</div>
              <div className="empty-title">
                {isFr ? 'Aucune visite' : 'No visits'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredVisits.map(v => (
                <VisitCard key={v.id} v={v} isPast={v.visit_date < today} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
