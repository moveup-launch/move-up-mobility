export const PRO_PAYMENT_LINK = 'https://buy.stripe.com/aFadR970uaojcRPaz67kc00';

export function openProCheckout(userEmail, userId) {
  const params = new URLSearchParams();
  if (userEmail) params.set('prefilled_email', userEmail);
  // client_reference_id : transmis à Stripe puis renvoyé dans le webhook
  // (session.client_reference_id) → permet d'identifier QUEL compte passer en Pro.
  if (userId) params.set('client_reference_id', userId);
  const qs = params.toString();
  const url = qs ? `${PRO_PAYMENT_LINK}?${qs}` : PRO_PAYMENT_LINK;
  window.open(url, '_blank');
}
