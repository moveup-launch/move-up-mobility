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

export default function AgendaPage() {
  const { t, lang, user, loadVisit, goToStep } = useApp();
  const isFr = lang === 'fr';

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [search, setSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];
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
      .select('id, client_name, client_phone, visit_date, visit_time, visit_status, total_volume, origin_data, client_data, agenda_notes')
      .order('visit_date', { ascending: true });
    setVisits(data || []);
    setLoading(false);
  };

  const handleUpdateStatus = async (id, status) => {
    await supabase.from('visits').update({ visit_status: status }).eq('id', id);
    setVisits(prev => prev.map(v => v.id === id ? { ...v, visit_status: status } : v));
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
      case 'upcoming': result = result.filter(v => v.visit_date >= today && v.visit_status !== 'annulee'); break;
      case 'past':     result = result.filter(v => v.visit_date < today); result.reverse(); break;
      default: break;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        (v.client_name || '').toLowerCase().includes(q) ||
        (v.origin_data?.city || '').toLowerCase().includes(q) ||
        (v.client_data?.city || '').toLowerCase().includes(q)
      );
    }
    return result;
  };

  const filteredVisits = getFiltered();

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
          placeholder={isFr ? '🔍 Nom, ville...' : '🔍 Name, city...'}
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

            return (
              <div key={v.id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '14px',
                borderLeft: `4px solid ${status.color}`,
              }}>
                {/* Date + heure + statut */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--accent)', textTransform: 'capitalize' }}>
                      {formatDate(v.visit_date)}
                    </div>
                    {v.visit_time && (
                      <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>
                        🕐 {v.visit_time}
                      </div>
                    )}
                  </div>
                  {/* Sélecteur statut inline */}
                  <select
                    value={v.visit_status || 'prevue'}
                    onChange={e => handleUpdateStatus(v.id, e.target.value)}
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

                {/* Notes avant visite */}
                {notes && (
                  <div style={{
                    fontSize: '12px', color: 'var(--text2)', background: 'var(--surface2)',
                    borderRadius: '6px', padding: '6px 10px', marginBottom: '8px',
                    fontStyle: 'italic',
                  }}>
                    {notes}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {phone && (
                    <a href={`tel:${phone}`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '8px 12px', borderRadius: '8px', textDecoration: 'none',
                      background: '#F0FDF4', color: '#16A34A', fontWeight: '700',
                      fontSize: '13px', border: '1px solid #BBF7D0',
                    }}>
                      📞 {phone}
                    </a>
                  )}
                  <button
                    onClick={() => loadVisit(v)}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: '8px',
                      border: 'none', background: 'var(--accent)', color: 'white',
                      fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    ▶ {t('startVisit')}
                  </button>
                  <button
                    onClick={() => { loadVisit(v); goToStep(4); }}
                    style={{
                      padding: '8px 10px', borderRadius: '8px',
                      border: '1px solid var(--border)', background: 'var(--surface2)',
                      color: 'var(--text)', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    📄
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
