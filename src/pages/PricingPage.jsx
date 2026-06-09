import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { redirectToCheckout, PLANS } from '../lib/stripe';

export default function PricingPage() {
  const { lang, user, profile } = useApp();
  const isFr = lang === 'fr';
  const [loading, setLoading] = useState(null);
  const currentPlan = profile?.plan || 'free';
  const ACCENT = '#2B6BE6';
  const GOLD = '#D4A017';

  const handleCheckout = async (planKey) => {
    if (!PLANS[planKey]?.priceId) {
      alert(isFr ? 'Stripe non configuré. Contactez-nous à contact@moveupapp.com' : 'Stripe not configured. Contact us at contact@moveupapp.com');
      return;
    }
    setLoading(planKey);
    await redirectToCheckout(PLANS[planKey].priceId, user?.id, user?.email);
    setLoading(null);
  };

  const planBadgeStyle = {
    free: { bg: '#F0EFE9', color: '#6B6860', label: isFr ? 'Plan Gratuit' : 'Free Plan' },
    pro: { bg: '#EEF3FD', color: ACCENT, label: 'Plan Pro' },
    enterprise: { bg: '#FBF5E6', color: GOLD, label: isFr ? 'Plan Entreprise' : 'Enterprise Plan' },
  };
  const badge = planBadgeStyle[currentPlan] || planBadgeStyle.free;

  return (
    <>
      <div className="section-header">
        <div className="section-title">{isFr ? 'Abonnement' : 'Subscription'}</div>
        <div className="section-subtitle">
          <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
            {badge.label}
          </span>
        </div>
      </div>

      {currentPlan !== 'free' && (
        <div className="card" style={{ borderLeft: `3px solid ${currentPlan === 'pro' ? ACCENT : GOLD}`, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            {currentPlan === 'pro' ? '🔵 Plan Pro actif' : '🟡 Plan Entreprise actif'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            {isFr ? 'Statut : ' : 'Status: '}{profile?.subscription_status || '—'}
          </div>
        </div>
      )}

      {/* Gratuit */}
      <div className="card" style={{ marginBottom: 12, opacity: currentPlan === 'free' ? 1 : 0.7 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{isFr ? 'Gratuit' : 'Free'}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1917' }}>0 €<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text3)' }}>/mois</span></div>
          </div>
          {currentPlan === 'free' && (
            <span style={{ background: '#F0EFE9', color: '#6B6860', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              {isFr ? 'Actuel' : 'Current'}
            </span>
          )}
        </div>
        <ul style={{ listStyle: 'none', fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
          <li>✓ {isFr ? '3 visites par mois' : '3 visits per month'}</li>
          <li>✓ {isFr ? 'PDF basique' : 'Basic PDF'}</li>
          <li>✓ {isFr ? '5 photos par visite' : '5 photos per visit'}</li>
        </ul>
      </div>

      {/* Pro */}
      <div className="card" style={{ marginBottom: 12, border: currentPlan === 'pro' ? `2px solid ${ACCENT}` : '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: ACCENT }}>Pro</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1917' }}>29 €<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text3)' }}>/mois</span></div>
          </div>
          {currentPlan === 'pro' ? (
            <span style={{ background: '#EEF3FD', color: ACCENT, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              {isFr ? 'Actuel' : 'Current'}
            </span>
          ) : (
            <span style={{ background: '#EEF3FD', color: ACCENT, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              {isFr ? 'Populaire' : 'Popular'}
            </span>
          )}
        </div>
        <ul style={{ listStyle: 'none', fontSize: 13, color: 'var(--text2)', lineHeight: 2, marginBottom: 12 }}>
          <li>✓ {isFr ? 'Visites illimitées' : 'Unlimited visits'}</li>
          <li>✓ {isFr ? 'PDF complet avec photos' : 'Full PDF with photos'}</li>
          <li>✓ {isFr ? 'Photos illimitées' : 'Unlimited photos'}</li>
          <li>✓ {isFr ? 'Historique complet' : 'Full history'}</li>
          <li>✓ {isFr ? 'Support email' : 'Email support'}</li>
        </ul>
        {currentPlan !== 'pro' && currentPlan !== 'enterprise' && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            onClick={() => handleCheckout('pro')}
            disabled={loading === 'pro'}
          >
            {loading === 'pro' ? '...' : (isFr ? 'Passer au plan Pro →' : 'Upgrade to Pro →')}
          </button>
        )}
      </div>

      {/* Entreprise */}
      <div className="card" style={{ marginBottom: 12, border: currentPlan === 'enterprise' ? `2px solid ${GOLD}` : '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: GOLD }}>{isFr ? 'Entreprise' : 'Enterprise'}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1917' }}>79 €<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text3)' }}>/mois</span></div>
          </div>
          {currentPlan === 'enterprise' && (
            <span style={{ background: '#FBF5E6', color: GOLD, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              {isFr ? 'Actuel' : 'Current'}
            </span>
          )}
        </div>
        <ul style={{ listStyle: 'none', fontSize: 13, color: 'var(--text2)', lineHeight: 2, marginBottom: 12 }}>
          <li>✓ {isFr ? 'Tout le plan Pro' : 'Everything in Pro'}</li>
          <li>✓ {isFr ? 'Multi-utilisateurs' : 'Multi-users'}</li>
          <li>✓ {isFr ? 'Marque blanche PDF' : 'White-label PDF'}</li>
          <li>✓ {isFr ? 'Support prioritaire' : 'Priority support'}</li>
          <li>✓ {isFr ? 'Onboarding personnalisé' : 'Custom onboarding'}</li>
        </ul>
        {currentPlan !== 'enterprise' && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', background: GOLD, borderColor: GOLD }}
            onClick={() => handleCheckout('enterprise')}
            disabled={loading === 'enterprise'}
          >
            {loading === 'enterprise' ? '...' : (isFr ? 'Passer au plan Entreprise →' : 'Upgrade to Enterprise →')}
          </button>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', padding: '8px 0 24px' }}>
        {isFr ? 'Paiement sécurisé via Stripe · Annulable à tout moment' : 'Secure payment via Stripe · Cancel anytime'}
      </div>
    </>
  );
}
