export const PRO_PAYMENT_LINK = 'https://buy.stripe.com/test_14A9ATevfd9WdXr4zU0Jq00';

export function openProCheckout(userEmail) {
  const url = userEmail
    ? `${PRO_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(userEmail)}`
    : PRO_PAYMENT_LINK;
  window.open(url, '_blank');
}
