import { Capacitor } from '@capacitor/core';

export const PRO_PAYMENT_LINK = 'https://buy.stripe.com/aFadR970uaojcRPaz67kc00';

// Apple (et Google) interdisent de vendre un abonnement numerique deblocable
// dans l'app via un moyen de paiement externe (ici Stripe) sans passer par
// leur propre systeme d'achat integre (App Store Review Guidelines 3.1.1).
// Sur la version native (iOS/Android via Capacitor), on ne doit donc jamais
// ouvrir Stripe depuis l'app -- seule la version web (moveupapp.com) peut.
export function isNativeApp() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function openProCheckout(userEmail, userId) {
  if (isNativeApp()) return; // sécurité : les boutons sont censés être masqués en amont sur natif
  const params = new URLSearchParams();
  if (userEmail) params.set('prefilled_email', userEmail);
  // client_reference_id : transmis à Stripe puis renvoyé dans le webhook
  // (session.client_reference_id) → permet d'identifier QUEL compte passer en Pro.
  if (userId) params.set('client_reference_id', userId);
  const qs = params.toString();
  const url = qs ? `${PRO_PAYMENT_LINK}?${qs}` : PRO_PAYMENT_LINK;
  window.open(url, '_blank');
}

export async function openBillingPortal(userId) {
  if (isNativeApp()) return; // sécurité : les boutons sont censés être masqués en amont sur natif
  const isFr = typeof navigator === 'undefined' || navigator.language?.toLowerCase().startsWith('fr');
  const noCustomerMsg = isFr
    ? 'Aucun abonnement actif à gérer. Si vous venez de vous abonner, réessayez dans quelques instants.'
    : 'No active subscription to manage. If you just subscribed, please try again in a few moments.';
  const genericMsg = isFr
    ? "Impossible d'ouvrir le portail de facturation. Réessayez plus tard."
    : 'Unable to open the billing portal. Please try again later.';

  try {
    const res = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.url) {
      alert(data.error === 'no_customer' ? noCustomerMsg : genericMsg);
      return;
    }

    // new URL() rejette toute chaîne vide/malformée avant qu'on touche à location.href
    // (c'est ce qui provoquait "The string did not match the expected pattern").
    let validUrl;
    try {
      validUrl = new URL(data.url).toString();
    } catch {
      alert(genericMsg);
      return;
    }

    window.location.href = validUrl;
  } catch (err) {
    console.error('openBillingPortal error:', err);
    alert(genericMsg);
  }
}
