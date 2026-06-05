import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function HistoryPage() {
  const { lang, t, loadVisit } = useApp();
  const isFr = lang === 'fr';

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: false });
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

  const handleEdit = (visit) => {
    loadVisit(visit);
  };

  const filtered = visits.filter(v => {
    const q = search.toLowerCase();
    return (
      (v.client_name || '').toLowerCase().includes(q) ||
      (v.client_email || '').toLowerCase().includes(q) ||
      (v.client_phone || '').toLowerCase().includes(q) ||
      (v.visit_date || '').includes(q)
    );
  });

  const formatDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB'); }
    catch { return iso; }
  };

  return (
    <>
      <div className="section-header">
        <div className="section-title">{isFr ? 'Historique' : 'History'}</div>
        <div className="section-subtitle">
          {isFr ? `${visits.length} visite${visits.length !== 1 ? 's' : ''} enregistrée${visits.length !== 1 ? 's' : ''}` : `${visits.length} saved visit${visits.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isFr ? '🔍 Rechercher un client…' : '🔍 Search a client…'}
        />
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
            {search ? (isFr ? 'Aucun résultat' : 'No results') : (isFr ? 'Aucune visite enregistrée' : 'No saved visits')}
          </div>
          <div className="empty-sub">
            {!search && (isFr ? "Enregistrez une visite depuis l'étape Synthèse." : 'Save a visit from the Summary step.')}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(v => (
          <div key={v.id} className="history-card">
            <button
              className="history-card-header"
              onClick={() => setExpanded(expanded === v.id ? null : v.id)}
            >
              <div className="history-card-left">
                <div className="history-client">{v.client_name || (isFr ? 'Client sans nom' : 'Unnamed client')}</div>
                <div className="history-meta">
                  {formatDate(v.visit_date)}
                  {v.client_phone ? ` · ${v.client_phone}` : ''}
                </div>
              </div>
              <div className="history-card-right">
                <div className="history-vol">{(v.total_volume || 0).toFixed(1)} m³</div>
                <div className="history-truck-badge">{v.recommended_truck}</div>
                <div className="history-chevron">{expanded === v.id ? '▲' : '▼'}</div>
              </div>
            </button>

            {expanded === v.id && (
              <div className="history-detail">
                {v.client_email && <div className="history-detail-row"><span>{isFr ? 'Email' : 'Email'}</span><span>{v.client_email}</span></div>}
                {v.move_date && <div className="history-detail-row"><span>{isFr ? 'Date de déménagement' : 'Moving date'}</span><span>{v.move_date}</span></div>}
                {v.client_data?.surveyor && <div className="history-detail-row"><span>{isFr ? 'Commercial' : 'Surveyor'}</span><span>{v.client_data.surveyor}</span></div>}
                {v.origin_data?.address && (
                  <div className="history-detail-row">
                    <span>{isFr ? 'Origine' : 'Origin'}</span>
                    <span>{v.origin_data.address}{v.origin_data.city ? `, ${v.origin_data.city}` : ''}</span>
                  </div>
                )}
                {v.destination_data?.address && (
                  <div className="history-detail-row">
                    <span>{isFr ? 'Destination' : 'Destination'}</span>
                    <span>{v.destination_data.address}{v.destination_data.city ? `, ${v.destination_data.city}` : ''}</span>
                  </div>
                )}
                {Array.isArray(v.rooms_data) && v.rooms_data.length > 0 && (
                  <div className="history-detail-row">
                    <span>{isFr ? 'Pièces' : 'Rooms'}</span>
                    <span>{v.rooms_data.length}</span>
                  </div>
                )}
                <div className="history-detail-row">
                  <span>{isFr ? 'Enregistré le' : 'Saved on'}</span>
                  <span>{formatDate(v.created_at)}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px', fontSize: '14px' }}
                    onClick={() => handleEdit(v)}
                  >
                    ✏️ {isFr ? 'Modifier' : 'Edit'}
                  </button>
                  <button
                    className="history-delete-btn"
                    style={{ flex: 1 }}
                    onClick={() => handleDelete(v.id)}
                    disabled={deleting === v.id}
                  >
                    {deleting === v.id ? '…' : (isFr ? 'Supprimer' : 'Delete')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length > 0 && (
        <div style={{ height: 20 }} />
      )}
    </>
  );
}
