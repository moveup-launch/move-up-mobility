import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { openProCheckout } from '../lib/stripe';
import NewVisitModal from '../components/NewVisitModal';
import VisitCard from '../components/VisitCard';
import { getOfflineVisits, removeOfflineVisit } from '../lib/offlineQueue';
import { scheduleVisitReminders, showSyncedNotification } from '../lib/notifications';

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sortByDateTime(a, b) {
  const da = (a.visit_date || '') + 'T' + (a.visit_time || '00:00');
  const db = (b.visit_date || '') + 'T' + (b.visit_time || '00:00');
  return da < db ? -1 : da > db ? 1 : 0;
}

function formatDateShort(dateStr, isFr) {
  if (!dateStr) return '—';
  try {
    const str = new Date(dateStr + 'T12:00:00').toLocaleDateString(
      isFr ? 'fr-FR' : 'en-GB',
      { weekday: 'short', day: 'numeric', month: 'short' }
    );
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch { return dateStr; }
}

const PLAN_BADGE = {
  free: { label: 'Gratuit',    bg: '#F0EFE9', color: '#6B6860' },
  pro:  { label: 'Pro ✨',     bg: '#EEF3FD', color: '#2B6BE6' },
};
const FREE_VISIT_LIMIT = 3;

export default function DashboardPage() {
  const { t, lang, user, profile, loadVisit, goToStep, setViewMode } = useApp();
  const isFr = lang === 'fr';

  const [visits, setVisits] = useState([]);
  const [offlineVisits, setOfflineVisits] = useState(() => getOfflineVisits());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [opening, setOpening] = useState(null);
  const [justCreated, setJustCreated] = useState(null);
  const [syncedVisitName, setSyncedVisitName] = useState(null);

  const today = localToday();
  const firstOfMonth = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  })();

  useEffect(() => { loadData(); }, []);

  // Sync hors-ligne → Supabase dès que la connexion revient
  useEffect(() => {
    const doSync = async () => {
      const pending = getOfflineVisits();
      if (!pending.length || !navigator.onLine) return;
      for (const offlineVisit of pending) {
        const { _offlineId, _pending, ...visitData } = offlineVisit;
        const { data, error } = await supabase
          .from('visits')
          .insert(visitData)
          .select()
          .single();
        if (!error && data) {
          removeOfflineVisit(_offlineId);
          setOfflineVisits(prev => prev.filter(v => v._offlineId !== _offlineId));
          setVisits(prev => [...prev, data].sort(sortByDateTime));
          setSyncedVisitName(data.client_name || '');
          showSyncedNotification(data.client_name || '', isFr);
          setTimeout(() => setSyncedVisitName(null), 4000);
        }
      }
    };

    if (navigator.onLine) doSync();
    window.addEventListener('online', doSync);
    return () => window.removeEventListener('online', doSync);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('visits')
      .select('id, client_name, client_phone, client_email, visit_date, visit_time, visit_status, origin_data, client_data')
      .order('visit_date', { ascending: true });
    if (error) {
      console.error('DashboardPage loadData error:', error);
      setLoadError(error.message);
    } else {
      const sorted = (data || []).sort(sortByDateTime);
      setVisits(sorted);
      scheduleVisitReminders(sorted);
    }
    setLoading(false);
  };

  const handleVisitCreated = (newVisit) => {
    if (newVisit._pending) {
      // Visite créée hors-ligne → file d'attente locale
      setOfflineVisits(prev => [...prev, newVisit].sort(sortByDateTime));
    } else {
      setVisits(prev => [...prev, newVisit].sort(sortByDateTime));
      setJustCreated(newVisit.id);
      setTimeout(() => setJustCreated(null), 4000);
    }
    setShowNewVisit(false);
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
    // Suppression d'une visite hors-ligne (non encore synchronisée)
    const offlineVisit = offlineVisits.find(v => v._offlineId === id);
    if (offlineVisit) {
      removeOfflineVisit(id);
      setOfflineVisits(prev => prev.filter(v => v._offlineId !== id));
      setConfirmDelete(null);
      return;
    }
    setDeleting(id);
    const { error } = await supabase.from('visits').delete().eq('id', id);
    if (!error) setVisits(prev => prev.filter(v => v.id !== id));
    setConfirmDelete(null);
    setDeleting(null);
  };

  const allVisits = [...visits, ...offlineVisits];
  const displayName = profile?.first_name || user?.email?.split('@')[0] || '';
  const upcoming  = allVisits.filter(v => v.visit_date >= today && (v.visit_status || 'prevue') !== 'annulee');
  const monthVisits = allVisits.filter(v => v.visit_date >= firstOfMonth && v.visit_date <= today);
  const nextVisit = upcoming[0];

  return (
    <>
      <div className="dashboard">
        {/* En-tête */}
        <div className="dashboard-welcome">
          <div className="dashboard-hi">
            {isFr ? `Bonjour, ${displayName} 👋` : `Hello, ${displayName} 👋`}
          </div>
          <div className="dashboard-sub">
            {upcoming.length > 0
              ? (isFr
                  ? `${upcoming.length} visite${upcoming.length > 1 ? 's' : ''} à venir`
                  : `${upcoming.length} upcoming visit${upcoming.length > 1 ? 's' : ''}`)
              : (isFr ? 'Aucune visite planifiée' : 'No visits planned')}
          </div>
        </div>

        {/* Badge plan */}
        {(() => {
          const plan = profile?.plan || 'free';
          const b = PLAN_BADGE[plan] || PLAN_BADGE.free;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span
                style={{ background: b.bg, color: b.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setViewMode('pricing')}
              >
                {b.label}
              </span>
              {plan === 'free' && (
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {allVisits.length}/{FREE_VISIT_LIMIT} {isFr ? 'visites' : 'visits'}
                </span>
              )}
            </div>
          );
        })()}

        {/* CTA Nouvelle visite */}
        <button className="dashboard-cta" onClick={() => {
          const plan = profile?.plan || 'free';
          if (plan === 'free' && allVisits.length >= FREE_VISIT_LIMIT) {
            setShowUpgradeModal(true);
          } else {
            setShowNewVisit(true);
          }
        }}>
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
                <div className="stat-card-num" style={{ fontSize: nextVisit ? '12px' : '20px' }}>
                  {nextVisit ? (
                    <>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--accent)' }}>
                        {nextVisit.client_name?.split(' ')[0] || '—'}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text2)' }}>
                        {formatDateShort(nextVisit.visit_date, isFr)}
                        {nextVisit.visit_time ? ` ${nextVisit.visit_time.replace(':', 'h')}` : ''}
                      </div>
                    </>
                  ) : '—'}
                </div>
                <div className="stat-card-label">{isFr ? 'prochaine visite' : 'next visit'}</div>
              </div>
            </div>

            {/* Toast sync */}
            {syncedVisitName && (
              <div style={{
                fontSize: '13px', fontWeight: '700', color: '#16A34A',
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                borderRadius: '8px', padding: '10px 14px', marginBottom: '12px',
              }}>
                ✅ {isFr
                  ? `Visite de ${syncedVisitName} synchronisée !`
                  : `Visit for ${syncedVisitName} synced!`}
              </div>
            )}

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
                  const vid = v._offlineId || v.id;
                  return (
                    <div key={vid}>
                      {justCreated === v.id && (
                        <div style={{
                          fontSize: '12px', fontWeight: '700', color: 'var(--accent)',
                          marginBottom: '4px', letterSpacing: '0.04em',
                        }}>
                          ✅ {isFr ? 'Visite créée !' : 'Visit created!'}
                        </div>
                      )}
                      <VisitCard
                        visit={v}
                        isPast={false}
                        isPending={!!v._pending}
                        isOpening={opening === vid}
                        isConfirmingDelete={confirmDelete === vid}
                        isDeleting={deleting === vid}
                        onOpen={openVisit}
                        onDeleteRequest={id => setConfirmDelete(id)}
                        onDeleteConfirm={handleDelete}
                        onDeleteCancel={() => setConfirmDelete(null)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {showNewVisit && (
        <NewVisitModal
          onClose={() => setShowNewVisit(false)}
          onCreated={handleVisitCreated}
        />
      )}

      {/* Modal limite plan gratuit */}
      {showUpgradeModal && (
        <div
          onClick={() => setShowUpgradeModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 480 }}
          >
            <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>🚀</div>
            <div style={{ fontWeight: 800, fontSize: 18, textAlign: 'center', marginBottom: 8 }}>
              {isFr ? 'Limite du plan gratuit atteinte' : 'Free plan limit reached'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text2)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
              {isFr
                ? `Le plan gratuit est limité à ${FREE_VISIT_LIMIT} visites. Passez au Plan Pro à 9,99€/mois pour des visites illimitées, des photos et un PDF complet.`
                : `The free plan is limited to ${FREE_VISIT_LIMIT} visits. Upgrade to Pro at 9.99€/month for unlimited visits, photos and full PDF.`}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 15, marginBottom: 10 }}
              onClick={() => { setShowUpgradeModal(false); openProCheckout(user?.email); }}
            >
              {isFr ? "S'abonner au Plan Pro à 9,99€/mois →" : 'Subscribe to Pro at 9.99€/month →'}
            </button>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', fontSize: 14 }}
              onClick={() => setShowUpgradeModal(false)}
            >
              {isFr ? 'Plus tard' : 'Later'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
