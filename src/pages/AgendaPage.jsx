import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import VisitCard from '../components/VisitCard';
import { getOfflineVisits, removeOfflineVisit } from '../lib/offlineQueue';

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
  const [offlineVisits, setOfflineVisits] = useState(() => getOfflineVisits());
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
      .select('id, client_name, client_phone, client_email, visit_date, visit_time, visit_status, visit_type, video_link, origin_data, client_data, agenda_notes')
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
    const offlineVisit = offlineVisits.find(v => v._offlineId === id);
    if (offlineVisit) {
      removeOfflineVisit(id);
      setOfflineVisits(prev => prev.filter(v => v._offlineId !== id));
      setConfirmDelete(null);
      return;
    }
    setDeleting(id);
    await supabase.from('visits').delete().eq('id', id);
    setVisits(prev => prev.filter(v => v.id !== id));
    setConfirmDelete(null);
    setDeleting(null);
  };

  const STATUS_OPTS = isFr
    ? [
        { val: 'prevue',   label: 'Prévue' },
        { val: 'en_cours', label: 'En cours' },
        { val: 'terminee', label: 'Terminée' },
        { val: 'annulee',  label: 'Annulée' },
      ]
    : [
        { val: 'prevue',   label: 'Planned' },
        { val: 'en_cours', label: 'In progress' },
        { val: 'terminee', label: 'Completed' },
        { val: 'annulee',  label: 'Cancelled' },
      ];

  const STATUS_COLORS = {
    prevue:   { color: '#2B6BE6', bg: '#EEF4FF' },
    en_cours: { color: '#D97706', bg: '#FFFBEB' },
    terminee: { color: '#16A34A', bg: '#F0FDF4' },
    annulee:  { color: '#6B7280', bg: '#F3F4F6' },
  };

  const FILTERS = [
    { key: 'today',    label: t('filterToday') },
    { key: 'week',     label: t('filterWeek') },
    { key: 'upcoming', label: t('filterUpcoming') },
    { key: 'past',     label: t('filterPast') },
    { key: 'all',      label: t('filterAll') },
  ];

  const allVisits = [...visits, ...offlineVisits];

  const getFiltered = () => {
    let result = [...allVisits];
    switch (filter) {
      case 'today':    result = result.filter(v => v.visit_date === today); break;
      case 'week':     result = result.filter(v => v.visit_date >= startOfWeek && v.visit_date <= endOfWeek); break;
      case 'upcoming': result = result.filter(v => v.visit_date >= today && (v.visit_status || 'prevue') !== 'annulee'); break;
      case 'past':     result = result.filter(v => v.visit_date < today && !v._pending).reverse(); break;
      default: break;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        (v.client_name || '').toLowerCase().includes(q) ||
        (v.client_phone || '').toLowerCase().includes(q) ||
        (v.client_email || '').toLowerCase().includes(q) ||
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
          {isFr
            ? `${allVisits.length} visite${allVisits.length !== 1 ? 's' : ''}`
            : `${allVisits.length} visit${allVisits.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Recherche */}
      <div className="field" style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isFr ? '🔍 Nom, ville, email, téléphone…' : '🔍 Name, city, email, phone…'}
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
            const sc = STATUS_COLORS[v.visit_status || 'prevue'] || STATUS_COLORS.prevue;
            const statusSel = (
              <select
                value={v.visit_status || 'prevue'}
                onChange={e => handleUpdateStatus(v.id, e.target.value)}
                disabled={updatingStatus === v.id}
                style={{
                  padding: '4px 8px', borderRadius: '8px', fontSize: '12px',
                  border: `1px solid ${sc.color}`, background: sc.bg,
                  color: sc.color, fontWeight: '700', cursor: 'pointer', flexShrink: 0,
                }}
              >
                {STATUS_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
            );

            const vid = v._offlineId || v.id;
            return (
              <VisitCard
                key={vid}
                visit={v}
                isPast={!v._pending && v.visit_date < today}
                isPending={!!v._pending}
                isOpening={opening === vid}
                isConfirmingDelete={confirmDelete === vid}
                isDeleting={deleting === vid}
                onOpen={openVisit}
                onDeleteRequest={id => setConfirmDelete(id)}
                onDeleteConfirm={handleDelete}
                onDeleteCancel={() => setConfirmDelete(null)}
                statusSelector={v._pending ? null : statusSel}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
