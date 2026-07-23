import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import BoxMascot from '../components/BoxMascot';

export default function ClientTrackingPage({ token }) {
  const [lang] = useState((navigator.language || 'fr').startsWith('fr') ? 'fr' : 'en');
  const isFr = lang === 'fr';
  const [visit, setVisit] = useState(null);
  const [status, setStatus] = useState(token ? 'loading' : 'notfound');

  useEffect(() => {
    if (!token) return;
    supabase
      .from('public_visit_tracking')
      .select('*')
      .eq('share_token', token)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setStatus('notfound'); return; }
        setVisit(data);
        setStatus('found');
      });
  }, [token]);

  const statusInfo = {
    prevue:   { label: isFr ? 'Visite planifiée' : 'Visit planned', color: '#2B6BE6' },
    en_cours: { label: isFr ? 'Visite en cours' : 'Visit in progress', color: '#C8862A' },
    terminee: { label: isFr ? 'Visite réalisée' : 'Visit completed', color: '#2A9D5C' },
    annulee:  { label: isFr ? 'Visite annulée' : 'Visit cancelled', color: '#9B9790' },
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg, #F7F6F2)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'var(--font)',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '32px 24px', maxWidth: '400px',
        width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(26,25,23,0.08)',
      }}>
        {status === 'loading' && (
          <>
            <BoxMascot mood="loading" size={56} />
            <p style={{ color: '#6B6862', marginTop: 12 }}>{isFr ? 'Chargement…' : 'Loading…'}</p>
          </>
        )}

        {status === 'notfound' && (
          <>
            <BoxMascot mood="neutral" size={56} />
            <h2 style={{ marginTop: 12 }}>{isFr ? 'Lien introuvable' : 'Link not found'}</h2>
            <p style={{ color: '#6B6862', fontSize: 14 }}>
              {isFr
                ? "Ce lien de suivi n'est plus valide. Contactez votre déménageur pour plus d'informations."
                : 'This tracking link is no longer valid. Please contact your mover for more information.'}
            </p>
          </>
        )}

        {status === 'found' && visit && (
          <>
            <BoxMascot mood={visit.visit_status === 'terminee' ? 'happy' : 'neutral'} size={56} />
            <h2 style={{ margin: '12px 0 4px', fontSize: 22 }}>
              {isFr ? 'Bonjour' : 'Hello'}{visit.client_first_name ? ` ${visit.client_first_name}` : ''} 👋
            </h2>
            <div style={{
              display: 'inline-block', marginTop: 6, marginBottom: 20, padding: '4px 14px',
              borderRadius: 20, fontSize: 13, fontWeight: 700,
              color: (statusInfo[visit.visit_status] || statusInfo.prevue).color,
              background: `${(statusInfo[visit.visit_status] || statusInfo.prevue).color}18`,
            }}>
              {(statusInfo[visit.visit_status] || statusInfo.prevue).label}
            </div>

            <div style={{ textAlign: 'left', borderTop: '1px solid #E4E2DB', paddingTop: 16, marginTop: 4 }}>
              {visit.visit_date && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
                  <span style={{ color: '#6B6862' }}>{isFr ? 'Date de visite' : 'Visit date'}</span>
                  <strong>{visit.visit_date}</strong>
                </div>
              )}
              {visit.origin_city && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
                  <span style={{ color: '#6B6862' }}>{isFr ? 'Départ' : 'Origin'}</span>
                  <strong>{visit.origin_city}</strong>
                </div>
              )}
              {visit.destination_city && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
                  <span style={{ color: '#6B6862' }}>{isFr ? 'Arrivée' : 'Destination'}</span>
                  <strong>{visit.destination_city}</strong>
                </div>
              )}
              {visit.room_count > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
                  <span style={{ color: '#6B6862' }}>{isFr ? 'Pièces inventoriées' : 'Rooms surveyed'}</span>
                  <strong>{visit.room_count}</strong>
                </div>
              )}
              {visit.total_volume > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
                  <span style={{ color: '#6B6862' }}>{isFr ? 'Volume estimé' : 'Estimated volume'}</span>
                  <strong>{Number(visit.total_volume).toFixed(1)} m³</strong>
                </div>
              )}
            </div>

            <p style={{ fontSize: 12, color: '#9B9790', marginTop: 20 }}>
              {isFr
                ? "Une question ? Contactez directement votre commercial déménagement."
                : 'Any question? Contact your moving consultant directly.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
