export const PRO_PAYMENT_LINK = 'https://buy.stripe.com/aFadR970uaojcRPaz67kc00';

export function openProCheckout(userEmail) {
  const url = userEmail
    ? `${PRO_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(userEmail)}`
    : PRO_PAYMENT_LINK;
  window.open(url, '_blank');
}
