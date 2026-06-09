export const PRO_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK_PRO || '';

export function openProCheckout(userEmail) {
  if (!PRO_PAYMENT_LINK) {
    alert('Lien de paiement non configuré. Contactez contact@moveupapp.com');
    return;
  }
  const url = userEmail
    ? `${PRO_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(userEmail)}`
    : PRO_PAYMENT_LINK;
  window.open(url, '_blank');
}
