import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

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

export default function AgendaPage() {
  const { t, lang, loadVisit, goToStep } = useApp();
  const isFr = lang === 'fr';

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [opening, setOpening] = useState(null);

  const today = localToday();
  const startOfWeek = (() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const endOfWeek = (() => {
    const d = new Date(startOfWeek + 'T12:00:00');
    d.setDate(d.getDate() + 6);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('visits')
      .select('id, client_name, client_phone, visit_date, visit_time, visit_status, total_volume, origin_data, client_data, agenda_notes')
      .order('visit_date', { ascending: true });
    if (error) {
      console.error('AgendaPage loadData error:', error);
      setLoadError(error.message);
    } else {
      setVisits((data || []).sort(sortByDateTime));
    }
    setLoading(false);
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

  const handleUpdateStatus = async (id, status) => {
    setUpdatingStatus(id);
    await supabase.from('visits').update({ visit_status: status }).eq('id', id);
    setVisits(prev => prev.map(v => v.id === id ? { ...v, visit_status: status } : v));
    setUpdatingStatus(null);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    await supabase.from('visits').delete().eq('id', id);
    setVisits(prev => prev.filter(v => v.id !== id));
    setConfirmDelete(null);
    setDeleting(null);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d + 'T12:00:00').toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
        weekday: 'long', day: '2-digit', month: 'long',
      });
    } catch { return d; }
  };

  const FILTERS = [
    { key: 'today',    label: t('filterToday') },
    { key: 'week',     label: t('filterWeek') },
    { key: 'upcoming', label: t('filterUpcoming') },
    { key: 'past',     label: t('filterPast') },
    { key: 'all',      label: t('filterAll') },
  ];

  const STATUS_OPTS = isFr
    ? [{ val: 'prevue', label: 'Prévue' }, { val: 'en_cours', label: 'En cours' }, { val: 'terminee', label: 'Terminée' }, { val: 'annulee', label: 'Annulée' }]
    : [{ val: 'prevue', label: 'Planned' }, { val: 'en_cours', label: 'In progress' }, { val: 'terminee', label: 'Completed' }, { val: 'annulee', label: 'Cancelled' }];

  const getFiltered = () => {
    let result = [...visits];
    switch (filter) {
      case 'today':    result = result.filter(v => v.visit_date === today); break;
      case 'week':     result = result.filter(v => v.visit_date >= startOfWeek && v.visit_date <= endOfWeek); break;
      case 'upcoming': result = result.filter(v => v.visit_date >= today && (v.visit_status || 'prevue') !== 'annulee'); break;
      case 'past':     result = result.filter(v => v.visit_date < today).reverse(); break;
      default: break;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        (v.client_name || '').toLowerCase().includes(q) ||
        (v.client_phone || '').toLowerCase().includes(q) ||
        (v.origin_data?.city || '').toLowerCase().includes(q) ||
        (v.client_data?.city || '').toLowerCase().includes(q)
      );
    }
    return result;
  };

  const filteredVisits = getFiltered();

  if (loadError) {
    return (
      <div style={{ padding: '16px' }}>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <div className="empty-title">{isFr ? 'Erreur de chargement' : 'Loading error'}</div>
          <div style={{ fontSize: '12px', color: 'var(--danger)', margin: '4px 0 12px' }}>{loadError}</div>
          <button className="btn btn-secondary" onClick={loadData}>{isFr ? 'Réessayer' : 'Retry'}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
      <div className="section-header">
        <div className="section-title">📅 {t('agenda')}</div>
        <div className="section-subtitle">
          {isFr ? `${visits.length} visite${visits.length !== 1 ? 's' : ''}` : `${visits.length} visit${visits.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Recherche */}
      <div className="field" style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isFr ? '🔍 Nom, ville, téléphone...' : '🔍 Name, city, phone...'}
        />
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '2px' }}>
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

      {loading ? (
        <div className="empty-state"><div className="empty-icon">⏳</div></div>
      ) : filteredVisits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div className="empty-title">{isFr ? 'Aucune visite' : 'No visits'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredVisits.map(v => {
            const status = getStatusInfo(v.visit_status, isFr);
            const city = v.origin_data?.city || v.client_data?.city || '';
            const phone = v.client_phone || v.client_data?.phone || '';
            const notes = v.agenda_notes || v.client_data?.agendaNotes || '';
            const isPast = v.visit_date < today;
            const isConfirmingDelete = confirmDelete === v.id;
            const isOpening = opening === v.id;

            return (
              <div key={v.id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '14px',
                borderLeft: `4px solid ${status.color}`,
                opacity: v.visit_status === 'annulee' ? 0.7 : 1,
              }}>
                {/* Date + heure + statut */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--accent)', textTransform: 'capitalize' }}>
                      {formatDate(v.visit_date)}
                    </div>
                    {v.visit_time && (
                      <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text)' }}>
                        🕐 {v.visit_time}
                      </div>
                    )}
                  </div>
                  <select
                    value={v.visit_status || 'prevue'}
                    onChange={e => handleUpdateStatus(v.id, e.target.value)}
                    disabled={updatingStatus === v.id}
                    style={{
                      padding: '4px 8px', borderRadius: '8px', fontSize: '12px',
                      border: `1px solid ${status.color}`, background: status.bg,
                      color: status.color, fontWeight: '700', cursor: 'pointer',
                    }}
                  >
                    {STATUS_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                  </select>
                </div>

                {/* Client + ville */}
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px' }}>
                  {v.client_name || (isFr ? 'Client sans nom' : 'Unnamed')}
                </div>
                {city && <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>📍 {city}</div>}

                {notes && (
                  <div style={{
                    fontSize: '12px', color: 'var(--text2)', background: 'var(--surface2)',
                    borderRadius: '6px', padding: '6px 10px', marginBottom: '8px', fontStyle: 'italic',
                  }}>
                    {notes}
                  </div>
                )}

                {/* Actions */}
                {!isConfirmingDelete ? (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {phone && (
                      <a href={`tel:${phone}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '8px 12px', borderRadius: '8px', textDecoration: 'none',
                        background: '#F0FDF4', color: '#16A34A', fontWeight: '700',
                        fontSize: '13px', border: '1px solid #BBF7D0', flexShrink: 0,
                      }}>
                        📞 {phone}
                      </a>
                    )}

                    {!isPast && (
                      <button
                        onClick={() => openVisit(v.id, 0)}
                        disabled={isOpening}
                        style={{
                          flex: 2, padding: '8px 12px', borderRadius: '8px',
                          border: 'none', background: 'var(--accent)', color: 'white',
                          fontWeight: '700', fontSize: '13px', cursor: 'pointer', minWidth: '110px',
                          opacity: isOpening ? 0.7 : 1,
                        }}
                      >
                        {isOpening ? '⏳' : `▶ ${isFr ? 'Démarrer' : 'Start'}`}
                      </button>
                    )}

                    <button
                      onClick={() => openVisit(v.id, 0)}
                      disabled={isOpening}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: '8px',
                        border: '1px solid var(--border)', background: 'var(--surface2)',
                        color: 'var(--text)', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                      }}
                    >
                      ✏️ {t('editVisit')}
                    </button>

                    {isPast && (
                      <button
                        onClick={() => openVisit(v.id, 4)}
                        disabled={isOpening}
                        style={{
                          padding: '8px 10px', borderRadius: '8px',
                          border: '1px solid var(--accent)', background: 'var(--accent-light)',
                          color: 'var(--accent)', fontSize: '13px', cursor: 'pointer', fontWeight: '600',
                        }}
                      >
                        📄
                      </button>
                    )}

                    <button
                      onClick={() => setConfirmDelete(v.id)}
                      style={{
                        padding: '8px 10px', borderRadius: '8px',
                        border: '1px solid var(--danger)', background: 'var(--danger-light)',
                        color: 'var(--danger)', fontSize: '13px', cursor: 'pointer', flexShrink: 0,
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
                      {deleting === v.id ? '…' : (isFr ? 'Oui, supprimer' : 'Yes, delete')}
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
    </div>
  );
}
