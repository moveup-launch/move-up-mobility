import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

const STATUS_MAP = {
  draft:    { labelFr: 'Brouillon', labelEn: 'Draft',    color: '#6B7280', bg: '#F3F4F6' },
  sent:     { labelFr: 'Envoyé',    labelEn: 'Sent',     color: '#2B6BE6', bg: '#EEF4FF' },
  accepted: { labelFr: 'Accepté',   labelEn: 'Accepted', color: '#16A34A', bg: '#F0FDF4' },
  refused:  { labelFr: 'Refusé',    labelEn: 'Refused',  color: '#DC2626', bg: '#FEF2F2' },
};

const MODE_ICONS = { sea: '🚢', air: '✈️', road: '🚛', storage: '📦', local: '🏙️' };

export default function QuoteListPage() {
  const { lang, user, openEditQuote, openNewQuote, setViewMode } = useApp();
  const isFr = lang === 'fr';

  const [quotes, setQuotes]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState(null);
  const [duplicating, setDuplicating] = useState(null);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchQuotes(); }, []);

  const fetchQuotes = async () => {
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });
    setQuotes(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(isFr ? 'Supprimer ce devis ?' : 'Delete this quote?')) return;
    setDeleting(id);
    await supabase.from('quotes').delete().eq('id', id);
    setQuotes(q => q.filter(x => x.id !== id));
    setDeleting(null);
  };

  const handleDuplicate = async (q) => {
    setDuplicating(q.id);
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .gte('created_at', `${year}-01-01`);
    const ref = `QT-${year}-${String((count || 0) + 1).padStart(3, '0')}`;

    const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = q;
    const { data } = await supabase.from('quotes').insert({
      ...rest,
      reference: ref,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single();
    if (data) setQuotes(prev => [data, ...prev]);
    setDuplicating(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    await supabase.from('quotes').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    setQuotes(q => q.map(x => x.id === id ? { ...x, status: newStatus } : x));
  };

  const filtered = quotes.filter(q => {
    const matchSearch = !search || [q.reference, q.client_name, q.origin, q.destination]
      .some(f => (f || '').toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !filterStatus || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalSent     = quotes.filter(q => q.status === 'sent').length;
  const totalAccepted = quotes.filter(q => q.status === 'accepted').length;
  const totalAmount   = quotes.filter(q => q.status === 'accepted').reduce((s, q) => s + (q.total_amount || 0), 0);

  return (
    <>
      <div className="section-header">
        <div>
          <div className="section-title">📋 {isFr ? 'Devis' : 'Quotes'}</div>
          <div className="section-subtitle">{quotes.length} {isFr ? 'devis' : 'quote(s)'}</div>
        </div>
      </div>

      {/* Stats */}
      {quotes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#2B6BE6' }}>{totalSent}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{isFr ? 'Envoyés' : 'Sent'}</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#16A34A' }}>{totalAccepted}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{isFr ? 'Acceptés' : 'Accepted'}</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent)' }}>{totalAmount > 0 ? `${totalAmount.toFixed(0)} €` : '—'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{isFr ? 'CA accepté' : 'Accepted revenue'}</div>
          </div>
        </div>
      )}

      {/* New quote button */}
      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '12px', marginBottom: '12px', fontSize: '14px' }}
        onClick={() => openNewQuote(null)}
      >
        + {isFr ? 'Nouveau devis' : 'New quote'}
      </button>

      {/* Search + filter */}
      {quotes.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isFr ? '🔍 Rechercher…' : '🔍 Search…'}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: '8px',
              border: '1px solid var(--border)', fontSize: '13px',
              background: 'var(--bg)', color: 'var(--text)',
            }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--bg)', color: 'var(--text)' }}
          >
            <option value="">{isFr ? 'Tous statuts' : 'All statuses'}</option>
            {Object.entries(STATUS_MAP).map(([val, info]) => (
              <option key={val} value={val}>{isFr ? info.labelFr : info.labelEn}</option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>
          ⏳ {isFr ? 'Chargement…' : 'Loading…'}
        </div>
      )}

      {!loading && quotes.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">{isFr ? 'Aucun devis' : 'No quotes yet'}</div>
          <div className="empty-sub">{isFr ? 'Créez un devis depuis une visite ou le bouton ci-dessus.' : 'Create a quote from a visit or the button above.'}</div>
        </div>
      )}

      {!loading && filtered.length === 0 && quotes.length > 0 && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: '13px' }}>
          {isFr ? 'Aucun résultat.' : 'No results.'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(q => {
          const s = STATUS_MAP[q.status] || STATUS_MAP.draft;
          const modeIcon = MODE_ICONS[q.transport_mode] || '📦';
          const dateStr = q.created_at
            ? new Date(q.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB')
            : '';
          return (
            <div
              key={q.id}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '14px',
                borderLeft: `4px solid ${s.color}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text)' }}>
                  {modeIcon} {q.reference}
                </div>
                <select
                  value={q.status}
                  onChange={e => handleStatusChange(q.id, e.target.value)}
                  style={{
                    fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                    borderRadius: '12px', background: s.bg, color: s.color,
                    border: `1px solid ${s.color}40`, cursor: 'pointer',
                  }}
                >
                  {Object.entries(STATUS_MAP).map(([val, info]) => (
                    <option key={val} value={val}>{isFr ? info.labelFr : info.labelEn}</option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600', marginBottom: '2px' }}>
                {q.client_name || '—'}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>
                {[q.origin, q.destination].filter(Boolean).join(' → ')}
                {q.total_amount > 0 && <span style={{ fontWeight: '700', color: 'var(--accent)', marginLeft: '8px' }}>{q.total_amount.toFixed(2)} €</span>}
                {dateStr && <span style={{ marginLeft: '8px' }}>{dateStr}</span>}
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '8px', fontSize: '12px', minWidth: '80px' }}
                  onClick={() => openEditQuote(q.id)}
                >
                  ✏️ {isFr ? 'Modifier' : 'Edit'}
                </button>
                <button
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px',
                    border: '1px solid var(--accent)', background: 'var(--accent-light)',
                    color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', fontWeight: '600',
                  }}
                  onClick={() => openEditQuote(q.id)}
                  title={isFr ? 'Ouvrir pour générer le PDF' : 'Open to generate PDF'}
                >
                  📄 PDF
                </button>
                <button
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'var(--surface2)',
                    color: 'var(--text2)', fontSize: '12px', cursor: 'pointer',
                  }}
                  onClick={() => handleDuplicate(q)}
                  disabled={duplicating === q.id}
                >
                  {duplicating === q.id ? '…' : `⎘ ${isFr ? 'Dupliquer' : 'Copy'}`}
                </button>
                <button
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px',
                    border: '1px solid var(--danger)', background: 'var(--danger-light)',
                    color: 'var(--danger)', fontSize: '12px', cursor: 'pointer',
                  }}
                  onClick={() => handleDelete(q.id)}
                  disabled={deleting === q.id}
                >
                  {deleting === q.id ? '…' : '🗑️'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length > 0 && <div style={{ height: '20px' }} />}
    </>
  );
}
