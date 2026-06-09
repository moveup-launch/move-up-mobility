import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function AdminPage() {
  const { lang, profile, setViewMode } = useApp();
  const isFr = lang === 'fr';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profile && !profile.is_admin) setViewMode('dashboard');
  }, [profile]);

  useEffect(() => {
    if (profile?.is_admin) loadUsers();
  }, [profile]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('get_admin_users');
    if (error) setError(error.message);
    else setUsers(data || []);
    setLoading(false);
  };

  const setPlan = async (userId, plan) => {
    setUpdating(userId);
    const { error } = await supabase.rpc('admin_set_user_plan', {
      target_user_id: userId,
      new_plan: plan,
    });
    if (error) alert(error.message);
    else setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u));
    setUpdating(null);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q
      || u.email?.toLowerCase().includes(q)
      || u.first_name?.toLowerCase().includes(q)
      || u.last_name?.toLowerCase().includes(q)
      || u.company_name?.toLowerCase().includes(q);
  });

  if (!profile?.is_admin) return null;

  return (
    <div style={{ padding: '20px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div className="section-header">
        <div className="section-title">🛡️ {isFr ? 'Administration' : 'Administration'}</div>
        <div className="section-subtitle">
          {users.length} {isFr ? 'utilisateur(s)' : 'user(s)'}
        </div>
      </div>

      <input
        type="text"
        placeholder={isFr ? 'Rechercher par email, nom ou entreprise…' : 'Search by email, name or company…'}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10,
          border: '1.5px solid var(--border)', fontSize: 14,
          background: 'white', boxSizing: 'border-box', marginBottom: 16,
        }}
      />

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">{isFr ? 'Chargement…' : 'Loading…'}</div>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <div className="empty-title">{isFr ? 'Erreur' : 'Error'}</div>
          <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{error}</div>
          <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={loadUsers}>
            {isFr ? 'Réessayer' : 'Retry'}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">{isFr ? 'Aucun résultat' : 'No results'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(u => (
            <div key={u.id} className="card" style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1A1917', wordBreak: 'break-all' }}>
                      {u.email}
                    </span>
                    {u.is_admin && (
                      <span style={{ background: '#FBF5E6', color: '#D4A017', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 10, flexWrap: 'wrap', lineHeight: 1.8 }}>
                    {(u.first_name || u.last_name) && (
                      <span>👤 {[u.first_name, u.last_name].filter(Boolean).join(' ')}</span>
                    )}
                    {u.company_name && <span>🏢 {u.company_name}</span>}
                    <span>📅 {u.created_at ? new Date(u.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB') : '—'}</span>
                    <span>🗂️ {u.visit_count ?? 0} {isFr ? 'visite(s)' : 'visit(s)'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: u.plan === 'pro' ? '#EEF3FD' : '#F0EFE9',
                    color: u.plan === 'pro' ? '#2B6BE6' : '#6B6860',
                  }}>
                    {u.plan === 'pro' ? 'Pro ✨' : (isFr ? 'Gratuit' : 'Free')}
                  </span>
                  {u.plan !== 'pro' ? (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: 12, whiteSpace: 'nowrap' }}
                      onClick={() => setPlan(u.id, 'pro')}
                      disabled={updating === u.id}
                    >
                      {updating === u.id ? '…' : '→ Pro'}
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 12, whiteSpace: 'nowrap' }}
                      onClick={() => setPlan(u.id, 'free')}
                      disabled={updating === u.id}
                    >
                      {updating === u.id ? '…' : '→ Gratuit'}
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
