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

export default function HistoryPage() {
  const { lang, t, loadVisit, goToStep, user } = useApp();
  const isFr = lang === 'fr';

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [duplicating, setDuplicating] = useState(null);

  useEffect(() => { fetchVisits(); }, []);

  const fetchVisits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('visit_date', { ascending: false });
    if (!error) setVisits(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    await supabase.from('visits').delete().eq('id', id);
    setVisits(v => v.filter(x => x.id !== id));
    if (expanded === id) setExpanded(null);
    setDeleting(null);
  };

  const handleEdit = (visit) => { loadVisit(visit); };

  const handlePDF = (visit) => { loadVisit(visit); goToStep(4); };

  const handleDuplicate = async (v) => {
    setDuplicating(v.id);
    const today = new Date().toISOString().split('T')[0];
    const { id, created_at, ...rest } = v;
    const newClientData = { ...rest.client_data, visitDate: today, visitStatus: 'prevue', visitTime: '' };
    const payload = {
      ...rest,
      visit_date: today,
      visit_status: 'prevue',
      visit_time: null,
      client_data: newClientData,
      user_id: user?.id,
    };
    const { data, error } = await supabase.from('visits').insert(payload).select().single();
    if (!error && data) {
      setVisits(prev => [data, ...prev]);
    }
    setDuplicating(null);
  };

  const STATUS_OPTS = [
    { val: 'all',      label: isFr ? 'Tous statuts' : 'All statuses' },
    { val: 'prevue',   label: isFr ? 'Prévue' : 'Planned' },
    { val: 'en_cours', label: isFr ? 'En cours' : 'In progress' },
    { val: 'terminee', label: isFr ? 'Terminée' : 'Completed' },
    { val: 'annulee',  label: isFr ? 'Annulée' : 'Cancelled' },
  ];

  const filtered = visits.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (v.client_name || '').toLowerCase().includes(q) ||
      (v.client_email || '').toLowerCase().includes(q) ||
      (v.client_phone || '').toLowerCase().includes(q) ||
      (v.origin_data?.city || '').toLowerCase().includes(q) ||
      (v.destination_data?.city || '').toLowerCase().includes(q) ||
      (v.visit_date || '').includes(q);
    const matchStatus = filterStatus === 'all' || (v.visit_status || 'prevue') === filterStatus;
    const matchDate = !filterDate || (v.visit_date || '').startsWith(filterDate);
    return matchSearch && matchStatus && matchDate;
  });

  const formatDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso + 'T12:00:00').toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB'); }
    catch { return iso; }
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">{isFr ? 'Historique' : 'History'}</div>
        <div className="section-subtitle">
          {isFr ? `${visits.length} visite${visits.length !== 1 ? 's' : ''}` : `${visits.length} visit${visits.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Recherche */}
      <div className="field" style={{ marginBottom: '8px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isFr ? '🔍 Nom, ville, téléphone...' : '🔍 Name, city, phone...'}
        />
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg)', flex: 1, minWidth: '130px' }}
        >
          {STATUS_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
        <input
          type="month"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg)', flex: 1, minWidth: '130px' }}
        />
        {(filterStatus !== 'all' || filterDate || search) && (
          <button
            onClick={() => { setFilterStatus('all'); setFilterDate(''); setSearch(''); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', fontSize: '12px', cursor: 'pointer', color: 'var(--text3)' }}
          >
            ✕ {isFr ? 'Effacer' : 'Clear'}
          </button>
        )}
      </div>

      {loading && (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">{isFr ? 'Chargement…' : 'Loading…'}</div>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">
            {search || filterStatus !== 'all' || filterDate
              ? (isFr ? 'Aucun résultat' : 'No results')
              : (isFr ? 'Aucune visite enregistrée' : 'No saved visits')}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(v => {
          const status = getStatusInfo(v.visit_status, isFr);
          const city = v.origin_data?.city || v.destination_data?.city || '';
          const phone = v.client_phone;

          return (
            <div key={v.id} className="history-card">
              <button
                className="history-card-header"
                onClick={() => setExpanded(expanded === v.id ? null : v.id)}
              >
                <div className="history-card-left">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <div className="history-client">{v.client_name || (isFr ? 'Client sans nom' : 'Unnamed client')}</div>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '10px',
                      background: status.bg, color: status.color,
                    }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="history-meta">
                    {formatDate(v.visit_date)}
                    {v.visit_time ? ` ${v.visit_time}` : ''}
                    {city ? ` · ${city}` : ''}
                  </div>
                </div>
                <div className="history-card-right">
                  <div className="history-vol">{(v.total_volume || 0).toFixed(1)} m³</div>
                  <div className="history-chevron">{expanded === v.id ? '▲' : '▼'}</div>
                </div>
              </button>

              {expanded === v.id && (
                <div className="history-detail">
                  {phone && (
                    <div className="history-detail-row">
                      <span>{isFr ? 'Téléphone' : 'Phone'}</span>
                      <a href={`tel:${phone}`} style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
                        📞 {phone}
                      </a>
                    </div>
                  )}
                  {v.client_email && <div className="history-detail-row"><span>Email</span><span>{v.client_email}</span></div>}
                  {v.move_date && <div className="history-detail-row"><span>{isFr ? 'Date déménagement' : 'Moving date'}</span><span>{formatDate(v.move_date)}</span></div>}
                  {(v.commercial_name || v.client_data?.surveyor) && (
                    <div className="history-detail-row">
                      <span>{isFr ? 'Commercial' : 'Surveyor'}</span>
                      <span>{v.commercial_name || v.client_data?.surveyor}</span>
                    </div>
                  )}
                  {v.origin_data?.city && (
                    <div className="history-detail-row">
                      <span>{isFr ? 'Origine' : 'Origin'}</span>
                      <span>{[v.origin_data.address, v.origin_data.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {v.destination_data?.city && (
                    <div className="history-detail-row">
                      <span>{isFr ? 'Destination' : 'Destination'}</span>
                      <span>{[v.destination_data.address, v.destination_data.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {Array.isArray(v.rooms_data) && v.rooms_data.length > 0 && (
                    <div className="history-detail-row">
                      <span>{isFr ? 'Pièces' : 'Rooms'}</span>
                      <span>{v.rooms_data.length}</span>
                    </div>
                  )}
                  {v.recommended_truck && (
                    <div className="history-detail-row">
                      <span>{isFr ? 'Transport' : 'Transport'}</span>
                      <span className="history-truck-badge">{v.recommended_truck}</span>
                    </div>
                  )}
                  <div className="history-detail-row">
                    <span>{isFr ? 'Enregistré le' : 'Saved on'}</span>
                    <span>{formatDate(v.created_at)}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 2, padding: '10px', fontSize: '13px', minWidth: '100px' }}
                      onClick={() => handleEdit(v)}
                    >
                      ✏️ {isFr ? 'Modifier' : 'Edit'}
                    </button>
                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px', textAlign: 'center',
                          background: '#F0FDF4', color: '#16A34A', fontWeight: '700',
                          fontSize: '13px', textDecoration: 'none', border: '1px solid #BBF7D0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        📞
                      </a>
                    )}
                    <button
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px',
                        border: '1px solid var(--accent)', background: 'var(--accent-light)',
                        color: 'var(--accent)', fontSize: '13px', cursor: 'pointer', fontWeight: '600',
                      }}
                      onClick={() => handlePDF(v)}
                    >
                      📄 PDF
                    </button>
                    <button
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px',
                        border: '1px solid var(--border)', background: 'var(--surface2)',
                        color: 'var(--text2)', fontSize: '13px', cursor: 'pointer',
                      }}
                      onClick={() => handleDuplicate(v)}
                      disabled={duplicating === v.id}
                    >
                      {duplicating === v.id ? '…' : `⎘ ${t('duplicate')}`}
                    </button>
                    <button
                      className="history-delete-btn"
                      style={{ flex: 1 }}
                      onClick={() => handleDelete(v.id)}
                      disabled={deleting === v.id}
                    >
                      {deleting === v.id ? '…' : (isFr ? '🗑️ Supprimer' : '🗑️ Delete')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length > 0 && <div style={{ height: 20 }} />}
    </>
  );
}
