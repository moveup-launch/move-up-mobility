import { loadStripe } from '@stripe/stripe-js';

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
export const stripePromise = key ? loadStripe(key) : null;

export const PLANS = {
  pro: {
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || '',
    amount: 29,
    currency: 'EUR',
  },
  enterprise: {
    priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID || '',
    amount: 79,
    currency: 'EUR',
  },
};

export async function redirectToCheckout(priceId, userId, userEmail) {
  if (!stripePromise) {
    alert('Stripe non configuré. Ajoutez VITE_STRIPE_PUBLISHABLE_KEY dans votre .env');
    return;
  }
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, userId, userEmail }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'Erreur lors de la création de la session Stripe');
    return;
  }
  const { sessionId } = await res.json();
  const stripe = await stripePromise;
  await stripe.redirectToCheckout({ sessionId });
}
