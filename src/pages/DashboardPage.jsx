import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import NewVisitModal from '../components/NewVisitModal';

function getStatusInfo(status, isFr) {
  const map = {
    prevue:   { label: isFr ? 'Prévue' : 'Planned',      color: '#2B6BE6', bg: '#EEF4FF' },
    en_cours: { label: isFr ? 'En cours' : 'In progress', color: '#D97706', bg: '#FFFBEB' },
    terminee: { label: isFr ? 'Terminée' : 'Completed',   color: '#16A34A', bg: '#F0FDF4' },
    annulee:  { label: isFr ? 'Annulée' : 'Cancelled',    color: '#6B7280', bg: '#F3F4F6' },
  };
  return map[status || 'prevue'] || map.prevue;
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sortByDateTime(a, b) {
  const da = (a.visit_date || '') + 'T' + (a.visit_time || '00:00');
  const db = (b.visit_date || '') + 'T' + (b.visit_time || '00:00');
  return da < db ? -1 : da > db ? 1 : 0;
}

export default function DashboardPage() {
  const { t, lang, user, loadVisit, goToStep } = useApp();
  const isFr = lang === 'fr';

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [opening, setOpening] = useState(null);
  const [justCreated, setJustCreated] = useState(null);

  const today = localToday();
  const firstOfMonth = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  })();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('visits')
      .select('id, client_name, client_phone, visit_date, visit_time, visit_status, origin_data, client_data')
      .order('visit_date', { ascending: true });
    if (error) {
      console.error('DashboardPage loadData error:', error);
      setLoadError(error.message);
    } else {
      setVisits((data || []).sort(sortByDateTime));
    }
    setLoading(false);
  };

  const handleVisitCreated = (newVisit) => {
    setVisits(prev => [...prev, newVisit].sort(sortByDateTime));
    setJustCreated(newVisit.id);
    setShowNewVisit(false);
    setTimeout(() => setJustCreated(null), 3000);
  };

  const openVisit = async (visitId, step = 0) => {
    setOpening(visitId);
    const { data, error } = await supabase
      .from('visits').select('*').eq('id', visitId).single();
    if (!error && data) {
      loadVisit(data);
      if (step > 0) goToStep(step);
    } else {
      console.error('openVisit error:', error);
    }
    setOpening(null);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    const { error } = await supabase.from('visits').delete().eq('id', id);
    if (!error) {
      setVisits(prev => prev.filter(v => v.id !== id));
    }
    setConfirmDelete(null);
    setDeleting(null);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d + 'T12:00:00').toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
        weekday: 'short', day: '2-digit', month: 'short',
      });
    } catch { return d; }
  };

  const emailName = user?.email?.split('@')[0] || '';
  const upcoming = visits.filter(v =>
    v.visit_date >= today && (v.visit_status || 'prevue') !== 'annulee'
  );
  const monthVisits = visits.filter(v => v.visit_date >= firstOfMonth && v.visit_date <= today);

  return (
    <>
      <div className="dashboard">
        {/* En-tête */}
        <div className="dashboard-welcome">
          <div className="dashboard-hi">
            {isFr ? `Bonjour, ${emailName} 👋` : `Hello, ${emailName} 👋`}
          </div>
          <div className="dashboard-sub">
            {upcoming.length > 0
              ? (isFr
                  ? `${upcoming.length} visite${upcoming.length > 1 ? 's' : ''} à venir`
                  : `${upcoming.length} upcoming visit${upcoming.length > 1 ? 's' : ''}`)
              : (isFr ? 'Aucune visite planifiée' : 'No visits planned')}
          </div>
        </div>

        {/* CTA Nouvelle visite */}
        <button className="dashboard-cta" onClick={() => setShowNewVisit(true)}>
          ✏️ {isFr ? 'Nouvelle visite' : 'New visit'}
        </button>

        {loading ? (
          <div className="empty-state" style={{ paddingTop: 32 }}>
            <div className="empty-icon">⏳</div>
            <div className="empty-title">{isFr ? 'Chargement…' : 'Loading…'}</div>
          </div>
        ) : loadError ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <div className="empty-title">{isFr ? 'Erreur de chargement' : 'Loading error'}</div>
            <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{loadError}</div>
            <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={loadData}>
              {isFr ? 'Réessayer' : 'Retry'}
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="dashboard-stats" style={{ marginBottom: '20px' }}>
              <div className="stat-card">
                <div className="stat-card-num">{monthVisits.length}</div>
                <div className="stat-card-label">{isFr ? 'visites ce mois' : 'visits this month'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-num">{upcoming.length}</div>
                <div className="stat-card-label">{isFr ? 'à venir' : 'upcoming'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-num" style={{ fontSize: upcoming[0] ? '12px' : '20px' }}>
                  {upcoming[0] ? (
                    <>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--accent)' }}>
                        {upcoming[0].client_name?.split(' ')[0] || '—'}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text2)' }}>
                        {formatDate(upcoming[0].visit_date)}{upcoming[0].visit_time ? ` ${upcoming[0].visit_time}` : ''}
                      </div>
                    </>
                  ) : '—'}
                </div>
                <div className="stat-card-label">{isFr ? 'prochaine visite' : 'next visit'}</div>
              </div>
            </div>

            {/* Section Visites à venir */}
            <div style={{
              fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '10px',
            }}>
              📅 {isFr ? 'Visites à venir' : 'Upcoming visits'}
            </div>

            {upcoming.length === 0 ? (
              <div className="empty-state" style={{ paddingTop: 16 }}>
                <div className="empty-icon">📅</div>
                <div className="empty-title">{isFr ? 'Aucune visite planifiée' : 'No visits planned'}</div>
                <button
                  style={{
                    marginTop: '12px', padding: '10px 20px', borderRadius: '10px',
                    border: 'none', background: 'var(--accent)', color: 'white',
                    fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                  }}
                  onClick={() => setShowNewVisit(true)}
                >
                  ✏️ {isFr ? 'Créer une visite' : 'Create a visit'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {upcoming.map(v => {
                  const status = getStatusInfo(v.visit_status, isFr);
                  const city = v.origin_data?.city || v.client_data?.city || '';
                  const phone = v.client_phone || v.client_data?.phone || '';
                  const isOpening = opening === v.id;
                  const isConfirming = confirmDelete === v.id;
                  const isNew = justCreated === v.id;

                  return (
                    <div
                      key={v.id}
                      style={{
                        background: 'var(--surface)',
                        border: isNew ? '2px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', padding: '14px',
                        borderLeft: `4px solid ${status.color}`,
                        transition: 'border-color 0.4s',
                      }}
                    >
                      {isNew && (
                        <div style={{
                          fontSize: '11px', fontWeight: '700', color: 'var(--accent)',
                          marginBottom: '6px', letterSpacing: '0.05em',
                        }}>
                          ✅ {isFr ? 'Visite créée !' : 'Visit created!'}
                        </div>
                      )}

                      {/* Date + heure + badge statut */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>
                            {formatDate(v.visit_date)}
                          </span>
                          {v.visit_time && (
                            <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: '700', marginLeft: '8px' }}>
                              🕐 {v.visit_time}
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

                      {/* Nom + ville */}
                      <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text)', marginBottom: '2px' }}>
                        {v.client_name || (isFr ? 'Client sans nom' : 'Unnamed client')}
                      </div>
                      {city && (
                        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>
                          📍 {city}
                        </div>
                      )}

                      {/* Téléphone cliquable */}
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '14px', color: '#16A34A', textDecoration: 'none',
                            fontWeight: '700', marginBottom: '10px',
                          }}
                        >
                          📞 {phone}
                        </a>
                      )}

                      {/* Boutons */}
                      {!isConfirming ? (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openVisit(v.id, 0)}
                            disabled={isOpening}
                            style={{
                              flex: 2, padding: '9px 12px', borderRadius: '8px', border: 'none',
                              background: 'var(--accent)', color: 'white', fontWeight: '700',
                              fontSize: '13px', cursor: 'pointer', minWidth: '110px',
                              opacity: isOpening ? 0.7 : 1,
                            }}
                          >
                            {isOpening ? '⏳' : `▶ ${isFr ? 'Démarrer la visite' : 'Start visit'}`}
                          </button>
                          <button
                            onClick={() => openVisit(v.id, 0)}
                            disabled={isOpening}
                            style={{
                              flex: 1, padding: '9px 12px', borderRadius: '8px',
                              border: '1px solid var(--border)', background: 'var(--surface2)',
                              color: 'var(--text)', fontSize: '13px', cursor: 'pointer',
                            }}
                          >
                            ✏️ {isFr ? 'Modifier' : 'Edit'}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(v.id)}
                            style={{
                              padding: '9px 10px', borderRadius: '8px',
                              border: '1px solid var(--danger)', background: 'var(--danger-light)',
                              color: 'var(--danger)', fontSize: '13px', cursor: 'pointer',
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          padding: '10px 12px', background: 'var(--danger-light)',
                          border: '1px solid var(--danger)', borderRadius: '8px',
                          display: 'flex', gap: '8px', alignItems: 'center',
                        }}>
                          <span style={{ flex: 1, fontSize: '13px', color: 'var(--danger)', fontWeight: '600' }}>
                            {t('confirmDeleteVisit')}
                          </span>
                          <button
                            onClick={() => handleDelete(v.id)}
                            disabled={deleting === v.id}
                            style={{
                              padding: '6px 12px', borderRadius: '6px', background: 'var(--danger)',
                              color: 'white', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                            }}
                          >
                            {deleting === v.id ? '…' : (isFr ? 'Oui' : 'Yes')}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            style={{
                              padding: '6px 10px', borderRadius: '6px', background: 'var(--surface)',
                              color: 'var(--text2)', border: '1px solid var(--border)', fontSize: '12px', cursor: 'pointer',
                            }}
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal nouvelle visite */}
      {showNewVisit && (
        <NewVisitModal
          onClose={() => setShowNewVisit(false)}
          onCreated={handleVisitCreated}
        />
      )}
    </>
  );
}
