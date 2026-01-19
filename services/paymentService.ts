export const getDodoPaymentLink = (packId: string, currency: 'USD' | 'INR' = 'USD') => {
  // Unified pricing: $9.99 for all locations (Pro Unlimited tier only)
  const baseUrl = import.meta.env.VITE_DODO_LINK_PRO || '#';

  // Append return_url - Dodo will redirect back with this in the hash
  // Our App.tsx payment handler now checks both query params AND hash for payment_success
  const returnUrl = `${window.location.origin}/?payment_success=true`;
  const separator = baseUrl.includes('?') ? '&' : '?';

  return `${baseUrl}${separator}return_url=${encodeURIComponent(returnUrl)}`;
};
